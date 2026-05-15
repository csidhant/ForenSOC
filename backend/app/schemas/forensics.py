"""Schemas for PCAP / memory / Suricata forensics APIs."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class PCAPAnalysisRead(BaseModel):
    id: int
    evidence_id: int
    zeek_executed: bool
    suricata_executed: bool
    port_scans_detected: int
    suspicious_dns_detected: int
    data_exfiltration_detected: int
    suspicious_downloads_detected: int
    analysis_time: datetime
    analyzed_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class VolatilityResultRead(BaseModel):
    id: int
    evidence_id: int
    plugin_name: str
    plugin_output: str
    suspicious_indicators: Optional[str] = None
    analysis_time: datetime
    analyzed_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class YaraResultRead(BaseModel):
    id: int
    evidence_id: int
    scan_time: datetime
    rule_name: str
    rule_severity: Optional[str] = None
    rule_category: Optional[str] = None
    matched: bool
    matched_strings: Optional[str] = None
    match_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ForensicsJobResponse(BaseModel):
    evidence_id: int
    message: str
    pcap_analysis_id: Optional[int] = None
    volatility_result_ids: Optional[list[int]] = None
    yara_result_ids: Optional[list[int]] = None
