"""
Detection rule model for ForenSOC detection engine.
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Boolean,
    JSON,
    func,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class DetectionRule(BaseModel):
    """Detection rule for the security detection engine."""

    __tablename__ = "detection_rules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True, index=True)
    description = Column(Text)

    # Rule configuration
    enabled = Column(Boolean, default=True, nullable=False, index=True)
    severity = Column(
        String(20), nullable=False, index=True
    )  # 'Low', 'Medium', 'High', 'Critical'
    rule_type = Column(
        String(100), nullable=False, index=True
    )  # 'ssh_brute_force', 'port_scan', etc.

    # Detection logic
    pattern = Column(
        JSON, nullable=False
    )  # JSON structure defining the detection pattern
    event_type = Column(String(100), nullable=True, index=True)  # Filter by event type
    threshold = Column(Integer, default=1, nullable=False)  # Number of matches required
    time_window_seconds = Column(
        Integer, default=300, nullable=False
    )  # Time window for threshold

    # MITRE ATT&CK
    mitre_tactic = Column(String(100), nullable=True)
    mitre_technique = Column(String(100), nullable=True)
    mitre_id = Column(String(20), nullable=True)  # 'T1110', 'T1046', etc.

    # Metadata
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationships
    creator = relationship("User", back_populates="detection_rules")
    alerts = relationship(
        "Alert", back_populates="detection_rule", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<DetectionRule {self.name}: {self.severity}>"
