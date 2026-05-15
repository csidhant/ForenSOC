"""
Pydantic schemas for case and case note validation.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# Case schemas
class CaseBase(BaseModel):
    """Base case schema."""
    case_number: str = Field(..., min_length=1)
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    severity: str = Field(default="Medium")  # Low, Medium, High, Critical
    case_type: Optional[str] = None
    priority: int = Field(default=0)


class CaseCreate(CaseBase):
    """Schema for creating a case."""
    pass


class CaseUpdate(BaseModel):
    """Schema for updating a case."""
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    case_type: Optional[str] = None
    assigned_to: Optional[int] = None
    priority: Optional[int] = None


class CaseResponse(CaseBase):
    """Schema for case response."""
    id: int
    status: str
    created_by: int
    assigned_to: Optional[int]
    closed_at: Optional[datetime]
    incident_start: Optional[datetime]
    incident_end: Optional[datetime]
    is_confidential: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# CaseNote schemas
class CaseNoteBase(BaseModel):
    """Base case note schema."""
    note_text: str = Field(..., min_length=1)


class CaseNoteCreate(CaseNoteBase):
    """Schema for creating a case note."""
    pass


class CaseNoteUpdate(BaseModel):
    """Schema for updating a case note."""
    note_text: str = Field(..., min_length=1)


class CaseNoteResponse(CaseNoteBase):
    """Schema for case note response."""
    id: int
    case_id: int
    analyst_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CaseDetailResponse(CaseResponse):
    """Schema for case detail response with related data."""
    notes: List[CaseNoteResponse] = []
    alert_count: int = 0
    evidence_count: int = 0
    
    class Config:
        from_attributes = True


class BulkCaseAssign(BaseModel):
    """Schema for bulk case assignment."""
    case_ids: List[int]
    assigned_to: int
