"""
Audit logger service to record system actions.
"""

from sqlalchemy.orm import Session
from app.models.audit import AuditLog
from app.models.user import User
from typing import Any, Optional, Dict
import json

class AuditLogger:
    """Helper to record audit events."""

    @staticmethod
    def log(
        db: Session,
        action: str,
        user: Optional[User] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        details: Optional[str] = None,
        meta_data: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None
    ) -> AuditLog:
        """Create an audit log entry."""
        log_entry = AuditLog(
            user_id=user.id if user else None,
            username=user.username if user else "system",
            ip_address=ip_address,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details,
            meta_data=meta_data
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        return log_entry
