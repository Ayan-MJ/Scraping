from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


class ScheduleStatus(str, Enum):
    """Status of a schedule."""
    ACTIVE = "active"
    PAUSED = "paused"


class ScheduleBase(BaseModel):
    """Base model for schedule data."""
    project_id: int = Field(..., description="ID of the project this schedule belongs to")
    name: str = Field(..., description="Name of the schedule")
    cron_expression: str = Field(..., description="Cron expression for schedule timing")
    status: ScheduleStatus = Field(ScheduleStatus.ACTIVE, description="Current status of the schedule")
    url: Optional[str] = Field(None, description="URL to scrape (if single URL schedule)")
    urls: Optional[List[str]] = Field(None, description="URLs to scrape (if multiple URLs schedule)")
    config: Optional[Dict[str, Any]] = Field(None, description="Configuration for the schedule")
    description: Optional[str] = Field(None, description="Optional description of the schedule")


class ScheduleCreate(ScheduleBase):
    """Model for creating a new schedule."""
    created_at: Optional[datetime] = Field(None, description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")


class ScheduleUpdate(BaseModel):
    """Model for updating an existing schedule."""
    name: Optional[str] = Field(None, description="Name of the schedule")
    cron_expression: Optional[str] = Field(None, description="Cron expression for schedule timing")
    status: Optional[ScheduleStatus] = Field(None, description="Current status of the schedule")
    url: Optional[str] = Field(None, description="URL to scrape (if single URL schedule)")
    urls: Optional[List[str]] = Field(None, description="URLs to scrape (if multiple URLs schedule)")
    config: Optional[Dict[str, Any]] = Field(None, description="Configuration for the schedule")
    description: Optional[str] = Field(None, description="Optional description of the schedule")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")


class Schedule(ScheduleBase):
    """Model for schedule responses."""
    id: int = Field(..., description="Unique schedule identifier")
    project_id: int = Field(..., description="ID of the project this schedule belongs to")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    last_run_at: Optional[datetime] = Field(None, description="Timestamp of the last run")
    next_run_at: Optional[datetime] = Field(None, description="Timestamp of the next run")

    model_config = {
        "from_attributes": True
    }
