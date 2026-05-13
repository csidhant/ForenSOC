"""Pydantic schemas for timeline API."""

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


class TimelineEventRead(BaseModel):
    id: int
    case_id: int
    event_time: datetime
    source: str
    event_type: Optional[str] = None
    severity: Optional[str] = None
    description: str
    details: Optional[Any] = None
    related_alert_id: Optional[int] = None
    related_evidence_id: Optional[int] = None
    related_normalized_event_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TimelineRebuildResponse(BaseModel):
    case_id: int
    events_created: int
    message: str
