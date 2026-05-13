"""CRUD helpers for timeline events."""

from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.timeline import TimelineEvent


def list_timeline_for_case(
    db: Session,
    case_id: int,
    skip: int = 0,
    limit: int = 200,
) -> List[TimelineEvent]:
    return (
        db.query(TimelineEvent)
        .filter(TimelineEvent.case_id == case_id)
        .order_by(TimelineEvent.event_time.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def delete_timeline_for_case(db: Session, case_id: int) -> int:
    q = db.query(TimelineEvent).filter(TimelineEvent.case_id == case_id)
    count = q.count()
    q.delete(synchronize_session=False)
    db.commit()
    return count


def bulk_add_timeline(db: Session, events: List[TimelineEvent]) -> None:
    for ev in events:
        db.add(ev)
    db.commit()
