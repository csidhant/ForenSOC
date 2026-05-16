"""
MITRE ATT&CK mapping models for ForenSOC.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class MitreMapping(BaseModel):
    """Mapping of alerts/cases to MITRE ATT&CK tactics and techniques."""

    __tablename__ = "mitre_mappings"

    id = Column(Integer, primary_key=True, index=True)

    # Mapped entities
    alert_id = Column(Integer, ForeignKey("alerts.id"), nullable=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=True)

    # MITRE information
    tactic = Column(
        String(100), nullable=False
    )  # 'Reconnaissance', 'Resource Development', 'Initial Access', etc.
    technique = Column(String(100), nullable=False)
    technique_id = Column(
        String(20), nullable=False, index=True
    )  # 'T1110', 'T1046', etc.
    sub_technique = Column(String(100))
    sub_technique_id = Column(String(20))

    # Additional info
    confidence_level = Column(String(20))  # 'Low', 'Medium', 'High'
    description = Column(Text)
    evidence_count = Column(Integer, default=0)

    # Relationships
    alert = relationship(
        "Alert", foreign_keys=[alert_id], back_populates="mitre_mappings"
    )
    case = relationship("Case", foreign_keys=[case_id], back_populates="mitre_mappings")

    def __repr__(self):
        return f"<MitreMapping {self.technique_id}: {self.technique}>"
