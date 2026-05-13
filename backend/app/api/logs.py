"""
Log ingestion and event search API routes for ForenSOC.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.schemas.event import (
    RawEventCreate,
    RawEventResponse,
    NormalizedEventResponse,
    LogIngestResponse,
)
from app.crud.event import EventCRUD
from app.services.log_parser import LogParserService
from app.api.dependencies import get_current_analyst_user
from app.models.user import User

router = APIRouter(prefix="/api/logs", tags=["logs"])


@router.post("/ingest", response_model=LogIngestResponse, status_code=status.HTTP_201_CREATED)
async def ingest_log(
    raw_event_data: RawEventCreate,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db),
):
    """
    Ingest raw log data and normalize it.
    """
    raw_event = EventCRUD.create_raw_event(
        db,
        log_source=raw_event_data.log_source,
        raw_data=raw_event_data.raw_data,
        case_id=raw_event_data.case_id,
    )

    normalized_data = LogParserService.parse(raw_event.raw_data, raw_event.log_source)
    normalized_event = EventCRUD.create_normalized_event(
        db,
        raw_event_id=raw_event.id,
        event_timestamp=normalized_data.get("event_timestamp"),
        log_source=normalized_data.get("log_source") or raw_event.log_source,
        source_ip=normalized_data.get("source_ip"),
        dest_ip=normalized_data.get("dest_ip"),
        source_port=normalized_data.get("source_port"),
        dest_port=normalized_data.get("dest_port"),
        username=normalized_data.get("username"),
        hostname=normalized_data.get("hostname"),
        event_type=normalized_data.get("event_type"),
        severity=normalized_data.get("severity"),
        description=normalized_data.get("description"),
        case_id=raw_event.case_id,
        raw_log=raw_event.raw_data,
    )

    # Process event through detection engine
    from app.services.detection_engine import DetectionEngine
    detection_engine = DetectionEngine(db)
    alerts = detection_engine.process_event(normalized_event)

    return LogIngestResponse(
        raw_event=raw_event,
        normalized_event=normalized_event,
        alerts_generated=len(alerts)
    )


@router.get("/raw", response_model=List[RawEventResponse])
async def list_raw_events(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    log_source: Optional[str] = None,
    case_id: Optional[int] = None,
    start_time: Optional[datetime] = Query(None),
    end_time: Optional[datetime] = Query(None),
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db),
):
    """
    List raw ingested log events.
    """
    events = EventCRUD.get_raw_events(
        db,
        skip=skip,
        limit=limit,
        log_source=log_source,
        case_id=case_id,
        start_time=start_time,
        end_time=end_time,
    )
    return [RawEventResponse.from_orm(event) for event in events]


@router.get("/raw/{raw_event_id}", response_model=RawEventResponse)
async def get_raw_event(
    raw_event_id: int,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db),
):
    """
    Get a single raw event by ID.
    """
    event = EventCRUD.get_raw_event(db, raw_event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Raw event not found")
    return RawEventResponse.from_orm(event)


@router.get("/normalized", response_model=List[NormalizedEventResponse])
async def list_normalized_events(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    log_source: Optional[str] = None,
    event_type: Optional[str] = None,
    severity: Optional[str] = None,
    username: Optional[str] = None,
    hostname: Optional[str] = None,
    source_ip: Optional[str] = None,
    dest_ip: Optional[str] = None,
    start_time: Optional[datetime] = Query(None),
    end_time: Optional[datetime] = Query(None),
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db),
):
    """
    List normalized events with optional filters.
    """
    events = EventCRUD.get_normalized_events(
        db,
        skip=skip,
        limit=limit,
        log_source=log_source,
        event_type=event_type,
        severity=severity,
        username=username,
        hostname=hostname,
        source_ip=source_ip,
        dest_ip=dest_ip,
        start_time=start_time,
        end_time=end_time,
    )
    return [NormalizedEventResponse.from_orm(event) for event in events]


@router.get("/normalized/{normalized_event_id}", response_model=NormalizedEventResponse)
async def get_normalized_event(
    normalized_event_id: int,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db),
):
    """
    Get normalized event details by ID.
    """
    event = EventCRUD.get_normalized_event(db, normalized_event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Normalized event not found")
    return NormalizedEventResponse.from_orm(event)
