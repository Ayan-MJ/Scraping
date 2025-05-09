from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ProjectBase(BaseModel):
    """Base model for project data."""
    name: str = Field(..., description="Name of the project")
    description: Optional[str] = Field(None, description="Optional description of the project")


class ProjectCreate(ProjectBase):
    """Model for creating a new project."""
    created_at: Optional[datetime] = Field(None, description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")


class ProjectUpdate(BaseModel):
    """Model for updating an existing project."""
    name: Optional[str] = Field(None, description="Name of the project")
    description: Optional[str] = Field(None, description="Description of the project")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")


class Project(ProjectBase):
    """Model for project responses."""
    id: int = Field(..., description="Unique project identifier")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True 