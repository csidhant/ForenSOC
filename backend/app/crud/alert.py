"""
CRUD operations for Alert and AlertNote models.
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.alert import Alert
from datetime import datetime
from typing import Optional, List


class AlertCRUD:
    """CRUD operations for Alert model."""

    @staticmethod
    def get_alert(db: Session, alert_id: int) -> Optional[Alert]:
        """Get an alert by ID."""
        return db.query(Alert).filter(Alert.id == alert_id).first()

    @staticmethod
    def get_alert_by_number(db: Session, alert_number: str) -> Optional[Alert]:
        """Get an alert by alert number."""
        return db.query(Alert).filter(Alert.alert_number == alert_number).first()

    @staticmethod
    def get_all_alerts(
        db: Session,
        skip: int = 0,
        limit: int = 50,
        status: Optional[str] = None,
        severity: Optional[str] = None,
        case_id: Optional[int] = None,
        assigned_to: Optional[int] = None,
        alert_type: Optional[str] = None,
    ) -> List[Alert]:
        """Get all alerts with filtering and pagination."""
        query = db.query(Alert)

        if status:
            query = query.filter(Alert.status == status)
        if severity:
            query = query.filter(Alert.severity == severity)
        if case_id:
            query = query.filter(Alert.case_id == case_id)
        if assigned_to:
            query = query.filter(Alert.assigned_to == assigned_to)
        if alert_type:
            query = query.filter(Alert.alert_type == alert_type)

        return (
            query.order_by(Alert.detected_time.desc()).offset(skip).limit(limit).all()
        )

    @staticmethod
    def create_alert(
        db: Session,
        alert_number: str,
        title: str,
        severity: str,
        description: Optional[str] = None,
        alert_type: Optional[str] = None,
        source_ip: Optional[str] = None,
        dest_ip: Optional[str] = None,
        source_port: Optional[int] = None,
        dest_port: Optional[int] = None,
        hostname: Optional[str] = None,
        username: Optional[str] = None,
        event_time: Optional[datetime] = None,
        mitre_tactic: Optional[str] = None,
        mitre_technique: Optional[str] = None,
        mitre_id: Optional[str] = None,
        created_by: Optional[int] = None,
        source_country: Optional[str] = None,
        source_city: Optional[str] = None,
        source_lat: Optional[float] = None,
        source_lng: Optional[float] = None,
        status: Optional[str] = "New",
        raw_event_id: Optional[int] = None,
        detection_rule_id: Optional[int] = None,
    ) -> Alert:

        """Create a new alert."""
        alert = Alert(
            alert_number=alert_number,
            title=title,
            severity=severity,
            description=description,
            status=status,
            alert_type=alert_type,
            source_ip=source_ip,
            dest_ip=dest_ip,
            source_port=source_port,
            dest_port=dest_port,
            hostname=hostname,
            username=username,
            event_time=event_time,
            mitre_tactic=mitre_tactic,
            mitre_technique=mitre_technique,
            mitre_id=mitre_id,
            created_by=created_by,
            source_country=source_country,
            source_city=source_city,
            source_lat=source_lat,
            source_lng=source_lng,
            raw_event_id=raw_event_id,
            detection_rule_id=detection_rule_id,
        )


        db.add(alert)
        db.commit()
        db.refresh(alert)
        return alert

    @staticmethod
    def update_alert(
        db: Session,
        alert_id: int,
        title: Optional[str] = None,
        description: Optional[str] = None,
        severity: Optional[str] = None,
        status: Optional[str] = None,
        case_id: Optional[int] = None,
        assigned_to: Optional[int] = None,
        mitre_tactic: Optional[str] = None,
        mitre_technique: Optional[str] = None,
    ) -> Optional[Alert]:
        """Update an alert."""
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if not alert:
            return None

        if title is not None:
            alert.title = title
        if description is not None:
            alert.description = description
        if severity is not None:
            alert.severity = severity
        if status is not None:
            alert.status = status
            if status == "Closed":
                alert.closed_at = datetime.utcnow()
        if case_id is not None:
            alert.case_id = case_id
        if assigned_to is not None:
            alert.assigned_to = assigned_to
        if mitre_tactic is not None:
            alert.mitre_tactic = mitre_tactic
        if mitre_technique is not None:
            alert.mitre_technique = mitre_technique

        db.commit()
        db.refresh(alert)
        return alert

    @staticmethod
    def close_alert(db: Session, alert_id: int) -> Optional[Alert]:
        """Close an alert."""
        return AlertCRUD.update_alert(db, alert_id, status="Closed")

    @staticmethod
    def mark_false_positive(db: Session, alert_id: int) -> Optional[Alert]:
        """Mark an alert as false positive."""
        return AlertCRUD.update_alert(db, alert_id, status="False Positive")

    @staticmethod
    def assign_alert(db: Session, alert_id: int, user_id: int) -> Optional[Alert]:
        """Assign an alert to a user."""
        return AlertCRUD.update_alert(db, alert_id, assigned_to=user_id)

    @staticmethod
    def unassign_alert(db: Session, alert_id: int) -> Optional[Alert]:
        """Unassign an alert."""
        return AlertCRUD.update_alert(db, alert_id, assigned_to=None)

    @staticmethod
    def link_alert_to_case(db: Session, alert_id: int, case_id: int) -> Optional[Alert]:
        """Link an alert to a case."""
        return AlertCRUD.update_alert(db, alert_id, case_id=case_id)

    @staticmethod
    def unlink_alert_from_case(db: Session, alert_id: int) -> Optional[Alert]:
        """Unlink an alert from a case."""
        return AlertCRUD.update_alert(db, alert_id, case_id=None)

    @staticmethod
    def delete_alert(db: Session, alert_id: int) -> bool:
        """Delete an alert."""
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if not alert:
            return False

        db.delete(alert)
        db.commit()
        return True

    @staticmethod
    def get_unreviewed_alerts(
        db: Session, skip: int = 0, limit: int = 50
    ) -> List[Alert]:
        """Get all unreviewed alerts."""
        return (
            db.query(Alert)
            .filter(Alert.status == "New")
            .order_by(Alert.detected_time.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_alerts_by_severity(
        db: Session, severity: str, skip: int = 0, limit: int = 50
    ) -> List[Alert]:
        """Get alerts by severity."""
        return (
            db.query(Alert)
            .filter(Alert.severity == severity)
            .order_by(Alert.detected_time.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_alerts_by_creator(
        db: Session, creator_id: int, skip: int = 0, limit: int = 50
    ) -> List[Alert]:
        """Get all alerts created by a user."""
        return (
            db.query(Alert)
            .filter(Alert.created_by == creator_id)
            .order_by(Alert.detected_time.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_alerts_assigned_to(
        db: Session, user_id: int, skip: int = 0, limit: int = 50
    ) -> List[Alert]:
        """Get all alerts assigned to a user."""
        return (
            db.query(Alert)
            .filter(Alert.assigned_to == user_id)
            .order_by(Alert.detected_time.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )


class AlertNoteCRUD:
    """CRUD operations for AlertNote model."""

    @staticmethod
    def get_note(db: Session, note_id: int) -> Optional["AlertNote"]:
        """Get an alert note by ID."""
        from app.models.alert import AlertNote  # Import here to avoid circular imports

        return db.query(AlertNote).filter(AlertNote.id == note_id).first()

    @staticmethod
    def get_alert_notes(
        db: Session, alert_id: int, skip: int = 0, limit: int = 50
    ) -> List["AlertNote"]:
        """Get all notes for an alert."""
        from app.models.alert import AlertNote

        return (
            db.query(AlertNote)
            .filter(AlertNote.alert_id == alert_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def create_note(
        db: Session, alert_id: int, note_text: str, analyst_id: Optional[int] = None
    ) -> "AlertNote":
        """Create a new alert note."""
        from app.models.alert import AlertNote

        note = AlertNote(alert_id=alert_id, analyst_id=analyst_id, note_text=note_text)

        db.add(note)
        db.commit()
        db.refresh(note)
        return note

    @staticmethod
    def update_note(db: Session, note_id: int, note_text: str) -> Optional["AlertNote"]:
        """Update an alert note."""
        from app.models.alert import AlertNote

        note = db.query(AlertNote).filter(AlertNote.id == note_id).first()
        if not note:
            return None

        note.note_text = note_text
        db.commit()
        db.refresh(note)
        return note

    @staticmethod
    def delete_note(db: Session, note_id: int) -> bool:
        """Delete an alert note."""
        from app.models.alert import AlertNote

        note = db.query(AlertNote).filter(AlertNote.id == note_id).first()
        if not note:
            return False

        db.delete(note)
        db.commit()
        return True
