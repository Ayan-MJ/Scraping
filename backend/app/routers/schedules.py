from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from app.schemas.schedule import Schedule, ScheduleCreate, ScheduleUpdate, ScheduleStatus
from app.services import schedule_service
from datetime import datetime

router = APIRouter(
    prefix="/schedules",
    tags=["schedules"],
    responses={404: {"description": "Not found"}},
)


@router.get("", response_model=List[Schedule])
async def get_schedules(
    project_id: Optional[int] = Query(None, description="Filter schedules by project ID")
):
    """
    Retrieve all schedules, optionally filtered by project ID.
    """
    return await schedule_service.get_schedules(project_id)


@router.get("/{id}", response_model=Schedule)
async def get_schedule(id: int):
    """
    Retrieve a single schedule by ID.
    """
    return await schedule_service.get_schedule(id)


@router.post("", response_model=Schedule, status_code=status.HTTP_201_CREATED)
async def create_schedule(schedule: ScheduleCreate):
    """
    Create a new schedule.
    """
    return await schedule_service.create_schedule(schedule)


@router.put("/{id}", response_model=Schedule)
async def update_schedule(id: int, schedule: ScheduleUpdate):
    """
    Update an existing schedule.
    """
    return await schedule_service.update_schedule(id, schedule)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_schedule(id: int):
    """
    Delete a schedule.
    """
    await schedule_service.delete_schedule(id)
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
