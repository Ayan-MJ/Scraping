"""
Schema for scraping results data.
"""
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, Literal
from datetime import datetime


class ResultBase(BaseModel):
    """Base model for result data."""
    run_id: int = Field(..., description="ID of the run this result belongs to")
    data: Dict[str, Any] = Field(..., description="JSON data extracted from the scraping operation")
    url: str = Field(..., description="URL that was scraped")
    status: Literal["success", "failed"] = Field("success", description="Status of the scraping operation")
    error_message: Optional[str] = Field(None, description="Error message if scraping failed")


class ResultCreate(ResultBase):
    """Model for creating a new result."""
    pass


class Result(ResultBase):
    """Model for returning a result."""
    id: int = Field(..., description="Unique identifier for the result")
    created_at: datetime = Field(..., description="When the result was created")

    class Config:
        from_attributes = True


class ResultsResponse(BaseModel):
    """Response model for paginated results."""
    results: list[Result]
    total: int
    page: int
    page_size: int 