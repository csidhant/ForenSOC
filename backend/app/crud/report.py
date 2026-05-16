"""CRUD for generated reports."""

import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.report import Report


def next_report_number(db: Session) -> str:
    return f"RPT-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"


def create_report(
    db: Session,
    *,
    case_id: int,
    title: str,
    file_path: str,
    generated_by: Optional[int],
    file_size: Optional[int] = None,
    file_hash: Optional[str] = None,
    included_sections: Optional[list] = None,
    total_pages: Optional[int] = None,
) -> Report:
    r = Report(
        report_number=next_report_number(db),
        case_id=case_id,
        title=title,
        file_path=file_path,
        file_size=file_size,
        file_hash=file_hash,
        generated_by=generated_by,
        report_date=datetime.utcnow(),
        status="Generated",
        included_sections=included_sections,
        total_pages=total_pages,
    )
    db.add(r)
    db.commit()
    db.refresh(r)
    return r


def list_reports_for_case(
    db: Session, case_id: int, skip: int = 0, limit: int = 50
) -> List[Report]:
    return (
        db.query(Report)
        .filter(Report.case_id == case_id)
        .order_by(Report.generated_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_report(db: Session, report_id: int) -> Optional[Report]:
    return db.query(Report).filter(Report.id == report_id).first()


def delete_report(db: Session, report_id: int) -> bool:
    r = get_report(db, report_id)
    if not r:
        return False
    db.delete(r)
    db.commit()
    return True
