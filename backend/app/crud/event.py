"""
CRUD operations for raw and normalized event models.
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime
from typing import Optional, List, Tuple
from app.models.event import RawEvent, NormalizedEvent


class EventCRUD:
    """CRUD operations for RawEvent and NormalizedEvent."""

    @staticmethod
    def create_raw_event(
        db: Session,
        log_source: str,
        raw_data: str,
        case_id: Optional[int] = None,
    ) -> RawEvent:
        raw_event = RawEvent(
            log_source=log_source,
            raw_data=raw_data,
            case_id=case_id,
        )
        db.add(raw_event)
        db.commit()
        db.refresh(raw_event)
        return raw_event

    @staticmethod
    def get_raw_event(db: Session, raw_event_id: int) -> Optional[RawEvent]:
        return db.query(RawEvent).filter(RawEvent.id == raw_event_id).first()

    @staticmethod
    def get_raw_events(
        db: Session,
        skip: int = 0,
        limit: int = 50,
        log_source: Optional[str] = None,
        case_id: Optional[int] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
    ) -> List[RawEvent]:
        query = db.query(RawEvent)

        if log_source:
            query = query.filter(RawEvent.log_source == log_source)
        if case_id is not None:
            query = query.filter(RawEvent.case_id == case_id)
        if start_time is not None:
            query = query.filter(RawEvent.ingested_at >= start_time)
        if end_time is not None:
            query = query.filter(RawEvent.ingested_at <= end_time)

        return (
            query.order_by(RawEvent.ingested_at.desc()).offset(skip).limit(limit).all()
        )

    @staticmethod
    def create_normalized_event(
        db: Session,
        raw_event_id: int,
        event_timestamp: datetime,
        log_source: str,
        source_ip: Optional[str] = None,
        dest_ip: Optional[str] = None,
        source_port: Optional[int] = None,
        dest_port: Optional[int] = None,
        username: Optional[str] = None,
        hostname: Optional[str] = None,
        event_type: Optional[str] = None,
        severity: Optional[str] = None,
        description: Optional[str] = None,
        case_id: Optional[int] = None,
        raw_log: Optional[str] = None,
        source_country: Optional[str] = None,
        source_city: Optional[str] = None,
        source_lat: Optional[float] = None,
        source_lng: Optional[float] = None,
    ) -> NormalizedEvent:

        normalized_event = NormalizedEvent(
            raw_event_id=raw_event_id,
            event_timestamp=event_timestamp,
            log_source=log_source,
            source_ip=source_ip,
            dest_ip=dest_ip,
            source_port=source_port,
            dest_port=dest_port,
            username=username,
            hostname=hostname,
            event_type=event_type,
            severity=severity,
            description=description,
            case_id=case_id,
            raw_log=raw_log,
            source_country=source_country,
            source_city=source_city,
            source_lat=source_lat,
            source_lng=source_lng,
        )

        db.add(normalized_event)
        db.commit()
        db.refresh(normalized_event)
        return normalized_event

    @staticmethod
    def get_normalized_event(
        db: Session, normalized_event_id: int
    ) -> Optional[NormalizedEvent]:
        return (
            db.query(NormalizedEvent)
            .filter(NormalizedEvent.id == normalized_event_id)
            .first()
        )

    @staticmethod
    def get_normalized_events(
        db: Session,
        skip: int = 0,
        limit: int = 50,
        log_source: Optional[str] = None,
        event_type: Optional[str] = None,
        severity: Optional[str] = None,
        username: Optional[str] = None,
        hostname: Optional[str] = None,
        source_ip: Optional[str] = None,
        dest_ip: Optional[str] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
    ) -> List[NormalizedEvent]:
        query = db.query(NormalizedEvent)

        if log_source:
            query = query.filter(NormalizedEvent.log_source == log_source)
        if event_type:
            query = query.filter(NormalizedEvent.event_type == event_type)
        if severity:
            query = query.filter(NormalizedEvent.severity == severity)
        if username:
            query = query.filter(NormalizedEvent.username == username)
        if hostname:
            query = query.filter(NormalizedEvent.hostname == hostname)
        if source_ip:
            query = query.filter(NormalizedEvent.source_ip == source_ip)
        if dest_ip:
            query = query.filter(NormalizedEvent.dest_ip == dest_ip)
        if start_time is not None:
            query = query.filter(NormalizedEvent.event_timestamp >= start_time)
        if end_time is not None:
            query = query.filter(NormalizedEvent.event_timestamp <= end_time)

        return (
            query.order_by(NormalizedEvent.event_timestamp.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    @staticmethod
    def get_normalized_events_paginated(
        db: Session, skip: int = 0, limit: int = 50, **filters
    ) -> Tuple[List[NormalizedEvent], int]:
        """Get events and total count."""
        query = db.query(NormalizedEvent)

        # Apply filters (simplified for bulk)
        for key, value in filters.items():
            if value is not None:
                if key == "start_time":
                    query = query.filter(NormalizedEvent.event_timestamp >= value)
                elif key == "end_time":
                    query = query.filter(NormalizedEvent.event_timestamp <= value)
                else:
                    query = query.filter(getattr(NormalizedEvent, key) == value)

        total = query.count()
        items = (
            query.order_by(NormalizedEvent.event_timestamp.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return items, total
