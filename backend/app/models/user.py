"""
User and Role models for ForenSOC authentication and authorization.
"""

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from sqlalchemy.sql import expression
from app.models.base import Base, BaseModel
from datetime import datetime


class Role(Base):
    """User role for role-based access control."""
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(255))
    
    # Relationships
    users = relationship("User", back_populates="role")
    
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<Role {self.name}>"


class User(BaseModel):
    """User model for authentication and authorization."""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    
    # Role
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    last_login = Column(DateTime, nullable=True)
    
    # Relationships
    role = relationship("Role", back_populates="users")
    
    # User created alerts, cases, evidence, reports
    created_alerts = relationship("Alert", foreign_keys="Alert.created_by", back_populates="creator")
    created_cases = relationship("Case", foreign_keys="Case.created_by", back_populates="creator")
    uploaded_evidence = relationship("Evidence", foreign_keys="Evidence.uploaded_by", back_populates="uploader")
    generated_reports = relationship("Report", foreign_keys="Report.generated_by", back_populates="generator")
    
    # User assigned to alerts and cases
    assigned_alerts = relationship("Alert", foreign_keys="Alert.assigned_to", back_populates="assigned_analyst")
    assigned_cases = relationship("Case", foreign_keys="Case.assigned_to", back_populates="assigned_analyst")
    
    def __repr__(self):
        return f"<User {self.username}>"
