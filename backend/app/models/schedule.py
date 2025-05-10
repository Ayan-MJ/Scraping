"""
Database model for scheduling.
"""
from typing import Dict, Any, Optional
from datetime import datetime
from ormar import Model, Integer, String, Text, JSON, DateTime, Boolean, ForeignKey
from app.core.db import BaseMeta
from app.models.project import Project


class Schedule(Model):
    """
    Database model for a scraping schedule.
    """
    class Meta(BaseMeta):
        """Metadata for the Schedule model."""
        tablename = "schedules"

    id: int = Integer(primary_key=True)
    name: str = String(max_length=255)
    description: Optional[str] = Text(nullable=True)
    project: Optional[Project] = ForeignKey(Project, related_name="schedules")
    project_id: int = Integer()
    cron_expression: str = String(max_length=100)
    active: bool = Boolean(default=True)
    last_run: Optional[datetime] = DateTime(nullable=True)
    next_run: Optional[datetime] = DateTime(nullable=True)
    config: Dict[str, Any] = JSON(default=dict)
    created_at: datetime = DateTime(default=datetime.utcnow)
    updated_at: Optional[datetime] = DateTime(nullable=True)
