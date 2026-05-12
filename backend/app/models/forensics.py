"""
Forensics analysis results models (YARA, Volatility, PCAP, Browser).
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, func, JSON
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class YaraResult(BaseModel):
    """Results from YARA scanning."""
    __tablename__ = "yara_results"
    
    id = Column(Integer, primary_key=True, index=True)
    
    evidence_id = Column(Integer, ForeignKey("evidence.id"), nullable=False, index=True)
    
    scan_time = Column(DateTime, server_default=func.now(), nullable=False)
    
    # Rule information
    rule_name = Column(String(255), nullable=False)
    rule_severity = Column(String(20))  # 'Low', 'Medium', 'High', 'Critical'
    rule_category = Column(String(100))
    
    # Results
    matched = Column(Boolean, nullable=False)
    matched_strings = Column(Text)
    match_count = Column(Integer, default=0)
    
    raw_output = Column(Text)
    
    # Relationships
    evidence = relationship("Evidence", back_populates="yara_results")
    
    def __repr__(self):
        return f"<YaraResult {self.rule_name}: {'Matched' if self.matched else 'No Match'}>"


class VolatilityResult(BaseModel):
    """Results from Volatility 3 memory analysis."""
    __tablename__ = "volatility_results"
    
    id = Column(Integer, primary_key=True, index=True)
    
    evidence_id = Column(Integer, ForeignKey("evidence.id"), nullable=False, index=True)
    memory_dump_name = Column(String(255))
    
    # Plugin execution
    plugin_name = Column(String(100), nullable=False)  # 'windows.pslist', 'windows.netstat', etc.
    plugin_output = Column(Text, nullable=False)
    
    # Analysis
    suspicious_indicators = Column(Text)  # JSON array
    analysis_time = Column(DateTime, server_default=func.now(), nullable=False)
    analyzed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    evidence = relationship("Evidence", back_populates="volatility_results")
    analyzer = relationship("User")
    
    def __repr__(self):
        return f"<VolatilityResult {self.plugin_name}>"


class PCAPAnalysis(BaseModel):
    """Results from PCAP network forensics analysis."""
    __tablename__ = "pcap_analysis"
    
    id = Column(Integer, primary_key=True, index=True)
    
    evidence_id = Column(Integer, ForeignKey("evidence.id"), nullable=False, index=True)
    
    # Zeek Analysis
    zeek_executed = Column(Boolean, default=False)
    zeek_conn_log = Column(Text)
    zeek_dns_log = Column(Text)
    zeek_http_log = Column(Text)
    zeek_ssl_log = Column(Text)
    zeek_files_log = Column(Text)
    zeek_ssh_log = Column(Text)
    
    # Suricata Analysis
    suricata_executed = Column(Boolean, default=False)
    suricata_alerts = Column(Text)
    suricata_flows = Column(Text)
    suricata_dns = Column(Text)
    suricata_http = Column(Text)
    suricata_tls = Column(Text)
    
    # Findings
    port_scans_detected = Column(Integer, default=0)
    suspicious_dns_detected = Column(Integer, default=0)
    data_exfiltration_detected = Column(Integer, default=0)
    suspicious_downloads_detected = Column(Integer, default=0)
    
    analysis_time = Column(DateTime, server_default=func.now(), nullable=False)
    analyzed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    evidence = relationship("Evidence", back_populates="pcap_analysis")
    analyzer = relationship("User")
    
    def __repr__(self):
        return f"<PCAPAnalysis for Evidence {self.evidence_id}>"


class BrowserArtifact(BaseModel):
    """Browser artifacts (URLs, downloads, cookies) extracted from browser history."""
    __tablename__ = "browser_artifacts"
    
    id = Column(Integer, primary_key=True, index=True)
    
    evidence_id = Column(Integer, ForeignKey("evidence.id"), nullable=False, index=True)
    
    artifact_type = Column(String(50), nullable=False)  # 'URL', 'Download', 'Cookie', 'Cached'
    
    # URL Artifacts
    url = Column(Text)
    title = Column(String(512))
    visit_count = Column(Integer)
    last_visit_time = Column(DateTime)
    
    # Download Artifacts
    download_filename = Column(String(255))
    download_source_url = Column(Text)
    download_target_path = Column(Text)
    download_start_time = Column(DateTime)
    download_end_time = Column(DateTime)
    
    # Classification
    is_suspicious = Column(Boolean, default=False)
    suspicious_reason = Column(String(255))
    
    # Relationships
    evidence = relationship("Evidence", back_populates="browser_artifacts")
    
    def __repr__(self):
        return f"<BrowserArtifact {self.artifact_type}>"
