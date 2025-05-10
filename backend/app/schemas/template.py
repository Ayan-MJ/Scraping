from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime


class TemplateBase(BaseModel):
    """Base model for template data."""
    name: str = Field(..., description="Name of the template")
    description: str = Field(..., description="Description of the template")
    thumbnail_url: str = Field(..., description="URL to template thumbnail image")
    selector_schema: Dict[str, Any] = Field(..., description="JSON schema defining the selectors for this template")


class TemplateCreate(TemplateBase):
    """Model for creating a new template."""
    pass


class TemplateUpdate(BaseModel):
    """Model for updating an existing template."""
    name: Optional[str] = Field(None, description="Name of the template")
    description: Optional[str] = Field(None, description="Description of the template")
    thumbnail_url: Optional[str] = Field(None, description="URL to template thumbnail image")
    selector_schema: Optional[Dict[str, Any]] = Field(None, description="JSON schema defining the selectors for this template")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")


class Template(TemplateBase):
    """Model for template responses."""
    id: int = Field(..., description="Unique template identifier")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True
