"""
Pydantic schemas for Evidence management.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class EvidenceBase(BaseModel):
    """Base schema for Evidence."""

    evidence_id: Optional[str] = Field(
        None, description="Unique evidence identifier (auto-generated)"
    )
    case_id: int = Field(..., description="Associated case ID")
    evidence_type: str = Field(
        ..., description="Type of evidence (PCAP, Memory Dump, Log File, etc.)"
    )
    filename: str = Field(..., description="Original filename")
    original_path: Optional[str] = Field(None, description="Original file path")
    stored_path: Optional[str] = Field(None, description="Stored file path on server")
    file_size: Optional[int] = Field(None, description="File size in bytes")
    mime_type: Optional[str] = Field(None, description="MIME type")
    sha256_hash: Optional[str] = Field(None, description="SHA256 hash")
    md5_hash: Optional[str] = Field(None, description="MD5 hash")
    integrity_status: Optional[str] = Field(
        "Pending Verification", description="Integrity status"
    )
    collected_date: Optional[datetime] = Field(
        None, description="When evidence was collected"
    )
    collected_by: Optional[str] = Field(None, description="Who collected the evidence")
    description: Optional[str] = Field(None, description="Evidence description")
    is_sensitive: Optional[bool] = Field(False, description="Sensitive evidence flag")
    source_system: Optional[str] = Field(None, description="Source system")


class EvidenceCreate(EvidenceBase):
    """Schema for creating evidence."""

    pass


class EvidenceUpdate(BaseModel):
    """Schema for updating evidence."""

    evidence_type: Optional[str] = None
    filename: Optional[str] = None
    original_path: Optional[str] = None
    stored_path: Optional[str] = None
    mime_type: Optional[str] = None
    collected_date: Optional[datetime] = None
    collected_by: Optional[str] = None
    description: Optional[str] = None
    is_sensitive: Optional[bool] = None
    source_system: Optional[str] = None


class Evidence(EvidenceBase):
    """Schema for evidence response."""

    id: int
    evidence_id: str
    uploaded_by: int
    uploaded_at: datetime
    hash_verified_at: Optional[datetime] = None
    hash_verified_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EvidenceWithChainOfCustody(Evidence):
    """Evidence with chain of custody."""

    chain_of_custody: List["ChainOfCustody"] = []

    class Config:
        from_attributes = True


# Chain of Custody schemas


class ChainOfCustodyBase(BaseModel):
    """Base schema for Chain of Custody."""

    evidence_id: int = Field(..., description="Evidence ID")
    action: str = Field(..., description="Action performed")
    actor_id: Optional[int] = Field(None, description="User who performed action")
    actor_name: Optional[str] = Field(None, description="Actor name (if not a user)")
    details: Optional[str] = Field(None, description="Action details")
    tool_used: Optional[str] = Field(None, description="Tool used for action")
    output_hash: Optional[str] = Field(None, description="Hash of output/results")


class ChainOfCustodyCreate(ChainOfCustodyBase):
    """Schema for creating chain of custody entry."""

    pass


class ChainOfCustody(ChainOfCustodyBase):
    """Schema for chain of custody response."""

    id: int
    action_time: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Search and filter schemas


class EvidenceSearch(BaseModel):
    """Schema for evidence search parameters."""

    case_id: Optional[int] = None
    evidence_type: Optional[str] = None
    filename: Optional[str] = None
    hash_value: Optional[str] = None
    skip: Optional[int] = Field(0, ge=0)
    limit: Optional[int] = Field(100, ge=1, le=1000)


class EvidenceUploadResponse(BaseModel):
    """Response after evidence upload."""

    evidence: Evidence
    upload_success: bool
    message: str


class ChainOfCustodyManualCreate(BaseModel):
    """Append a chain-of-custody entry (e.g. analyzed, exported)."""

    action: str = Field(..., min_length=1, max_length=100)
    details: Optional[str] = None
    tool_used: Optional[str] = None
    output_hash: Optional[str] = None
