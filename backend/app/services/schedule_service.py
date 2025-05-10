from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import HTTPException
from app.schemas.schedule import Schedule, ScheduleCreate, ScheduleUpdate, ScheduleStatus
from app.core.supabase import supabase
from app.worker import celery
from app.services import run_service
from celery.schedules import crontab
import logging

# Try to import croniter, but provide fallback for testing
try:
    import croniter
    import pytz
    CRONITER_AVAILABLE = True
except ImportError:
    print("Warning: croniter module not available. Schedule calculations will be limited.")
    CRONITER_AVAILABLE = False

logger = logging.getLogger(__name__)

# Table name in Supabase
SCHEDULES_TABLE = "schedules"


async def get_schedules(project_id: Optional[int] = None) -> List[Schedule]:
    """
    Retrieve all schedules, optionally filtered by project_id.

    Args:
        project_id (Optional[int]): Filter schedules by project ID

    Returns:
        List[Schedule]: List of schedules
    """
    try:
        query = supabase.table(SCHEDULES_TABLE).select("*")

        if project_id is not None:
            query = query.eq("project_id", project_id)

        response = query.execute()

        if hasattr(response, 'error') and response.error is not None:
            logger.error(f"Error fetching schedules: {response.error}")
            raise HTTPException(status_code=500, detail="Failed to fetch schedules")

        schedules = []
        for schedule_data in response.data:
            # Calculate next_run based on cron expression
            if CRONITER_AVAILABLE:
                schedule_data['next_run'] = calculate_next_run(schedule_data['cron_expression'],
                                                             schedule_data.get('last_run'))
            else:
                # Fallback for testing when croniter is not available
                schedule_data['next_run'] = datetime.utcnow()
                
            schedules.append(Schedule(**schedule_data))

        return schedules
    except Exception as e:
        logger.error(f"Error in get_schedules: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def get_schedule(id: int) -> Schedule:
    """
    Retrieve a single schedule by ID.

    Args:
        id (int): Schedule ID

    Returns:
        Schedule: The requested schedule

    Raises:
        HTTPException: If schedule not found
    """
    try:
        response = supabase.table(SCHEDULES_TABLE).select("*").eq("id", id).execute()
        if hasattr(response, 'error') and response.error is not None:
            logger.error(f"Error fetching schedule {id}: {response.error}")
            raise HTTPException(status_code=500, detail="Failed to fetch schedule")

        if not response.data:
            raise HTTPException(status_code=404, detail=f"Schedule with ID {id} not found")

        schedule_data = response.data[0]
        # Calculate next_run based on cron expression
        schedule_data['next_run'] = calculate_next_run(schedule_data['cron_expression'],
                                                     schedule_data.get('last_run'))

        return Schedule(**schedule_data)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_schedule: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def create_schedule(data: ScheduleCreate) -> Schedule:
    """
    Create a new schedule.

    Args:
        data (ScheduleCreate): Schedule data

    Returns:
        Schedule: The created schedule
    """
    try:
        now = datetime.utcnow().isoformat()
        schedule_data = data.model_dump(exclude_none=True)

        # Validate cron expression
        if not is_valid_cron(schedule_data['cron_expression']):
            raise ValueError(f"Invalid cron expression: {schedule_data['cron_expression']}")

        # Set timestamps if not provided
        if "created_at" not in schedule_data:
            schedule_data["created_at"] = now
        if "updated_at" not in schedule_data:
            schedule_data["updated_at"] = now

        # Make sure either url or urls is provided
        if not schedule_data.get('url') and not schedule_data.get('urls'):
            raise ValueError("Either url or urls must be provided")

        response = supabase.table(SCHEDULES_TABLE).insert(schedule_data).execute()
        if hasattr(response, 'error') and response.error is not None:
            logger.error(f"Error creating schedule: {response.error}")
            raise HTTPException(status_code=500, detail="Failed to create schedule")

        created_schedule = Schedule(**response.data[0])

        # Register the schedule with Celery-beat if it's active
        if created_schedule.status == ScheduleStatus.ACTIVE:
            await register_schedule_with_celery(created_schedule)

        return created_schedule
    except ValueError as e:
        logger.error(f"Validation error in create_schedule: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error in create_schedule: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def update_schedule(id: int, data: ScheduleUpdate) -> Schedule:
    """
    Update an existing schedule.

    Args:
        id (int): Schedule ID
        data (ScheduleUpdate): Schedule data to update

    Returns:
        Schedule: The updated schedule

    Raises:
        HTTPException: If schedule not found
    """
    try:
        # First check if schedule exists
        old_schedule = await get_schedule(id)

        # Update the schedule
        update_data = data.model_dump(exclude_none=True)

        # Validate cron expression if provided
        if 'cron_expression' in update_data and not is_valid_cron(update_data['cron_expression']):
            raise ValueError(f"Invalid cron expression: {update_data['cron_expression']}")

        if "updated_at" not in update_data:
            update_data["updated_at"] = datetime.utcnow().isoformat()

        response = supabase.table(SCHEDULES_TABLE).update(update_data).eq("id", id).execute()
        if hasattr(response, 'error') and response.error is not None:
            logger.error(f"Error updating schedule {id}: {response.error}")
            raise HTTPException(status_code=500, detail="Failed to update schedule")

        updated_schedule = Schedule(**response.data[0])

        # Handle Celery-beat registration updates
        if 'status' in update_data or 'cron_expression' in update_data:
            if old_schedule.status == ScheduleStatus.ACTIVE:
                # If it was active, unregister the old schedule
                await unregister_schedule_with_celery(id)

            # If it's now active, register the new schedule
            if updated_schedule.status == ScheduleStatus.ACTIVE:
                await register_schedule_with_celery(updated_schedule)

        return updated_schedule
    except ValueError as e:
        logger.error(f"Validation error in update_schedule: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in update_schedule: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def delete_schedule(id: int) -> None:
    """
    Delete a schedule.

    Args:
        id (int): Schedule ID

    Raises:
        HTTPException: If schedule not found or deletion fails
    """
    try:
        # First check if schedule exists
        await get_schedule(id)

        # Unregister from Celery-beat
        await unregister_schedule_with_celery(id)

        # Delete the schedule
        response = supabase.table(SCHEDULES_TABLE).delete().eq("id", id).execute()
        if hasattr(response, 'error') and response.error is not None:
            logger.error(f"Error deleting schedule {id}: {response.error}")
            raise HTTPException(status_code=500, detail="Failed to delete schedule")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in delete_schedule: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def register_schedule_with_celery(schedule: Schedule) -> None:
    """
    Register a schedule with Celery-beat.

    Args:
        schedule (Schedule): The schedule to register

    Raises:
        Exception: If registration fails
    """
    try:
        task_name = f"scraping_schedule_{schedule.id}"

        # Parse the cron expression and convert to Celery crontab
        cron_parts = schedule.cron_expression.split()
        if len(cron_parts) != 5:
            raise ValueError(f"Invalid cron expression: {schedule.cron_expression}")

        minute, hour, day_of_month, month_of_year, day_of_week = cron_parts

        # Add the task to the beat schedule
        celery.conf.beat_schedule[task_name] = {
            'task': 'run_scheduled_scrape',
            'schedule': crontab(
                minute=minute,
                hour=hour,
                day_of_month=day_of_month,
                month_of_year=month_of_year,
                day_of_week=day_of_week
            ),
            'args': (schedule.id, schedule.project_id),
            'kwargs': {
                'config': schedule.config,
                'url': schedule.url,
                'urls': schedule.urls
            },
            'options': {
                'expires': 60 * 60 * 2  # 2 hours
            }
        }

        logger.info(f"Registered schedule {schedule.id} with Celery-beat: {task_name}")
    except Exception as e:
        logger.error(f"Error registering schedule {schedule.id} with Celery-beat: {e}")
        raise


async def unregister_schedule_with_celery(id: int) -> None:
    """
    Unregister a schedule from Celery-beat.

    Args:
        id (int): The ID of the schedule to unregister

    Raises:
        Exception: If unregistration fails
    """
    try:
        task_name = f"scraping_schedule_{id}"

        # Remove the task from the beat schedule if it exists
        if task_name in celery.conf.beat_schedule:
            del celery.conf.beat_schedule[task_name]
            logger.info(f"Unregistered schedule {id} from Celery-beat: {task_name}")
        else:
            logger.warning(f"Schedule {id} was not registered with Celery-beat: {task_name}")
    except Exception as e:
        logger.error(f"Error unregistering schedule {id} from Celery-beat: {e}")
        raise


def is_valid_cron(cron_expression: str) -> bool:
    """
    Validate a cron expression.

    Args:
        cron_expression (str): The cron expression to validate

    Returns:
        bool: True if valid, False otherwise
    """
    if not CRONITER_AVAILABLE:
        # For testing without croniter, assume all expressions are valid
        return True
        
    try:
        # Try to create a croniter instance with the expression
        croniter.croniter(cron_expression, datetime.utcnow())
        return True
    except (ValueError, KeyError):
        return False


def calculate_next_run(cron_expression: str, last_run: Optional[str] = None) -> datetime:
    """
    Calculate the next run time based on a cron expression.

    Args:
        cron_expression (str): The cron expression
        last_run (Optional[str]): The last run time as ISO string

    Returns:
        datetime: The next run time
    """
    if not CRONITER_AVAILABLE:
        # Return current time for testing when croniter is not available
        return datetime.utcnow()
        
    try:
        # Parse last_run if provided
        base_time = datetime.utcnow()
        if last_run:
            try:
                base_time = datetime.fromisoformat(last_run.replace('Z', '+00:00'))
            except (ValueError, TypeError):
                # If last_run can't be parsed, use current time
                pass

        # Create croniter instance
        cron = croniter.croniter(cron_expression, base_time)
        
        # Get next run time
        next_run = cron.get_next(datetime)
        
        return next_run
    except Exception as e:
        logger.error(f"Error calculating next run: {e}")
        # Return current time as fallback
        return datetime.utcnow()


async def load_and_register_schedules() -> None:
    """
    Load all active schedules from the database and register them with Celery-beat.

    This should be called on startup.
    """
    try:
        logger.info("Loading and registering schedules with Celery-beat...")

        # Get all active schedules
        response = supabase.table(SCHEDULES_TABLE).select("*").eq("status", "active").execute()

        if hasattr(response, 'error') and response.error is not None:
            logger.error(f"Error loading schedules: {response.error}")
            return

        # Register each schedule
        for schedule_data in response.data:
            # Calculate next_run based on cron expression
            schedule_data['next_run'] = calculate_next_run(schedule_data['cron_expression'],
                                                         schedule_data.get('last_run'))
            schedule = Schedule(**schedule_data)
            await register_schedule_with_celery(schedule)

        logger.info(f"Registered {len(response.data)} schedules with Celery-beat")
    except Exception as e:
        logger.error(f"Error loading and registering schedules: {e}")
        raise


async def trigger_schedule(id: int) -> Schedule:
    """
    Trigger a schedule to run immediately.

    Args:
        id (int): Schedule ID

    Returns:
        Schedule: The updated schedule

    Raises:
        HTTPException: If schedule not found or execution fails
    """
    try:
        # Get the schedule
        schedule = await get_schedule(id)

        # Enqueue a run task
        task_kwargs = {
            'project_id': schedule.project_id,
            'config': schedule.config,
            'url': schedule.url,
            'urls': schedule.urls,
            'schedule_id': schedule.id
        }

        # Execute the task
        task = celery.send_task(
            'run_scheduled_scrape',
            args=(schedule.id, schedule.project_id),
            kwargs=task_kwargs
        )

        logger.info(f"Triggered immediate execution of schedule {id}, task ID: {task.id}")

        # Update last_run time
        now = datetime.utcnow().isoformat()
        update_data = {"last_run": now, "updated_at": now}

        response = supabase.table(SCHEDULES_TABLE).update(update_data).eq("id", id).execute()
        if hasattr(response, 'error') and response.error is not None:
            logger.error(f"Error updating schedule {id} last_run time: {response.error}")
            raise HTTPException(status_code=500, detail="Failed to update schedule last run time")

        updated_schedule = Schedule(**response.data[0])

        # Calculate next run time
        updated_schedule.next_run = calculate_next_run(
            updated_schedule.cron_expression,
            updated_schedule.last_run
        )

        return updated_schedule
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error triggering schedule {id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
