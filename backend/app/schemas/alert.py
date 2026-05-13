"""
Pydantic schemas for alert and alert note validation.
"""

from pydantic import BaseModel, Field, IPvAnyAddress
from typing import Optional, List
from datetime import datetime


# Alert schemas
class AlertBase(BaseModel):
    """Base alert schema."""
    alert_number: str = Field(..., min_length=1)
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    severity: str = Field(...)  # Low, Medium, High, Critical
    alert_type: Optional[str] = None


class AlertCreate(AlertBase):
    """Schema for creating an alert."""
    source_ip: Optional[str] = None
    dest_ip: Optional[str] = None
    source_port: Optional[int] = Field(None, ge=0, le=65535)
    dest_port: Optional[int] = Field(None, ge=0, le=65535)
    hostname: Optional[str] = None
    username: Optional[str] = None
    event_time: Optional[datetime] = None
    mitre_tactic: Optional[str] = None
    mitre_technique: Optional[str] = None
    mitre_id: Optional[str] = None


class AlertUpdate(BaseModel):
    """Schema for updating an alert."""
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    case_id: Optional[int] = None
    assigned_to: Optional[int] = None
    mitre_tactic: Optional[str] = None
    mitre_technique: Optional[str] = None


class AlertResponse(AlertBase):
    """Schema for alert response."""
    id: int
    status: str
    source_ip: Optional[str]
    dest_ip: Optional[str]
    source_port: Optional[int]
    dest_port: Optional[int]
    hostname: Optional[str]
    username: Optional[str]
    event_time: Optional[datetime]
    detected_time: datetime
    closed_at: Optional[datetime]
    mitre_tactic: Optional[str]
    mitre_technique: Optional[str]
    mitre_id: Optional[str]
    case_id: Optional[int]
    created_by: Optional[int]
    assigned_to: Optional[int]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# AlertNote schemas
class AlertNoteBase(BaseModel):
    """Base alert note schema."""
    note_text: str = Field(..., min_length=1)


class AlertNoteCreate(AlertNoteBase):
    """Schema for creating an alert note."""
    pass


class AlertNoteUpdate(BaseModel):
    """Schema for updating an alert note."""
    note_text: str = Field(..., min_length=1)


class AlertNoteResponse(AlertNoteBase):
    """Schema for alert note response."""
    id: int
    alert_id: int
    analyst_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class AlertDetailResponse(AlertResponse):
    """Schema for alert detail response with related data."""
    notes: List[AlertNoteResponse] = []
    
    class Config:
        from_attributes = True


class AlertStatisticsResponse(BaseModel):
    """Schema for alert statistics."""
    total_alerts: int
    new_alerts: int
    in_progress_alerts: int
    closed_alerts: int
    false_positive_alerts: int
    critical_alerts: int
    high_alerts: int
    medium_alerts: int
    low_alerts: int
