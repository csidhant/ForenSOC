"""
CRUD operations for Case and CaseNote models.
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.models.case import Case, CaseNote
from datetime import datetime
from typing import Optional, List


class CaseCRUD:
    """CRUD operations for Case model."""
    
    @staticmethod
    def get_case(db: Session, case_id: int) -> Optional[Case]:
        """Get a case by ID."""
        return db.query(Case).filter(Case.id == case_id).first()
    
    @staticmethod
    def get_case_by_number(db: Session, case_number: str) -> Optional[Case]:
        """Get a case by case number."""
        return db.query(Case).filter(Case.case_number == case_number).first()
    
    @staticmethod
    def get_all_cases(
        db: Session,
        skip: int = 0,
        limit: int = 10,
        status: Optional[str] = None,
        severity: Optional[str] = None,
        assigned_to: Optional[int] = None
    ) -> List[Case]:
        """Get all cases with filtering and pagination."""
        query = db.query(Case)
        
        if status:
            query = query.filter(Case.status == status)
        if severity:
            query = query.filter(Case.severity == severity)
        if assigned_to:
            query = query.filter(Case.assigned_to == assigned_to)
        
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def create_case(
        db: Session,
        case_number: str,
        title: str,
        created_by: int,
        description: Optional[str] = None,
        severity: str = "Medium",
        case_type: Optional[str] = None,
        incident_start: Optional[datetime] = None,
        incident_end: Optional[datetime] = None,
        priority: int = 0
    ) -> Case:
        """Create a new case."""
        case = Case(
            case_number=case_number,
            title=title,
            description=description,
            severity=severity,
            status="Open",
            case_type=case_type,
            created_by=created_by,
            incident_start=incident_start,
            incident_end=incident_end,
            priority=priority
        )
        
        db.add(case)
        db.commit()
        db.refresh(case)
        return case
    
    @staticmethod
    def update_case(
        db: Session,
        case_id: int,
        title: Optional[str] = None,
        description: Optional[str] = None,
        severity: Optional[str] = None,
        status: Optional[str] = None,
        case_type: Optional[str] = None,
        assigned_to: Optional[int] = None,
        priority: Optional[int] = None
    ) -> Optional[Case]:
        """Update a case."""
        case = db.query(Case).filter(Case.id == case_id).first()
        if not case:
            return None
        
        if title is not None:
            case.title = title
        if description is not None:
            case.description = description
        if severity is not None:
            case.severity = severity
        if status is not None:
            case.status = status
            if status == "Closed":
                case.closed_at = datetime.utcnow()
        if case_type is not None:
            case.case_type = case_type
        if assigned_to is not None:
            case.assigned_to = assigned_to
        if priority is not None:
            case.priority = priority
        
        db.commit()
        db.refresh(case)
        return case
    
    @staticmethod
    def close_case(db: Session, case_id: int) -> Optional[Case]:
        """Close a case."""
        return CaseCRUD.update_case(db, case_id, status="Closed")
    
    @staticmethod
    def reopen_case(db: Session, case_id: int) -> Optional[Case]:
        """Reopen a closed case."""
        case = db.query(Case).filter(Case.id == case_id).first()
        if not case:
            return None
        
        case.status = "Open"
        case.closed_at = None
        db.commit()
        db.refresh(case)
        return case
    
    @staticmethod
    def assign_case(db: Session, case_id: int, user_id: int) -> Optional[Case]:
        """Assign a case to a user."""
        return CaseCRUD.update_case(db, case_id, assigned_to=user_id)
    
    @staticmethod
    def unassign_case(db: Session, case_id: int) -> Optional[Case]:
        """Unassign a case."""
        return CaseCRUD.update_case(db, case_id, assigned_to=None)
    
    @staticmethod
    def delete_case(db: Session, case_id: int) -> bool:
        """Delete a case."""
        case = db.query(Case).filter(Case.id == case_id).first()
        if not case:
            return False
        
        db.delete(case)
        db.commit()
        return True
    
    @staticmethod
    def get_cases_by_creator(db: Session, creator_id: int, skip: int = 0, limit: int = 10) -> List[Case]:
        """Get all cases created by a user."""
        return db.query(Case).filter(Case.created_by == creator_id).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_cases_assigned_to(db: Session, user_id: int, skip: int = 0, limit: int = 10) -> List[Case]:
        """Get all cases assigned to a user."""
        return db.query(Case).filter(Case.assigned_to == user_id).offset(skip).limit(limit).all()


class CaseNoteCRUD:
    """CRUD operations for CaseNote model."""
    
    @staticmethod
    def get_note(db: Session, note_id: int) -> Optional[CaseNote]:
        """Get a case note by ID."""
        return db.query(CaseNote).filter(CaseNote.id == note_id).first()
    
    @staticmethod
    def get_case_notes(db: Session, case_id: int, skip: int = 0, limit: int = 50) -> List[CaseNote]:
        """Get all notes for a case."""
        return db.query(CaseNote).filter(CaseNote.case_id == case_id).offset(skip).limit(limit).all()
    
    @staticmethod
    def create_note(db: Session, case_id: int, note_text: str, analyst_id: Optional[int] = None) -> CaseNote:
        """Create a new case note."""
        note = CaseNote(
            case_id=case_id,
            analyst_id=analyst_id,
            note_text=note_text
        )
        
        db.add(note)
        db.commit()
        db.refresh(note)
        return note
    
    @staticmethod
    def update_note(db: Session, note_id: int, note_text: str) -> Optional[CaseNote]:
        """Update a case note."""
        note = db.query(CaseNote).filter(CaseNote.id == note_id).first()
        if not note:
            return None
        
        note.note_text = note_text
        db.commit()
        db.refresh(note)
        return note
    
    @staticmethod
    def delete_note(db: Session, note_id: int) -> bool:
        """Delete a case note."""
        note = db.query(CaseNote).filter(CaseNote.id == note_id).first()
        if not note:
            return False
        
        db.delete(note)
        db.commit()
        return True
