"""Pydantic schemas for PDF report API."""

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


class ReportGenerateRequest(BaseModel):
    case_id: int = Field(..., description="Case to include in the report")
    title: Optional[str] = None


class ReportRead(BaseModel):
    id: int
    report_number: str
    case_id: int
    report_type: str
    title: str
    file_path: str
    file_size: Optional[int] = None
    file_hash: Optional[str] = None
    generated_at: datetime
    generated_by: Optional[int] = None
    report_date: Optional[datetime] = None
    status: str
    is_confidential: bool = False
    included_sections: Optional[Any] = None
    total_pages: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ReportGenerateResponse(BaseModel):
    report: ReportRead
    message: str
