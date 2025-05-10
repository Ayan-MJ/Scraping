"""
Schema for scraping results data.
"""
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from datetime import datetime


class ResultBase(BaseModel):
    """Base class for Result schemas."""
    url: str = Field(..., description="The URL that was scraped")
    run_id: int = Field(..., description="ID of the run this result belongs to")
    status: str = Field(..., description="Status of the scraping result (success, failed, etc.)")
    data: Optional[Dict[str, Any]] = Field(default=None, description="Scraped data from the URL")
    error: Optional[str] = Field(default=None, description="Error message if scraping failed")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional metadata about the scraping process")


class ResultCreate(ResultBase):
    """Schema for creating a new Result."""
    pass


class ResultUpdate(BaseModel):
    """Schema for updating an existing Result."""
    status: Optional[str] = Field(default=None, description="Status of the scraping result")
    data: Optional[Dict[str, Any]] = Field(default=None, description="Scraped data from the URL")
    error: Optional[str] = Field(default=None, description="Error message if scraping failed")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional metadata about the scraping process")


class Result(ResultBase):
    """Schema for a complete Result with database fields."""
    id: int = Field(..., description="Unique ID of the result")
    created_at: datetime = Field(..., description="When the result was created")
    updated_at: Optional[datetime] = Field(default=None, description="When the result was last updated")

    class Config:
        """Pydantic config."""
        from_attributes = True 
