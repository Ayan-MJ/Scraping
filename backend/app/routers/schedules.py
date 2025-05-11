from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Annotated
from app.schemas.schedule import Schedule, ScheduleCreate, ScheduleUpdate, ScheduleStatus
from app.services import schedule_service, project_service
from app.core.auth import get_current_user
from datetime import datetime

router = APIRouter(
    prefix="/schedules",
    tags=["schedules"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=List[Schedule])
async def get_all_schedules(current_user: Annotated[dict, Depends(get_current_user)]):
    """
    Retrieve all schedules owned by the authenticated user.

    Returns:
        List[Schedule]: List of schedules
    """
    return await schedule_service.get_schedules_by_user(current_user.id)


@router.get("/{id}", response_model=Schedule)
async def get_schedule_by_id(id: int, current_user: Annotated[dict, Depends(get_current_user)]):
    """
    Retrieve a schedule by ID if it belongs to the authenticated user.

    Args:
        id (int): Schedule ID

    Returns:
        Schedule: The requested schedule

    Raises:
        HTTPException: If schedule not found or doesn't belong to the user
    """
    return await schedule_service.get_schedule(id, current_user.id)


@router.post("/", response_model=Schedule, status_code=status.HTTP_201_CREATED)
async def create_new_schedule(schedule: ScheduleCreate, current_user: Annotated[dict, Depends(get_current_user)]):
    """
    Create a new schedule for a project owned by the authenticated user.

    Args:
        schedule (ScheduleCreate): Schedule data

    Returns:
        Schedule: The created schedule

    Raises:
        HTTPException: If project not found or doesn't belong to the user
    """
    # Verify that the project belongs to the user
    await project_service.get_project(schedule.project_id, current_user.id)
    return await schedule_service.create_schedule(schedule)


@router.put("/{id}", response_model=Schedule)
async def update_existing_schedule(
    id: int,
    schedule: ScheduleUpdate,
    current_user: Annotated[dict, Depends(get_current_user)]
):
    """
    Update an existing schedule if it belongs to the authenticated user.

    Args:
        id (int): Schedule ID
        schedule (ScheduleUpdate): Schedule data to update

    Returns:
        Schedule: The updated schedule

    Raises:
        HTTPException: If schedule not found or doesn't belong to the user
    """
    return await schedule_service.update_schedule(id, schedule, current_user.id)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_schedule(id: int, current_user: Annotated[dict, Depends(get_current_user)]):
    """
    Delete a schedule if it belongs to the authenticated user.

    Args:
        id (int): Schedule ID

    Raises:
        HTTPException: If schedule not found or doesn't belong to the user
    """
    await schedule_service.delete_schedule(id, current_user.id)
    return None


@router.post("/{id}/pause", response_model=Schedule)
async def pause_schedule(id: int):
    """
    Pause an active schedule.
    """
    update = ScheduleUpdate(status=ScheduleStatus.PAUSED)
    return await schedule_service.update_schedule(id, update)


@router.post("/{id}/activate", response_model=Schedule)
async def activate_schedule(id: int):
    """
    Activate a paused schedule.
    """
    update = ScheduleUpdate(status=ScheduleStatus.ACTIVE)
    return await schedule_service.update_schedule(id, update)


@router.post("/{id}/run-now", response_model=Schedule)
async def run_schedule_now(id: int):
    """
    Trigger a schedule to run immediately.
    """
    return await schedule_service.trigger_schedule(id)
