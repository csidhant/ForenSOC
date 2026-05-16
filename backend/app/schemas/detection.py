"""
Pydantic schemas for detection rules and alerts.
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime


class DetectionRuleBase(BaseModel):
    name: str = Field(..., description="Unique rule name")
    description: Optional[str] = Field(None, description="Rule description")
    enabled: bool = Field(True, description="Whether the rule is enabled")
    severity: str = Field(..., description="Rule severity: Low, Medium, High, Critical")
    rule_type: str = Field(..., description="Type of detection rule")
    pattern: Dict[str, Any] = Field(..., description="JSON pattern for detection logic")
    event_type: Optional[str] = Field(None, description="Event type to filter on")
    threshold: int = Field(1, description="Number of matches required")
    time_window_seconds: int = Field(300, description="Time window for threshold rules")
    mitre_tactic: Optional[str] = Field(None, description="MITRE ATT&CK tactic")
    mitre_technique: Optional[str] = Field(None, description="MITRE ATT&CK technique")
    mitre_id: Optional[str] = Field(None, description="MITRE ATT&CK ID")


class DetectionRuleCreate(DetectionRuleBase):
    pass


class DetectionRuleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    enabled: Optional[bool] = None
    severity: Optional[str] = None
    rule_type: Optional[str] = None
    pattern: Optional[Dict[str, Any]] = None
    event_type: Optional[str] = None
    threshold: Optional[int] = None
    time_window_seconds: Optional[int] = None
    mitre_tactic: Optional[str] = None
    mitre_technique: Optional[str] = None
    mitre_id: Optional[str] = None


class DetectionRuleResponse(DetectionRuleBase):
    id: int
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int]

    class Config:
        from_attributes = True


class DetectionAlertResponse(BaseModel):
    id: int
    alert_number: str
    title: str
    description: Optional[str]
    severity: str
    status: str
    alert_type: Optional[str]
    source_ip: Optional[str]
    dest_ip: Optional[str]
    source_port: Optional[int]
    dest_port: Optional[int]
    hostname: Optional[str]
    username: Optional[str]
    event_time: Optional[datetime]
    detected_time: datetime
    mitre_tactic: Optional[str]
    mitre_technique: Optional[str]
    mitre_id: Optional[str]
    case_id: Optional[int]
    assigned_to: Optional[int]
    detection_rule_id: Optional[int]
    created_at: datetime
    updated_at: datetime

    # Related data
    detection_rule: Optional[DetectionRuleResponse] = None

    class Config:
        from_attributes = True


class DetectionScanRequest(BaseModel):
    hours_back: int = Field(24, description="Hours of historical data to scan")


class DetectionScanResponse(BaseModel):
    alerts_scanned: int
    alerts_generated: int
    message: str
