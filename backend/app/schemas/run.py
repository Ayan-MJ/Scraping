from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


class RunStatus(str, Enum):
    """Status of a scraping run."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class RunBase(BaseModel):
    """Base model for run data."""
    project_id: int = Field(..., description="ID of the project this run belongs to")
    status: RunStatus = Field(RunStatus.PENDING, description="Current status of the run")
    config: Optional[Dict[str, Any]] = Field(None, description="Configuration for the run")
    url: Optional[str] = Field(None, description="URL to scrape (if single URL run)")
    urls: Optional[List[str]] = Field(None, description="URLs to scrape (if multiple URLs run)")


class RunCreate(RunBase):
    """Model for creating a new run."""
    created_at: Optional[datetime] = Field(None, description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")


class RunUpdate(BaseModel):
    """Model for updating an existing run."""
    status: Optional[RunStatus] = Field(None, description="Current status of the run")
    config: Optional[Dict[str, Any]] = Field(None, description="Configuration for the run")
    results: Optional[Dict[str, Any]] = Field(None, description="Results of the run")
    error: Optional[str] = Field(None, description="Error message if run failed")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")


class Run(RunBase):
    """Model for run responses."""
    id: int = Field(..., description="Unique run identifier")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    results: Optional[Dict[str, Any]] = Field(None, description="Results of the run")
    error: Optional[str] = Field(None, description="Error message if run failed")

    class Config:
        from_attributes = True
