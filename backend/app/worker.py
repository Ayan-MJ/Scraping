from celery import Celery, group
from app.core.config import settings
import logging
import time
import requests
from datetime import datetime
import asyncio
import json
import aioredis

# Import and configure Sentry
import sentry_sdk
from sentry_sdk.integrations.celery import CeleryIntegration

# Initialize Sentry for Celery tasks
sentry_sdk.init(
    dsn=settings.SENTRY_DSN,
    integrations=[
        CeleryIntegration(),
    ],
    traces_sample_rate=0.1,
    environment=settings.ENVIRONMENT,
)

logger = logging.getLogger(__name__)

celery = Celery(
    "scraping-wizard",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

# Configure Celery
celery.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

# Global Redis client (initialized once per worker process)
# Ensure REDIS_URL is set in your settings
_redis_client = None

async def get_redis_client():
    global _redis_client
    if _redis_client is None:
        _redis_client = await aioredis.from_url(settings.REDIS_URL)
    return _redis_client

async def publish_event(run_id: int, event_type: str, data: dict):
    redis = await get_redis_client()
    channel = f"run:{run_id}"
    payload = {"type": event_type, "data": data}
    await redis.publish(channel, json.dumps(payload))
    logger.info(f"Published event to {channel}: {event_type}")

# Import tasks modules
# celery.autodiscover_tasks(["app.services.scraper"])

@celery.task(name="test_task")
def test_task():
    """Test task to verify Celery is working."""
    return {"status": "ok", "message": "Task completed successfully"}


@celery.task(name="process_scraping_run", bind=True, max_retries=3)
def process_scraping_run(self, run_id, project_id, run_data):
    """
    Process a scraping run using Playwright to extract data based on selector schema.
    
    Args:
        run_id (int): ID of the run to process
        project_id (int): ID of the project
        run_data (dict): Data of the run
        
    Returns:
        dict: Results of the run
    """
    logger.info(f"Processing scraping run {run_id} for project {project_id}")
    loop = asyncio.new_event_loop() # Create a new event loop for this task
    asyncio.set_event_loop(loop)

    try:
        # Update run status to running and publish event
        update_run_status(run_id, "running")
        loop.run_until_complete(publish_event(run_id, "status", {"records_extracted": 0, "status": "running"}))
        
        # Get project details to get the selector schema
        from app.core.supabase import supabase
        
        # First try to get selector schema from run_data or config
        selector_schema = None
        if run_data.get('config') and run_data['config'].get('selector_schema'):
            selector_schema = run_data['config']['selector_schema']
        
        # If not found, try to get it from the template if a template_id is specified
        if not selector_schema and run_data.get('template_id'):
            template_response = supabase.table("templates").select("selector_schema").eq("id", run_data['template_id']).execute()
            if template_response.data:
                selector_schema = template_response.data[0].get('selector_schema')
        
        # If still not found, get from the project
        if not selector_schema:
            project_response = supabase.table("projects").select("configuration").eq("id", project_id).execute()
            if project_response.data and project_response.data[0].get('configuration'):
                selector_schema = project_response.data[0]['configuration'].get('selector_schema')
        
        if not selector_schema:
            # Publish error status
            loop.run_until_complete(publish_event(run_id, "status", {"status": "failed", "error": "No selector schema found"}))
            raise ValueError("No selector schema found for this run")
        
        # Get the URLs to scrape
        urls = run_data.get('urls', []) or []
        if run_data.get('url'): # Handle single URL case
            if isinstance(run_data.get('url'), str) and run_data.get('url') not in urls:
                 urls.append(run_data.get('url'))
            elif isinstance(run_data.get('url'), list): # if 'url' is a list by mistake
                 urls.extend(u for u in run_data.get('url') if u not in urls)

        if not urls:
            # Publish error status
            loop.run_until_complete(publish_event(run_id, "status", {"status": "failed", "error": "No URLs specified"}))
            raise ValueError("No URLs specified for scraping")
        
        # Use Playwright to scrape each URL
        from playwright.sync_api import sync_playwright
        
        total_records = 0
        all_results = {}
        total_failed = 0
        
        # For simplicity, we'll do sequential processing here
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True)
            
            for url_index, url in enumerate(urls):
                try:
                    logger.info(f"Scraping URL: {url}")
                    page = browser.new_page()
                    page.goto(url, wait_until="networkidle")
                    
                    extracted_data = {}
                    for field_name, field_config in selector_schema.items():
                        selector = field_config.get('selector')
                        field_type = field_config.get('type', 'text')
                        attribute = field_config.get('attribute')
                        try:
                            if field_type == 'text':
                                value = page.locator(selector).first.inner_text()
                            elif field_type == 'html':
                                value = page.locator(selector).first.inner_html()
                            elif field_type == 'link' and attribute:
                                value = page.locator(selector).first.get_attribute(attribute)
                            else:
                                value = page.locator(selector).first.inner_text()
                            extracted_data[field_name] = value
                        except Exception as field_error:
                            logger.warning(f"Failed to extract {field_name} with selector {selector} for {url}: {field_error}")
                            extracted_data[field_name] = None
                    
                    from app.services.result_service import create_result
                    from app.schemas.result import ResultCreate
                    
                    result_data_payload = {
                        "url": url,
                        "title": page.title(),
                        "extracted_at": datetime.utcnow().isoformat(),
                        "fields": extracted_data
                    }
                    
                    # Create a result with status "success"
                    result_obj = ResultCreate(
                        run_id=run_id, 
                        data=result_data_payload,
                        url=url,
                        status="success",
                        error_message=None
                    )
                    # create_result is async, so we run it in the loop
                    persisted_result = loop.run_until_complete(create_result(result_obj))
                    
                    total_records += 1
                    all_results[url] = result_data_payload # Storing the payload, not the DB object

                    # Publish record event
                    loop.run_until_complete(publish_event(run_id, "record", result_data_payload))

                    # Publish status update
                    loop.run_until_complete(publish_event(run_id, "status", {
                        "records_extracted": total_records, 
                        "status": "running",
                        "failed_urls": total_failed
                    }))
                    
                    page.close()
                except Exception as url_error:
                    logger.error(f"Error scraping URL {url}: {url_error}")
                    error_message = str(url_error)
                    
                    # Store the failed result in the database
                    from app.services.result_service import create_result
                    from app.schemas.result import ResultCreate
                    
                    failed_result_obj = ResultCreate(
                        run_id=run_id,
                        data={},  # Empty data for failed scrape
                        url=url,
                        status="failed",
                        error_message=error_message
                    )
                    
                    # Persist failed result
                    loop.run_until_complete(create_result(failed_result_obj))
                    total_failed += 1
                    
                    all_results[url] = {"error": error_message}
                    
                    # Publish error event for this URL
                    loop.run_until_complete(publish_event(run_id, "url_error", {
                        "url": url, 
                        "error": error_message
                    }))
            
            browser.close()
        
        # Update run with results summary and mark as completed
        finished_at = datetime.utcnow().isoformat()
        supabase.table("runs").update({
            "status": "completed",
            "records_extracted": total_records,
            "results": {
                "summary": f"Extracted {total_records} records from {len(urls)} URLs ({total_failed} failed)", 
                "details": all_results,
                "failed_count": total_failed
            },
            "finished_at": finished_at,
            "updated_at": finished_at
        }).eq("id", run_id).execute()
        
        logger.info(f"Completed run {run_id} with {total_records} records extracted and {total_failed} failures")

        # Publish final status and complete event
        loop.run_until_complete(publish_event(run_id, "status", {
            "records_extracted": total_records, 
            "status": "completed",
            "failed_urls": total_failed
        }))
        
        return {
            "status": "completed",
            "run_id": run_id,
            "records_extracted": total_records,
            "results_summary": all_results # Changed to all_results to match payload
        }
    except Exception as e:
        logger.error(f"Error processing run {run_id}: {e}")
        
        # Update run with error
        update_run_error(run_id, str(e)) # This also sets status to 'failed'
        # Publish error status
        loop.run_until_complete(publish_event(run_id, "status", {"records_extracted": total_records, "status": "failed", "error": str(e)}))
        
        # Retry if appropriate
        try:
            # Before retrying, you might want to clean up the event loop if it's to be reused,
            # or ensure each retry gets a fresh one. Since we create it at the start of the task, it should be fine.
            raise self.retry(exc=e, countdown=60)
        except Exception: # self.retry will raise an exception that Celery catches for retries, or MaxRetriesExceededError
             # This block is reached if retries are exhausted or retry is not called.
            loop.run_until_complete(publish_event(run_id, "status", {"status": "failed", "error": str(e), "final_attempt": True }))
            return {
                "status": "failed",
                "run_id": run_id,
                "error": str(e)
            }
    finally:
        loop.close() # Close the event loop


@celery.task(name="scrape_url", bind=True, max_retries=3)
def scrape_url(self, url, selector_schema, run_id):
    """
    Scrape a single URL using Playwright.
    This is a subtask that can be used in a group for parallel processing.
    
    Args:
        url (str): URL to scrape
        selector_schema (dict): Selector schema defining what to extract
        run_id (int): ID of the parent run
        
    Returns:
        dict: Extracted data
    """
    logger.info(f"Scraping URL: {url} for run {run_id}")
    
    try:
        from playwright.sync_api import sync_playwright
        
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(url, wait_until="networkidle")
            
            # Extract data based on selector schema
            extracted_data = {}
            
            for field_name, field_config in selector_schema.items():
                selector = field_config.get('selector')
                field_type = field_config.get('type', 'text')
                attribute = field_config.get('attribute')
                
                try:
                    element = page.locator(selector).first
                    
                    if field_type == 'text':
                        value = page.locator(selector).inner_text()
                    elif field_type == 'html':
                        value = page.locator(selector).inner_html()
                    elif field_type == 'link' and attribute:
                        value = page.locator(selector).get_attribute(attribute)
                    else:
                        value = page.locator(selector).inner_text()
                        
                    extracted_data[field_name] = value
                except Exception as field_error:
                    logger.warning(f"Failed to extract {field_name} with selector {selector}: {field_error}")
                    extracted_data[field_name] = None
            
            # Create a result record for this URL
            from app.services.result_service import create_result
            from app.schemas.result import ResultCreate
            
            # Store metadata with the extracted data
            result_data = {
                "url": url,
                "title": page.title(),
                "extracted_at": datetime.utcnow().isoformat(),
                "fields": extracted_data
            }
            
            # Create the result asynchronously
            loop = asyncio.get_event_loop()
            if not loop.is_running():
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
            
            result = loop.run_until_complete(
                create_result(
                    ResultCreate(
                        run_id=run_id,
                        data=result_data
                    )
                )
            )
            
            page.close()
            browser.close()
            
            return {
                "url": url,
                "status": "success",
                "data": extracted_data
            }
    except Exception as e:
        logger.error(f"Error scraping URL {url}: {e}")
        
        # Retry if appropriate
        try:
            raise self.retry(exc=e, countdown=30)  # Retry after 30 seconds
        except Exception:
            return {
                "url": url,
                "status": "failed",
                "error": str(e)
            }


def update_run_status(run_id, status):
    """
    Update the status of a run.
    
    Args:
        run_id (int): ID of the run
        status (str): New status
    """
    try:
        # In a real implementation, this would use the API to update the run
        # But for simplicity, we'll use direct Supabase calls
        from app.core.supabase import supabase
        
        supabase.table("runs").update({
            "status": status,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", run_id).execute()
        
        logger.info(f"Updated run {run_id} status to {status}")
    except Exception as e:
        logger.error(f"Error updating run {run_id} status: {e}")


def update_run_completed(run_id, results):
    """
    Update a run as completed with results.
    
    Args:
        run_id (int): ID of the run
        results (dict): Results of the run
    """
    try:
        from app.core.supabase import supabase
        
        finished_at = datetime.utcnow().isoformat()
        supabase.table("runs").update({
            "status": "completed",
            "results": results,
            "finished_at": finished_at,
            "updated_at": finished_at
        }).eq("id", run_id).execute()
        
        logger.info(f"Updated run {run_id} as completed")
    except Exception as e:
        logger.error(f"Error updating run {run_id} as completed: {e}")


def update_run_error(run_id, error):
    """
    Update a run with an error.
    
    Args:
        run_id (int): ID of the run
        error (str): Error message
    """
    try:
        from app.core.supabase import supabase
        
        finished_at = datetime.utcnow().isoformat()
        supabase.table("runs").update({
            "status": "failed",
            "error": error,
            "finished_at": finished_at,
            "updated_at": finished_at
        }).eq("id", run_id).execute()
        
        logger.info(f"Updated run {run_id} with error: {error}")
    except Exception as e:
        logger.error(f"Error updating run {run_id} with error: {e}")


@celery.task(name="run_scheduled_scrape", bind=True, max_retries=3)
def run_scheduled_scrape(self, schedule_id, project_id, **kwargs):
    """
    Run a scheduled scraping job.
    
    Args:
        schedule_id (int): ID of the schedule
        project_id (int): ID of the project
        **kwargs: Additional arguments for the scraping job
        
    Returns:
        dict: Results of the run
    """
    logger.info(f"Running scheduled scrape for schedule {schedule_id}, project {project_id}")
    
    try:
        from app.core.supabase import supabase
        
        # Create a new run record
        run_data = {
            "project_id": project_id,
            "status": "pending",
            "schedule_id": schedule_id,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        # Add URL or URLs
        if kwargs.get('url'):
            run_data['url'] = kwargs.get('url')
        if kwargs.get('urls'):
            run_data['urls'] = kwargs.get('urls')
            
        # Add configuration if provided
        if kwargs.get('config'):
            run_data['config'] = kwargs.get('config')
            
        # Add template reference if provided
        if kwargs.get('template_id'):
            run_data['template_id'] = kwargs.get('template_id')
        
        # Create the run
        response = supabase.table("runs").insert(run_data).execute()
        
        if hasattr(response, 'error') and response.error is not None:
            raise Exception(f"Failed to create run: {response.error}")
        
        run_id = response.data[0]['id']
        
        logger.info(f"Created run {run_id} for schedule {schedule_id}")
        
        # Update the schedule last_run time
        supabase.table("schedules").update({
            "last_run": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", schedule_id).execute()
        
        # Process the run
        process_scraping_run.delay(run_id, project_id, run_data)
        
        return {
            "status": "enqueued",
            "schedule_id": schedule_id,
            "run_id": run_id
        }
    except Exception as e:
        logger.error(f"Error running scheduled scrape {schedule_id}: {e}")
        
        # Update the schedule with error information
        try:
            supabase.table("schedules").update({
                "last_error": str(e),
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", schedule_id).execute()
        except Exception as update_error:
            logger.error(f"Failed to update schedule {schedule_id} with error: {update_error}")
        
        # Retry if appropriate
        try:
            raise self.retry(exc=e, countdown=60)  # Retry after 60 seconds
        except Exception:
            return {
                "status": "failed",
                "schedule_id": schedule_id,
                "error": str(e)
            } 

@celery.task(name="process_single_url", bind=True, max_retries=3)
def process_single_url(self, run_id, url, selector_schema):
    """
    Process a single URL from a scraping run.
    This is used for retrying failed URLs.
    
    Args:
        run_id (int): ID of the run to process
        url (str): The URL to scrape
        selector_schema (dict): The selector schema to use
        
    Returns:
        dict: Result of the scraping
    """
    logger.info(f"Processing single URL: {url} for run {run_id}")
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        # Use Playwright to scrape the URL
        from playwright.sync_api import sync_playwright
        
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True)
            
            try:
                page = browser.new_page()
                page.goto(url, wait_until="networkidle")
                
                extracted_data = {}
                for field_name, field_config in selector_schema.items():
                    selector = field_config.get('selector')
                    field_type = field_config.get('type', 'text')
                    attribute = field_config.get('attribute')
                    try:
                        if field_type == 'text':
                            value = page.locator(selector).first.inner_text()
                        elif field_type == 'html':
                            value = page.locator(selector).first.inner_html()
                        elif field_type == 'link' and attribute:
                            value = page.locator(selector).first.get_attribute(attribute)
                        else:
                            value = page.locator(selector).first.inner_text()
                        extracted_data[field_name] = value
                    except Exception as field_error:
                        logger.warning(f"Failed to extract {field_name} with selector {selector} for {url}: {field_error}")
                        extracted_data[field_name] = None
                
                from app.services.result_service import create_result
                from app.schemas.result import ResultCreate
                
                result_data_payload = {
                    "url": url,
                    "title": page.title(),
                    "extracted_at": datetime.utcnow().isoformat(),
                    "fields": extracted_data
                }
                
                # Create a result with status "success"
                result_obj = ResultCreate(
                    run_id=run_id, 
                    data=result_data_payload,
                    url=url,
                    status="success",
                    error_message=None
                )
                
                # create_result is async, so we run it in the loop
                persisted_result = loop.run_until_complete(create_result(result_obj))
                
                # Update run record count directly
                from app.core.supabase import supabase
                update_response = supabase.table("runs").select("records_extracted").eq("id", run_id).execute()
                if update_response.data:
                    current_count = update_response.data[0].get("records_extracted", 0) or 0
                    supabase.table("runs").update({"records_extracted": current_count + 1}).eq("id", run_id).execute()
                
                # Publish record event
                loop.run_until_complete(publish_event(run_id, "record", result_data_payload))
                
                page.close()
                return {
                    "status": "success",
                    "url": url,
                    "data": result_data_payload
                }
                
            except Exception as url_error:
                logger.error(f"Error scraping URL {url} during retry: {url_error}")
                error_message = str(url_error)
                
                # Store the failed result in the database, keeping the "failed" status
                from app.services.result_service import create_result
                from app.schemas.result import ResultCreate
                
                failed_result_obj = ResultCreate(
                    run_id=run_id,
                    data={},  # Empty data for failed scrape
                    url=url,
                    status="failed",
                    error_message=error_message
                )
                
                # Persist failed result (update the existing one)
                loop.run_until_complete(create_result(failed_result_obj))
                
                # Publish error event for this URL
                loop.run_until_complete(publish_event(run_id, "url_error", {
                    "url": url, 
                    "error": error_message
                }))
                
                # Retry logic - at this point, retrying failed URLs is itself a retry mechanism
                return {
                    "status": "failed",
                    "url": url,
                    "error": error_message
                }
            finally:
                browser.close()
    except Exception as e:
        logger.error(f"Unexpected error processing URL {url} for run {run_id}: {e}")
        return {
            "status": "failed",
            "url": url,
            "error": str(e)
        }
    finally:
        loop.close() 