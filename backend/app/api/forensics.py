"""PCAP, memory dump, and Suricata EVE analysis endpoints."""

from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.dependencies import check_case_access, get_current_analyst_user
from app.config import get_settings
from app.database import get_db
from app.crud import evidence as evidence_crud
from app.models.forensics import PCAPAnalysis
from app.models.user import User
from app.schemas.evidence import EvidenceCreate
from app.schemas.forensics import ForensicsJobResponse, PCAPAnalysisRead, VolatilityResultRead, YaraResultRead
from app.services import memory_analyzer, pcap_analyzer, suricata_eve, upload_bytes, yara_scanner, file_analyzer

router = APIRouter(prefix="/api/forensics", tags=["forensics"])
settings = get_settings()


async def _ingest_file(
    db: Session,
    current_user: User,
    case_id: int,
    evidence_type: str,
    file: UploadFile,
    description: Optional[str],
) -> int:
    if not check_case_access(current_user, case_id, db):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No access to case")
    stored_path, original_name, _size = await upload_bytes.save_uploaded_file(settings, case_id, file)
    payload = EvidenceCreate(
        case_id=case_id,
        evidence_type=evidence_type,
        filename=original_name,
        stored_path=stored_path,
        mime_type=file.content_type,
        description=description,
    )
    try:
        ev = evidence_crud.create_evidence(db, payload, uploaded_by=current_user.id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return ev.id


def _enqueue_pcap(evidence_id: int) -> None:
    try:
        from app.tasks.forensics_tasks import analyze_pcap_task

        analyze_pcap_task.delay(evidence_id)
    except Exception:  # noqa: BLE001 — Celery optional
        pass


def _enqueue_memory(evidence_id: int) -> None:
    try:
        from app.tasks.forensics_tasks import analyze_memory_task

        analyze_memory_task.delay(evidence_id)
    except Exception:
        pass


@router.post("/pcap", response_model=ForensicsJobResponse)
async def upload_and_analyze_pcap(
    case_id: int = Form(...),
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    async_worker: bool = Form(False),
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db),
):
    """Upload PCAP as evidence and run Zeek/pyshark analysis (sync unless async_worker + Celery)."""
    ev_id = await _ingest_file(db, current_user, case_id, "PCAP", file, description)
    if async_worker:
        _enqueue_pcap(ev_id)
        return ForensicsJobResponse(
            evidence_id=ev_id,
            message="PCAP uploaded; analysis queued on Celery worker (if configured)",
            pcap_analysis_id=None,
        )
    row = pcap_analyzer.analyze_pcap_for_evidence(db, ev_id, analyzed_by=current_user.id)
    return ForensicsJobResponse(
        evidence_id=ev_id,
        message="PCAP analyzed",
        pcap_analysis_id=row.id,
    )


@router.post("/memory", response_model=ForensicsJobResponse)
async def upload_and_analyze_memory(
    case_id: int = Form(...),
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    async_worker: bool = Form(False),
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db),
):
    ev_id = await _ingest_file(db, current_user, case_id, "Memory Dump", file, description)
    if async_worker:
        _enqueue_memory(ev_id)
        return ForensicsJobResponse(
            evidence_id=ev_id,
            message="Memory dump uploaded; Volatility job queued (if Celery available)",
            volatility_result_ids=None,
        )
    rows = memory_analyzer.analyze_memory_dump(db, ev_id, analyzed_by=current_user.id)
    return ForensicsJobResponse(
        evidence_id=ev_id,
        message="Volatility plugins executed (see volatility_results)",
        volatility_result_ids=[r.id for r in rows],
    )


@router.post("/suricata-eve", response_model=ForensicsJobResponse)
async def upload_and_analyze_suricata_eve(
    case_id: int = Form(...),
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db),
):
    ev_id = await _ingest_file(db, current_user, case_id, "Suricata EVE", file, description)
    ev = evidence_crud.get_evidence(db, ev_id)
    row = suricata_eve.analyze_suricata_eve_file(db, ev_id, ev.stored_path, analyzed_by=current_user.id)
    return ForensicsJobResponse(
        evidence_id=ev_id,
        message="Suricata EVE JSON parsed into pcap_analysis row",
        pcap_analysis_id=row.id,
    )


@router.post("/yara-scan/{evidence_id}", response_model=ForensicsJobResponse)
async def scan_evidence_with_yara(
    evidence_id: int,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db),
):
    """Run YARA scan on existing evidence."""
    from app.api.dependencies import check_evidence_access
    if not check_evidence_access(current_user, evidence_id, db):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    try:
        results = yara_scanner.scan_evidence(db, evidence_id, analyzed_by=current_user.id)
        return ForensicsJobResponse(
            evidence_id=evidence_id,
            message=f"YARA scan complete: {len(results)} matches found",
            yara_result_ids=[r.id for r in results]
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.get("/evidence/{evidence_id}/yara-results", response_model=List[YaraResultRead])
async def list_yara_results(
    evidence_id: int,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db),
):
    from app.api.dependencies import check_evidence_access
    from app.models.forensics import YaraResult

    if not check_evidence_access(current_user, evidence_id, db):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    rows = db.query(YaraResult).filter(YaraResult.evidence_id == evidence_id).all()
    return [YaraResultRead.model_validate(r) for r in rows]


@router.post("/file-analysis/{evidence_id}")
async def run_file_analysis(
    evidence_id: int,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db),
):
    """Run basic file analysis (magic, extensions, etc.) on existing evidence."""
    from app.api.dependencies import check_evidence_access
    if not check_evidence_access(current_user, evidence_id, db):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    try:
        results = file_analyzer.analyze_file(db, evidence_id, analyzed_by=current_user.id)
        return {
            "evidence_id": evidence_id,
            "message": "File analysis complete",
            "findings": results
        }
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.get("/pcap-analysis/{analysis_id}", response_model=PCAPAnalysisRead)
async def get_pcap_analysis(
    analysis_id: int,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db),
):
    from app.api.dependencies import check_evidence_access
    from app.crud.evidence import get_evidence

    row = db.query(PCAPAnalysis).filter(PCAPAnalysis.id == analysis_id).first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    if not check_evidence_access(current_user, row.evidence_id, db):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return PCAPAnalysisRead.model_validate(row)


@router.get("/evidence/{evidence_id}/volatility-results", response_model=List[VolatilityResultRead])
async def list_volatility_results(
    evidence_id: int,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db),
):
    from app.api.dependencies import check_evidence_access
    from app.models.forensics import VolatilityResult

    if not check_evidence_access(current_user, evidence_id, db):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    rows = db.query(VolatilityResult).filter(VolatilityResult.evidence_id == evidence_id).all()
    return [VolatilityResultRead.model_validate(r) for r in rows]
