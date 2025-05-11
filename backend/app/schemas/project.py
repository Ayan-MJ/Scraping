from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class ProjectBase(BaseModel):
    """Base model for project data."""
    name: str = Field(..., description="Name of the project")
    description: Optional[str] = Field(None, description="Optional description of the project")


class ProjectCreate(ProjectBase):
    """Model for creating a new project."""
    # Note: user_id is not included here as it will be set from the authenticated user
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
    user_id: UUID = Field(..., description="ID of the user who owns this project")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = {
        "from_attributes": True
    }
