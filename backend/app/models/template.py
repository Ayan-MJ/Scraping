"""
Database model for scraping templates.
"""
from typing import Dict, Any, Optional
from datetime import datetime
from ormar import Model, Integer, String, Text, JSON, DateTime, Boolean
from app.core.db import BaseMeta


class Template(Model):
    """
    Database model for a scraping template.
    """
    class Meta(BaseMeta):
        """Metadata for the Template model."""
        tablename = "templates"

    id: int = Integer(primary_key=True)
    name: str = String(max_length=255)
    description: Optional[str] = Text(nullable=True)
    user_id: str = String(max_length=255)
    is_public: bool = Boolean(default=False)
    selector_schema: Dict[str, Any] = JSON(default=dict)
    configuration: Dict[str, Any] = JSON(default=dict)
    created_at: datetime = DateTime(default=datetime.utcnow)
    updated_at: Optional[datetime] = DateTime(nullable=True)
