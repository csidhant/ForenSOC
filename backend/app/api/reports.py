"""PDF report generation and download."""

from pathlib import Path
from typing import List
from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_analyst_user, check_case_access
from app.config import get_settings
from app.database import get_db
from app.crud import report as report_crud
from app.models.user import User
from app.schemas.report import ReportGenerateRequest, ReportGenerateResponse, ReportRead
from app.services import report_generator

router = APIRouter(prefix="/api/reports", tags=["reports"])
settings = get_settings()


@router.get("", response_model=List[ReportRead])
async def list_reports(
    case_id: int = Query(..., description="Case ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db),
):
    if not check_case_access(current_user, case_id, db):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No access to case")
    rows = report_crud.list_reports_for_case(db, case_id, skip=skip, limit=limit)
    return [ReportRead.model_validate(r) for r in rows]


@router.post("/generate", response_model=ReportGenerateResponse, status_code=status.HTTP_201_CREATED)
async def generate_report(
    body: ReportGenerateRequest,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db),
):
    if not check_case_access(current_user, body.case_id, db):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No access to case")
    title = body.title or f"ForenSOC incident report — case {body.case_id}"
    try:
        path, size, sha, pages = report_generator.generate_case_pdf(
            db, body.case_id, title, current_user.id
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    r = report_crud.create_report(
        db,
        case_id=body.case_id,
        title=title,
        file_path=path,
        generated_by=current_user.id,
        file_size=size,
        file_hash=sha,
        included_sections=["summary", "alerts", "evidence", "notes"],
        total_pages=pages,
    )
    return ReportGenerateResponse(
        report=ReportRead.model_validate(r),
        message="PDF generated successfully",
    )


@router.get("/{report_id}/download")
async def download_report(
    report_id: int,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db),
):
    r = report_crud.get_report(db, report_id)
    if not r:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    if not check_case_access(current_user, r.case_id, db):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No access to case")
    path = Path(r.file_path)
    if not path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PDF file missing")
    safe = quote(f"{r.report_number}.pdf")
    return FileResponse(
        path=str(path),
        filename=f"{r.report_number}.pdf",
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''{safe}"},
    )
