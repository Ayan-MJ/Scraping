"""
Database model for scraping results.
"""
from typing import Dict, Any, Optional
from datetime import datetime
from ormar import Model, Integer, String, JSON, DateTime, ForeignKey
from app.core.db import BaseMeta
from app.models.run import Run


class Result(Model):
    """
    Database model for a scraping result.
    """
    class Meta(BaseMeta):
        """Metadata for the Result model."""
        tablename = "results"

    id: int = Integer(primary_key=True)
    url: str = String(max_length=2048)
    run: Optional[Run] = ForeignKey(Run, related_name="results")
    run_id: int = Integer()
    status: str = String(max_length=50)
    data: Dict[str, Any] = JSON(nullable=True)
    error: Optional[str] = String(max_length=10000, nullable=True)
    metadata: Dict[str, Any] = JSON(nullable=True)
    created_at: datetime = DateTime(default=datetime.utcnow)
    updated_at: Optional[datetime] = DateTime(nullable=True)
