"""
Event models for log storage and normalization.
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    BigInteger,
    Float,
    func,
)

from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class RawEvent(BaseModel):
    """Raw event data as ingested from log sources."""

    __tablename__ = "raw_events"

    id = Column(Integer, primary_key=True, index=True)
    log_source = Column(
        String(100), nullable=False, index=True
    )  # 'auth.log', 'apache.log', 'suricata', etc.
    raw_data = Column(Text, nullable=False)

    case_id = Column(Integer, ForeignKey("cases.id"), nullable=True, index=True)

    ingested_at = Column(
        DateTime, server_default=func.now(), nullable=False, index=True
    )

    # Relationships
    case = relationship("Case")
    normalized_event = relationship(
        "NormalizedEvent", back_populates="raw_event", uselist=False
    )

    def __repr__(self):
        return f"<RawEvent {self.id} from {self.log_source}>"


class NormalizedEvent(BaseModel):
    """Normalized event with common schema across all log sources."""

    __tablename__ = "normalized_events"

    id = Column(Integer, primary_key=True, index=True)

    # Temporal
    event_timestamp = Column(DateTime, nullable=False, index=True)

    # Source
    log_source = Column(String(100), nullable=False)

    # Network
    source_ip = Column(String(45), nullable=True, index=True)  # IPv4/IPv6 max length
    dest_ip = Column(String(45), nullable=True, index=True)
    source_port = Column(Integer, nullable=True)
    dest_port = Column(Integer, nullable=True)

    # Geographic Context (New)
    source_country = Column(String(100), nullable=True)
    source_city = Column(String(100), nullable=True)
    source_lat = Column(Float, nullable=True)
    source_lng = Column(Float, nullable=True)



    # Identity
    username = Column(String(255), nullable=True)
    hostname = Column(String(255), nullable=True)

    # Classification
    event_type = Column(
        String(100), nullable=True, index=True
    )  # 'login', 'file_access', 'network_connection', etc.
    severity = Column(String(20), nullable=True)  # 'Low', 'Medium', 'High', 'Critical'
    description = Column(Text)

    # Relationships
    raw_event_id = Column(
        Integer, ForeignKey("raw_events.id"), nullable=True, index=True
    )
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=True, index=True)

    # Raw log content
    raw_log = Column(Text)

    # Relationships
    raw_event = relationship("RawEvent", back_populates="normalized_event")
    case = relationship("Case")
    timeline_events = relationship("TimelineEvent", back_populates="normalized_event")

    def __repr__(self):
        return f"<NormalizedEvent {self.id}: {self.event_type}>"
