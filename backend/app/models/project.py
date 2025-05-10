"""
Database model for projects.
"""
from typing import Dict, Any, Optional
from datetime import datetime
from ormar import Model, Integer, String, Text, JSON, DateTime
from app.core.db import BaseMeta


class Project(Model):
    """
    Database model for a scraping project.
    """
    class Meta(BaseMeta):
        """Metadata for the Project model."""
        tablename = "projects"

    id: int = Integer(primary_key=True)
    name: str = String(max_length=255)
    description: Optional[str] = Text(nullable=True)
    user_id: str = String(max_length=255)
    configuration: Dict[str, Any] = JSON(default=dict)
    created_at: datetime = DateTime(default=datetime.utcnow)
    updated_at: Optional[datetime] = DateTime(nullable=True)
