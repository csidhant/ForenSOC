"""
Timeline and event correlation models for ForenSOC.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func, JSON
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class TimelineEvent(BaseModel):
    """Event in the timeline for a case."""
    __tablename__ = "timeline_events"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Case
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False, index=True)
    
    # Event timing
    event_time = Column(DateTime, nullable=False, index=True)
    
    # Classification
    source = Column(String(100), nullable=False, index=True)  # 'alert', 'auth.log', 'pcap', 'browser_history', 'file_system', 'memory'
    event_type = Column(String(100))  # 'failed_login', 'port_scan', 'file_deletion', etc.
    severity = Column(String(20))
    
    # Content
    description = Column(Text, nullable=False)
    details = Column(JSON)  # Additional structured data
    
    # Relationships
    related_alert_id = Column(Integer, ForeignKey("alerts.id"), nullable=True)
    related_evidence_id = Column(Integer, ForeignKey("evidence.id"), nullable=True)
    related_normalized_event_id = Column(Integer, ForeignKey("normalized_events.id"), nullable=True)
    
    # Relationships
    case = relationship("Case", back_populates="timeline_events")
    related_alert = relationship("Alert", back_populates="timeline_events")
    related_evidence = relationship("Evidence", back_populates="timeline_events")
    normalized_event = relationship("NormalizedEvent", back_populates="timeline_events")
    
    def __repr__(self):
        return f"<TimelineEvent {self.id}: {self.event_type} at {self.event_time}>"
