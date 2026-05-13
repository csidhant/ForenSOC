"""
Case management API routes for ForenSOC.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.case import (
    CaseCreate, CaseUpdate, CaseResponse, CaseDetailResponse,
    CaseNoteCreate, CaseNoteUpdate, CaseNoteResponse
)
from app.crud.case import CaseCRUD, CaseNoteCRUD
from app.crud.alert import AlertCRUD
from app.api.dependencies import (
    get_current_user, get_current_analyst_user, check_case_access
)
from app.models.user import User

router = APIRouter(prefix="/api/cases", tags=["cases"])


@router.post("", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
async def create_case(
    case_data: CaseCreate,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db)
):
    """
    Create a new case.
    """
    # Check if case number already exists
    if CaseCRUD.get_case_by_number(db, case_data.case_number):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Case number already exists"
        )
    
    # Create case
    new_case = CaseCRUD.create_case(
        db,
        case_number=case_data.case_number,
        title=case_data.title,
        description=case_data.description,
        severity=case_data.severity,
        case_type=case_data.case_type,
        created_by=current_user.id,
        priority=case_data.priority
    )
    
    return CaseResponse.from_orm(new_case)


@router.get("", response_model=List[CaseResponse])
async def list_cases(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[str] = None,
    severity: Optional[str] = None,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db)
):
    """
    List all cases.
    
    Analysts see their own cases, admins see all cases.
    """
    if current_user.role.name.lower() == "admin":
        cases = CaseCRUD.get_all_cases(
            db, skip=skip, limit=limit, status=status, severity=severity
        )
    else:
        # Analysts see their own cases
        cases = CaseCRUD.get_cases_assigned_to(db, current_user.id, skip=skip, limit=limit)
    
    return [CaseResponse.from_orm(case) for case in cases]


@router.get("/{case_id}", response_model=CaseDetailResponse)
async def get_case(
    case_id: int,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db)
):
    """
    Get case by ID with all related data.
    """
    # Check access
    if not check_case_access(current_user, case_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this case"
        )
    
    case = CaseCRUD.get_case(db, case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )
    
    # Get related data counts
    alerts_count = len(case.alerts)
    evidence_count = len(case.evidence)
    notes = [CaseNoteResponse.from_orm(n) for n in case.notes]
    
    case_detail = CaseDetailResponse.from_orm(case)
    case_detail.alert_count = alerts_count
    case_detail.evidence_count = evidence_count
    case_detail.notes = notes
    
    return case_detail


@router.put("/{case_id}", response_model=CaseResponse)
async def update_case(
    case_id: int,
    case_data: CaseUpdate,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db)
):
    """
    Update a case.
    """
    # Check access
    if not check_case_access(current_user, case_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this case"
        )
    
    case = CaseCRUD.get_case(db, case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )
    
    # Update case
    updated_case = CaseCRUD.update_case(
        db,
        case_id,
        title=case_data.title,
        description=case_data.description,
        severity=case_data.severity,
        status=case_data.status,
        case_type=case_data.case_type,
        assigned_to=case_data.assigned_to,
        priority=case_data.priority
    )
    
    return CaseResponse.from_orm(updated_case)


@router.delete("/{case_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_case(
    case_id: int,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db)
):
    """
    Delete a case (case creator or admin only).
    """
    case = CaseCRUD.get_case(db, case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )
    
    # Check permissions
    if case.created_by != current_user.id and current_user.role.name.lower() != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this case"
        )
    
    CaseCRUD.delete_case(db, case_id)


# Case Notes endpoints
@router.post("/{case_id}/notes", response_model=CaseNoteResponse, status_code=status.HTTP_201_CREATED)
async def add_case_note(
    case_id: int,
    note_data: CaseNoteCreate,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db)
):
    """
    Add a note to a case.
    """
    # Check case exists and user has access
    if not check_case_access(current_user, case_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this case"
        )
    
    case = CaseCRUD.get_case(db, case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )
    
    # Create note
    new_note = CaseNoteCRUD.create_note(
        db,
        case_id=case_id,
        note_text=note_data.note_text,
        analyst_id=current_user.id
    )
    
    return CaseNoteResponse.from_orm(new_note)


@router.get("/{case_id}/notes", response_model=List[CaseNoteResponse])
async def get_case_notes(
    case_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db)
):
    """
    Get all notes for a case.
    """
    # Check access
    if not check_case_access(current_user, case_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this case"
        )
    
    case = CaseCRUD.get_case(db, case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )
    
    notes = CaseNoteCRUD.get_case_notes(db, case_id, skip=skip, limit=limit)
    return [CaseNoteResponse.from_orm(note) for note in notes]


@router.put("/{case_id}/notes/{note_id}", response_model=CaseNoteResponse)
async def update_case_note(
    case_id: int,
    note_id: int,
    note_data: CaseNoteUpdate,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db)
):
    """
    Update a case note.
    """
    # Check case access
    if not check_case_access(current_user, case_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this case"
        )
    
    note = CaseNoteCRUD.get_note(db, note_id)
    if not note or note.case_id != case_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    updated_note = CaseNoteCRUD.update_note(db, note_id, note_data.note_text)
    return CaseNoteResponse.from_orm(updated_note)


@router.delete("/{case_id}/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_case_note(
    case_id: int,
    note_id: int,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db)
):
    """
    Delete a case note.
    """
    # Check case access
    if not check_case_access(current_user, case_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this case"
        )
    
    note = CaseNoteCRUD.get_note(db, note_id)
    if not note or note.case_id != case_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    CaseNoteCRUD.delete_note(db, note_id)


@router.post("/{case_id}/close", response_model=CaseResponse)
async def close_case(
    case_id: int,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db)
):
    """
    Close a case.
    """
    # Check access
    if not check_case_access(current_user, case_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this case"
        )
    
    case = CaseCRUD.close_case(db, case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )
    
    return CaseResponse.from_orm(case)


@router.post("/{case_id}/reopen", response_model=CaseResponse)
async def reopen_case(
    case_id: int,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db)
):
    """
    Reopen a closed case.
    """
    # Check access
    if not check_case_access(current_user, case_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this case"
        )
    
    case = CaseCRUD.reopen_case(db, case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )
    
    return CaseResponse.from_orm(case)
