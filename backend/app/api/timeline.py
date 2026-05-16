"""Timeline reconstruction API."""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_analyst_user, check_case_access
from app.database import get_db
from app.crud import timeline as timeline_crud
from app.models.user import User
from app.schemas.timeline import TimelineEventRead, TimelineRebuildResponse
from app.services import timeline_builder

router = APIRouter(prefix="/api/timeline", tags=["timeline"])


@router.get("/cases/{case_id}/events", response_model=List[TimelineEventRead])
async def list_timeline(
    case_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(200, ge=1, le=500),
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db),
):
    if not check_case_access(current_user, case_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="No access to case"
        )
    rows = timeline_crud.list_timeline_for_case(db, case_id, skip=skip, limit=limit)
    return [TimelineEventRead.model_validate(r) for r in rows]


@router.post("/cases/{case_id}/rebuild", response_model=TimelineRebuildResponse)
async def rebuild_timeline(
    case_id: int,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db),
):
    if not check_case_access(current_user, case_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="No access to case"
        )
    n = timeline_builder.rebuild_case_timeline(db, case_id)
    return TimelineRebuildResponse(
        case_id=case_id,
        events_created=n,
        message=f"Timeline rebuilt with {n} events",
    )
