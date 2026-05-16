"""
Detection engine service for ForenSOC.
Processes normalized events against detection rules and generates alerts.
"""

import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, func

from app.models.detection import DetectionRule
from app.models.event import NormalizedEvent
from app.models.alert import Alert
from app.models.user import User
from app.database import get_db
from app.crud.alert import AlertCRUD

logger = logging.getLogger(__name__)


class DetectionEngine:
    """Engine for processing detection rules against normalized events."""

    def __init__(self, db: Session):
        self.db = db

    def process_event(self, event: NormalizedEvent) -> List[Alert]:
        """
        Process a single normalized event against all enabled detection rules.
        Returns list of alerts generated.
        """
        alerts_generated = []

        # Get all enabled rules that match the event type (if specified)
        query = self.db.query(DetectionRule).filter(DetectionRule.enabled == True)

        if event.event_type:
            # Rules can specify event_type filter or be general (None)
            query = query.filter(
                and_(
                    DetectionRule.event_type.is_(None),
                    DetectionRule.event_type == event.event_type,
                )
            )

        rules = query.all()

        for rule in rules:
            try:
                if self._matches_rule(event, rule):
                    alert = self._generate_alert(event, rule)
                    if alert:
                        alerts_generated.append(alert)
                        logger.info(
                            f"Generated alert {alert.alert_number} from rule {rule.name}"
                        )
            except Exception as e:
                logger.error(
                    f"Error processing rule {rule.name} against event {event.id}: {e}"
                )

        return alerts_generated

    def process_events_batch(self, events: List[NormalizedEvent]) -> List[Alert]:
        """
        Process a batch of normalized events.
        Returns all alerts generated.
        """
        all_alerts = []

        for event in events:
            alerts = self.process_event(event)
            all_alerts.extend(alerts)

        return all_alerts

    def _matches_rule(self, event: NormalizedEvent, rule: DetectionRule) -> bool:
        """
        Check if a normalized event matches a detection rule.
        """
        pattern = rule.pattern

        # Simple pattern matching - can be extended for complex rules
        if not pattern:
            return False

        # Check threshold-based rules (e.g., multiple failed logins)
        if "threshold" in pattern and rule.threshold > 1:
            return self._check_threshold_rule(event, rule)

        # Check pattern-based rules
        return self._check_pattern_rule(event, pattern)

    def _check_threshold_rule(
        self, event: NormalizedEvent, rule: DetectionRule
    ) -> bool:
        """
        Check threshold-based rules (e.g., brute force detection).
        """
        pattern = rule.pattern
        time_window = timedelta(seconds=rule.time_window_seconds)

        # Build query for similar events in time window
        query = self.db.query(func.count(NormalizedEvent.id)).filter(
            NormalizedEvent.event_type == event.event_type,
            NormalizedEvent.created_at >= event.created_at - time_window,
            NormalizedEvent.created_at <= event.created_at,
        )

        # Add pattern-specific filters
        if "source_ip" in pattern and pattern["source_ip"] == event.source_ip:
            query = query.filter(NormalizedEvent.source_ip == event.source_ip)

        if "username" in pattern and pattern["username"] == event.username:
            query = query.filter(NormalizedEvent.username == event.username)

        if "hostname" in pattern and pattern["hostname"] == event.hostname:
            query = query.filter(NormalizedEvent.hostname == event.hostname)

        count = query.scalar()

        return count >= rule.threshold

    def _check_pattern_rule(
        self, event: NormalizedEvent, pattern: Dict[str, Any]
    ) -> bool:
        """
        Check pattern-based rules (simple field matching).
        """
        for field, expected_value in pattern.items():
            if field == "threshold" or field == "time_window":
                continue

            actual_value = getattr(event, field, None)
            if actual_value != expected_value:
                return False

        return True

    def _generate_alert(
        self, event: NormalizedEvent, rule: DetectionRule
    ) -> Optional[Alert]:
        """
        Generate an alert from a matching event and rule.
        """
        # Generate unique alert number
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        alert_number = f"ALERT-{rule.rule_type.upper()}-{timestamp}"

        # Create alert
        alert_data = {
            "alert_number": alert_number,
            "title": f"{rule.name} - {event.event_type or 'Unknown Event'}",
            "description": f"Detection rule '{rule.name}' triggered by event from {event.log_source}",
            "severity": rule.severity,
            "status": "unreviewed",
            "alert_type": rule.rule_type,
            "source_ip": event.source_ip,
            "dest_ip": event.dest_ip,
            "source_port": event.source_port,
            "dest_port": event.dest_port,
            "hostname": event.hostname,
            "username": event.username,
            "event_time": event.event_timestamp,
            "mitre_tactic": rule.mitre_tactic,
            "mitre_technique": rule.mitre_technique,
            "mitre_id": rule.mitre_id,
            "raw_event_id": event.raw_event_id,
            "detection_rule_id": rule.id,
            "created_by": None,  # System-generated
        }

        try:
            alert = AlertCRUD.create_alert(db=self.db, **alert_data)
            return alert
        except Exception as e:
            logger.error(f"Failed to create alert for rule {rule.name}: {e}")
            return None

    def scan_historical_events(self, hours_back: int = 24) -> List[Alert]:
        """
        Scan historical normalized events and generate alerts.
        Useful for backfilling or testing rules.
        """
        cutoff_time = datetime.now() - timedelta(hours=hours_back)

        events = (
            self.db.query(NormalizedEvent)
            .filter(NormalizedEvent.created_at >= cutoff_time)
            .all()
        )

        logger.info(
            f"Scanning {len(events)} historical events from last {hours_back} hours"
        )

        return self.process_events_batch(events)


class RuleManager:
    """Manager for detection rules."""

    def __init__(self, db: Session):
        self.db = db

    def create_rule(
        self, rule_data: Dict[str, Any], created_by: Optional[int] = None
    ) -> DetectionRule:
        """Create a new detection rule."""
        rule = DetectionRule(
            name=rule_data["name"],
            description=rule_data.get("description"),
            enabled=rule_data.get("enabled", True),
            severity=rule_data["severity"],
            rule_type=rule_data["rule_type"],
            pattern=rule_data["pattern"],
            event_type=rule_data.get("event_type"),
            threshold=rule_data.get("threshold", 1),
            time_window_seconds=rule_data.get("time_window_seconds", 300),
            mitre_tactic=rule_data.get("mitre_tactic"),
            mitre_technique=rule_data.get("mitre_technique"),
            mitre_id=rule_data.get("mitre_id"),
            created_by=created_by,
        )

        self.db.add(rule)
        self.db.commit()
        self.db.refresh(rule)

        return rule

    def get_rules(self, enabled_only: bool = False) -> List[DetectionRule]:
        """Get all detection rules."""
        query = self.db.query(DetectionRule)
        if enabled_only:
            query = query.filter(DetectionRule.enabled == True)
        return query.all()

    def get_rule(self, rule_id: int) -> Optional[DetectionRule]:
        """Get a specific rule by ID."""
        return self.db.query(DetectionRule).filter(DetectionRule.id == rule_id).first()

    def update_rule(
        self, rule_id: int, updates: Dict[str, Any]
    ) -> Optional[DetectionRule]:
        """Update a detection rule."""
        rule = self.get_rule(rule_id)
        if not rule:
            return None

        for key, value in updates.items():
            if hasattr(rule, key):
                setattr(rule, key, value)

        rule.updated_at = datetime.now()
        self.db.commit()
        self.db.refresh(rule)

        return rule

    def delete_rule(self, rule_id: int) -> bool:
        """Delete a detection rule."""
        rule = self.get_rule(rule_id)
        if not rule:
            return False

        self.db.delete(rule)
        self.db.commit()
        return True

    def toggle_rule(self, rule_id: int) -> Optional[DetectionRule]:
        """Toggle a rule's enabled status."""
        rule = self.get_rule(rule_id)
        if not rule:
            return None

        rule.enabled = not rule.enabled
        rule.updated_at = datetime.now()
        self.db.commit()
        self.db.refresh(rule)

        return rule
