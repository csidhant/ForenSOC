"""
Case and case-related models for ForenSOC.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, func
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Case(BaseModel):
    """Investigation case model."""
    __tablename__ = "cases"
    
    id = Column(Integer, primary_key=True, index=True)
    case_number = Column(String(50), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    
    # Classification
    severity = Column(String(20), nullable=False)  # Low, Medium, High, Critical
    status = Column(String(50), default="Open", nullable=False, index=True)  # Open, Active, On Hold, Closed, Archived
    case_type = Column(String(100))  # Malware, Data Exfiltration, APT, etc.
    
    # Personnel
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Timeline
    closed_at = Column(DateTime, nullable=True)
    incident_start = Column(DateTime, nullable=True)
    incident_end = Column(DateTime, nullable=True)
    
    # Classification
    is_confidential = Column(Boolean, default=False)
    priority = Column(Integer, default=0)
    
    # Relationships
    creator = relationship("User", foreign_keys=[created_by], back_populates="created_cases")
    assigned_analyst = relationship("User", foreign_keys=[assigned_to], back_populates="assigned_cases")
    
    alerts = relationship("Alert", back_populates="case", cascade="all, delete-orphan")
    evidence = relationship("Evidence", back_populates="case", cascade="all, delete-orphan")
    notes = relationship("CaseNote", back_populates="case", cascade="all, delete-orphan")
    timeline_events = relationship("TimelineEvent", back_populates="case", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="case", cascade="all, delete-orphan")
    mitre_mappings = relationship("MitreMapping", foreign_keys="MitreMapping.case_id", back_populates="case", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Case {self.case_number}: {self.title}>"


class CaseNote(BaseModel):
    """Notes added to a case during investigation."""
    __tablename__ = "case_notes"
    
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False, index=True)
    analyst_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    note_text = Column(Text, nullable=False)
    note_type = Column(String(50))  # 'investigation', 'finding', 'recommendation', 'action_item'
    
    # Relationships
    case = relationship("Case", back_populates="notes")
    analyst = relationship("User")
    
    def __repr__(self):
        return f"<CaseNote for Case {self.case_id}>"
