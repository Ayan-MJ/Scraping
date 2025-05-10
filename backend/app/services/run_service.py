from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import HTTPException
from app.schemas.run import Run, RunCreate, RunUpdate, RunStatus
from app.core.supabase import supabase
from app.worker import celery
import logging

logger = logging.getLogger(__name__)

# Table name in Supabase
RUNS_TABLE = "runs"


async def get_runs(project_id: Optional[int] = None) -> List[Run]:
    """
    Retrieve all runs, optionally filtered by project_id.

    Args:
        project_id (Optional[int]): Filter runs by project ID

    Returns:
        List[Run]: List of runs
    """
    try:
        query = supabase.table(RUNS_TABLE).select("*")

        if project_id is not None:
            query = query.eq("project_id", project_id)

        response = query.execute()

        if hasattr(response, 'error') and response.error is not None:
            logger.error(f"Error fetching runs: {response.error}")
            raise HTTPException(status_code=500, detail="Failed to fetch runs")

        return [Run(**run) for run in response.data]
    except Exception as e:
        logger.error(f"Error in get_runs: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def get_run(id: int) -> Run:
    """
    Retrieve a single run by ID.

    Args:
        id (int): Run ID

    Returns:
        Run: The requested run

    Raises:
        HTTPException: If run not found
    """
    try:
        response = supabase.table(RUNS_TABLE).select("*").eq("id", id).execute()
        if hasattr(response, 'error') and response.error is not None:
            logger.error(f"Error fetching run {id}: {response.error}")
            raise HTTPException(status_code=500, detail="Failed to fetch run")

        if not response.data:
            raise HTTPException(status_code=404, detail=f"Run with ID {id} not found")

        return Run(**response.data[0])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_run: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def create_run(data: RunCreate) -> Run:
    """
    Create a new run.

    Args:
        data (RunCreate): Run data

    Returns:
        Run: The created run
    """
    try:
        now = datetime.utcnow().isoformat()
        run_data = data.model_dump(exclude_none=True)

        # Set timestamps if not provided
        if "created_at" not in run_data:
            run_data["created_at"] = now
        if "updated_at" not in run_data:
            run_data["updated_at"] = now

        response = supabase.table(RUNS_TABLE).insert(run_data).execute()
        if hasattr(response, 'error') and response.error is not None:
            logger.error(f"Error creating run: {response.error}")
            raise HTTPException(status_code=500, detail="Failed to create run")

        return Run(**response.data[0])
    except Exception as e:
        logger.error(f"Error in create_run: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def update_run(id: int, data: RunUpdate) -> Run:
    """
    Update an existing run.

    Args:
        id (int): Run ID
        data (RunUpdate): Run data to update

    Returns:
        Run: The updated run

    Raises:
        HTTPException: If run not found
    """
    try:
        # First check if run exists
        await get_run(id)

        # Update the run
        update_data = data.model_dump(exclude_none=True)
        if "updated_at" not in update_data:
            update_data["updated_at"] = datetime.utcnow().isoformat()

        response = supabase.table(RUNS_TABLE).update(update_data).eq("id", id).execute()
        if hasattr(response, 'error') and response.error is not None:
            logger.error(f"Error updating run {id}: {response.error}")
            raise HTTPException(status_code=500, detail="Failed to update run")

        return Run(**response.data[0])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in update_run: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def delete_run(id: int) -> None:
    """
    Delete a run.

    Args:
        id (int): Run ID

    Raises:
        HTTPException: If run not found or deletion fails
    """
    try:
        # First check if run exists
        await get_run(id)

        # Delete the run
        response = supabase.table(RUNS_TABLE).delete().eq("id", id).execute()
        if hasattr(response, 'error') and response.error is not None:
            logger.error(f"Error deleting run {id}: {response.error}")
            raise HTTPException(status_code=500, detail="Failed to delete run")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in delete_run: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def enqueue_run(project_id: int, config: Optional[Dict[str, Any]] = None,
                     url: Optional[str] = None, urls: Optional[List[str]] = None) -> Run:
    """
    Create a run with pending status and dispatch a Celery task to process it.

    Args:
        project_id (int): Project ID
        config (Optional[Dict[str, Any]]): Run configuration
        url (Optional[str]): Single URL to scrape
        urls (Optional[List[str]]): List of URLs to scrape

    Returns:
        Run: The created run with pending status
    """
    try:
        # Create a new run with pending status
        run_data = RunCreate(
            project_id=project_id,
            status=RunStatus.PENDING,
            config=config,
            url=url,
            urls=urls
        )

        # Store the run in the database
        run = await create_run(run_data)

        # Dispatch Celery task to process the run
        task = celery.send_task(
            "process_scraping_run",
            args=[run.id, run.project_id, run.model_dump()],
            countdown=1  # Start the task after 1 second
        )

        logger.info(f"Enqueued run {run.id} for project {project_id}, task ID: {task.id}")
        return run
    except Exception as e:
        logger.error(f"Error enqueueing run: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to enqueue run: {str(e)}")
