"""
Evidence and Chain of Custody models for ForenSOC.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, BigInteger, Boolean, func
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Evidence(BaseModel):
    """Evidence file with hash verification and integrity tracking."""
    __tablename__ = "evidence"
    
    id = Column(Integer, primary_key=True, index=True)
    evidence_id = Column(String(50), unique=True, nullable=False, index=True)  # 'EV-001', 'EV-002', etc.
    
    # Case relationship
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False, index=True)
    
    # File information
    evidence_type = Column(String(100), nullable=False, index=True)  # 'PCAP', 'Memory Dump', 'Log File', etc.
    filename = Column(String(255), nullable=False)
    original_path = Column(Text)
    stored_path = Column(Text, nullable=False)
    file_size = Column(BigInteger)
    mime_type = Column(String(100))
    
    # Hash verification
    sha256_hash = Column(String(64), nullable=False, index=True)
    md5_hash = Column(String(32))
    integrity_status = Column(String(50), default="Verified")  # 'Verified', 'Tampered', 'Pending Verification'
    hash_verified_at = Column(DateTime, nullable=True)
    hash_verified_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Collection information
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    uploaded_at = Column(DateTime, server_default=func.now(), nullable=False)
    collected_date = Column(DateTime)
    collected_by = Column(String(255))
    
    # Metadata
    description = Column(Text)
    is_sensitive = Column(Boolean, default=False)
    source_system = Column(String(255))
    
    # Relationships
    case = relationship("Case", back_populates="evidence")
    uploader = relationship("User", foreign_keys=[uploaded_by], back_populates="uploaded_evidence")
    chain_of_custody = relationship("ChainOfCustody", back_populates="evidence", cascade="all, delete-orphan")
    yara_results = relationship("YaraResult", back_populates="evidence", cascade="all, delete-orphan")
    volatility_results = relationship("VolatilityResult", back_populates="evidence", cascade="all, delete-orphan")
    pcap_analysis = relationship("PCAPAnalysis", back_populates="evidence", cascade="all, delete-orphan")
    browser_artifacts = relationship("BrowserArtifact", back_populates="evidence", cascade="all, delete-orphan")
    timeline_events = relationship("TimelineEvent", back_populates="related_evidence")
    
    def __repr__(self):
        return f"<Evidence {self.evidence_id}: {self.filename}>"


class ChainOfCustody(BaseModel):
    """Audit trail of all actions performed on evidence."""
    __tablename__ = "chain_of_custody"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Evidence
    evidence_id = Column(Integer, ForeignKey("evidence.id"), nullable=False, index=True)
    
    # Action
    action = Column(String(100), nullable=False)  # 'uploaded', 'viewed', 'analyzed', 'exported', 'hash_verified', 'report_generated'
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    actor_name = Column(String(255))
    
    action_time = Column(DateTime, server_default=func.now(), nullable=False, index=True)
    
    # Details
    details = Column(Text)
    tool_used = Column(String(255))  # 'Volatility 3', 'YARA', 'Zeek', etc.
    output_hash = Column(String(64))
    
    # Relationships
    evidence = relationship("Evidence", back_populates="chain_of_custody")
    actor = relationship("User")
    
    def __repr__(self):
        return f"<CoC {self.id}: {self.action} on Evidence {self.evidence_id}>"
