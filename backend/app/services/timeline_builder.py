"""Aggregate case activity into timeline_events."""

from __future__ import annotations

from datetime import datetime
from typing import List

from sqlalchemy.orm import Session

from app.crud import timeline as timeline_crud
from app.models.alert import Alert
from app.models.evidence import Evidence, ChainOfCustody
from app.models.event import NormalizedEvent
from app.models.timeline import TimelineEvent


def rebuild_case_timeline(db: Session, case_id: int) -> int:
    """Replace timeline rows for a case with a merged view of alerts, logs, and evidence."""
    timeline_crud.delete_timeline_for_case(db, case_id)
    rows: List[TimelineEvent] = []

    alerts = (
        db.query(Alert)
        .filter(Alert.case_id == case_id)
        .order_by(Alert.detected_time.asc())
        .all()
    )
    for a in alerts:
        et = a.event_time or a.detected_time
        rows.append(
            TimelineEvent(
                case_id=case_id,
                event_time=et or datetime.utcnow(),
                source="alert",
                event_type=a.alert_type or "alert",
                severity=a.severity,
                description=f"{a.title}: {a.description or ''}"[:4000],
                details={
                    "alert_number": a.alert_number,
                    "status": a.status,
                    "source_ip": a.source_ip,
                    "dest_ip": a.dest_ip,
                },
                related_alert_id=a.id,
            )
        )

    events = (
        db.query(NormalizedEvent)
        .filter(NormalizedEvent.case_id == case_id)
        .order_by(NormalizedEvent.event_timestamp.asc())
        .limit(500)
        .all()
    )
    for ne in events:
        rows.append(
            TimelineEvent(
                case_id=case_id,
                event_time=ne.event_timestamp,
                source=ne.log_source or "normalized_log",
                event_type=ne.event_type or "log",
                severity=ne.severity,
                description=(ne.description or ne.raw_log or "")[:4000],
                details={
                    "normalized_event_id": str(ne.id),
                    "source_ip": ne.source_ip,
                    "dest_ip": ne.dest_ip,
                    "username": ne.username,
                },
                related_normalized_event_id=None,
            )
        )

    evidence_items = db.query(Evidence).filter(Evidence.case_id == case_id).all()
    for ev in evidence_items:
        rows.append(
            TimelineEvent(
                case_id=case_id,
                event_time=ev.uploaded_at or datetime.utcnow(),
                source="evidence",
                event_type=ev.evidence_type,
                severity="Info",
                description=f"Evidence uploaded: {ev.filename} ({ev.evidence_id})",
                details={"evidence_id": ev.id, "sha256": ev.sha256_hash},
                related_evidence_id=ev.id,
            )
        )

    coc_rows = (
        db.query(ChainOfCustody)
        .join(Evidence, ChainOfCustody.evidence_id == Evidence.id)
        .filter(Evidence.case_id == case_id)
        .order_by(ChainOfCustody.action_time.asc())
        .limit(500)
        .all()
    )
    for c in coc_rows:
        rows.append(
            TimelineEvent(
                case_id=case_id,
                event_time=c.action_time or datetime.utcnow(),
                source="chain_of_custody",
                event_type=c.action,
                severity="Info",
                description=(c.details or c.action)[:4000],
                details={"evidence_id": c.evidence_id, "tool": c.tool_used},
                related_evidence_id=c.evidence_id,
            )
        )

    rows.sort(key=lambda r: r.event_time or datetime.min)
    if rows:
        timeline_crud.bulk_add_timeline(db, rows)
    return len(rows)
