"""
Database model for runs.
"""
from typing import Dict, Any, Optional, List
from datetime import datetime
from ormar import Model, Integer, String, Text, JSON, DateTime, ForeignKey
from app.core.db import BaseMeta
from app.models.project import Project


class Run(Model):
    """
    Database model for a scraping run.
    """
    class Meta(BaseMeta):
        """Metadata for the Run model."""
        tablename = "runs"

    id: int = Integer(primary_key=True)
    project: Optional[Project] = ForeignKey(Project, related_name="runs")
    project_id: int = Integer()
    status: str = String(max_length=50)
    urls: List[str] = JSON(default=list)
    config: Dict[str, Any] = JSON(default=dict)
    stats: Dict[str, Any] = JSON(default=dict)
    error: Optional[str] = Text(nullable=True)
    created_at: datetime = DateTime(default=datetime.utcnow)
    updated_at: Optional[datetime] = DateTime(nullable=True)
    started_at: Optional[datetime] = DateTime(nullable=True)
    completed_at: Optional[datetime] = DateTime(nullable=True)
