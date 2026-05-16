from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Dict, Any
from app.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.case import Case, CaseNote
from app.models.evidence import Evidence

router = APIRouter(prefix="/api/search", tags=["search"])


@router.get("/advanced", response_model=Dict[str, Any])
async def advanced_search(
    q: str = Query(..., min_length=3, description="Search query"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Advanced full-text search across cases, notes, and evidence.
    """
    search_term = f"%{q}%"

    # Search Cases
    cases = (
        db.query(Case)
        .filter(
            or_(
                Case.title.ilike(search_term),
                Case.description.ilike(search_term),
                Case.case_number.ilike(search_term),
            )
        )
        .limit(20)
        .all()
    )

    # Search Case Notes
    notes = (
        db.query(CaseNote).filter(CaseNote.note_text.ilike(search_term)).limit(20).all()
    )

    # Search Evidence
    evidence = (
        db.query(Evidence)
        .filter(
            or_(
                Evidence.filename.ilike(search_term),
                Evidence.description.ilike(search_term),
                Evidence.md5_hash.ilike(search_term),
                Evidence.sha256_hash.ilike(search_term),
            )
        )
        .limit(20)
        .all()
    )

    return {
        "query": q,
        "results": {
            "cases": [
                {"id": c.id, "case_number": c.case_number, "title": c.title}
                for c in cases
            ],
            "notes": [
                {"id": n.id, "case_id": n.case_id, "text": n.note_text[:100]}
                for n in notes
            ],
            "evidence": [
                {"id": e.id, "filename": e.filename, "case_id": e.case_id}
                for e in evidence
            ],
        },
    }
