"""
Pydantic schemas for log ingestion and normalized events.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class RawEventCreate(BaseModel):
    """Schema for ingesting a raw log event."""
    log_source: str = Field(..., min_length=1)
    raw_data: str = Field(..., min_length=1)
    case_id: Optional[int] = None


class RawEventResponse(BaseModel):
    """Schema for raw event output."""
    id: int
    log_source: str
    raw_data: str
    case_id: Optional[int]
    ingested_at: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NormalizedEventResponse(BaseModel):
    """Schema for normalized event output."""
    id: int
    event_timestamp: datetime
    log_source: str
    source_ip: Optional[str]
    dest_ip: Optional[str]
    source_port: Optional[int]
    dest_port: Optional[int]
    username: Optional[str]
    hostname: Optional[str]
    event_type: Optional[str]
    severity: Optional[str]
    description: Optional[str]
    raw_event_id: Optional[int]
    case_id: Optional[int]
    raw_log: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LogIngestResponse(BaseModel):
    """Schema for log ingestion response."""
    raw_event: RawEventResponse
    normalized_event: Optional[NormalizedEventResponse] = None
    alerts_generated: int = Field(0, description="Number of alerts generated from this log")

    class Config:
        from_attributes = True
