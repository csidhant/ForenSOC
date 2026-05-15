"""
Audit logging model for tracking system actions.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
from datetime import datetime

class AuditLog(BaseModel):
    """System audit log model."""
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Who
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    username = Column(String(100))
    ip_address = Column(String(50))
    
    # What
    action = Column(String(100), nullable=False, index=True) # e.g., 'CASE_CREATED', 'RULE_UPDATED', 'USER_LOGIN'
    resource_type = Column(String(50)) # e.g., 'case', 'rule', 'evidence'
    resource_id = Column(String(100))
    
    # Details
    details = Column(Text)
    meta_data = Column(JSON) # Store before/after states or other contextual data
    
    # Relationships
    user = relationship("User")

    def __repr__(self):
        return f"<AuditLog {self.action} by {self.username} at {self.timestamp}>"
