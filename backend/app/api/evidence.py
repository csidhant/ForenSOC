"""
Evidence upload, search, integrity verification, and chain-of-custody API.
"""

import os
import uuid
from pathlib import Path
from typing import List, Optional
from urllib.parse import quote

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.dependencies import (
    get_current_analyst_user,
    check_evidence_access,
)
from app.config import get_settings
from app.database import get_db
from app.crud import evidence as evidence_crud
from app.models.user import User
from app.schemas.evidence import (
    Evidence as EvidenceSchema,
    EvidenceCreate,
    EvidenceUpdate,
    EvidenceUploadResponse,
    ChainOfCustody as ChainOfCustodySchema,
    ChainOfCustodyCreate,
    ChainOfCustodyManualCreate,
)

router = APIRouter(prefix="/api/evidence", tags=["evidence"])
settings = get_settings()


def _evidence_sort_key(ev) -> float:
    from datetime import datetime

    t = getattr(ev, "uploaded_at", None)
    if isinstance(t, datetime):
        return t.timestamp()
    return 0.0


@router.post("/upload", response_model=EvidenceUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_evidence(
    case_id: int = Form(...),
    evidence_type: str = Form(...),
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    collected_by: Optional[str] = Form(None),
    is_sensitive: bool = Form(False),
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db),
):
    """Save an uploaded file, hash it, and create an evidence record with initial chain-of-custody."""
    from app.api.dependencies import check_case_access

    if not check_case_access(current_user, case_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this case",
        )

    upload_root = Path(settings.UPLOAD_DIR).resolve()
    case_dir = upload_root / str(case_id)
    case_dir.mkdir(parents=True, exist_ok=True)

    original_name = file.filename or "upload.bin"
    suffix = Path(original_name).suffix[:32]
    stored_name = f"{uuid.uuid4().hex}{suffix}"
    dest_path = case_dir / stored_name

    max_size = settings.MAX_UPLOAD_SIZE
    written = 0
    chunk_size = 1024 * 1024

    try:
        with open(dest_path, "wb") as out:
            while True:
                chunk = await file.read(chunk_size)
                if not chunk:
                    break
                written += len(chunk)
                if written > max_size:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail="File exceeds configured maximum upload size",
                    )
                out.write(chunk)
    except HTTPException:
        if dest_path.exists():
            try:
                dest_path.unlink()
            except OSError:
                pass
        raise
    except OSError as exc:
        if dest_path.exists():
            try:
                dest_path.unlink()
            except OSError:
                pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to store file: {exc}",
        ) from exc

    stored_path_str = str(dest_path)

    try:
        payload = EvidenceCreate(
            case_id=case_id,
            evidence_type=evidence_type,
            filename=original_name,
            original_path=None,
            stored_path=stored_path_str,
            mime_type=file.content_type,
            description=description,
            is_sensitive=is_sensitive,
            collected_by=collected_by,
        )
        db_evidence = evidence_crud.create_evidence(db, payload, uploaded_by=current_user.id)
    except ValueError as exc:
        if dest_path.exists():
            try:
                dest_path.unlink()
            except OSError:
                pass
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    return EvidenceUploadResponse(
        evidence=EvidenceSchema.model_validate(db_evidence),
        upload_success=True,
        message="Evidence uploaded and hashed successfully",
    )


@router.get("", response_model=List[EvidenceSchema])
async def list_evidence(
    case_id: Optional[int] = None,
    evidence_type: Optional[str] = None,
    filename: Optional[str] = None,
    hash_value: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db),
):
    """Search evidence with optional filters (restricted by case access)."""
    from app.crud.case import CaseCRUD

    rows: list = []
    if current_user.role.name.lower() != "admin" and case_id is None:
        created = CaseCRUD.get_cases_by_creator(db, current_user.id, skip=0, limit=500)
        assigned = CaseCRUD.get_cases_assigned_to(db, current_user.id, skip=0, limit=500)
        case_ids = {c.id for c in list(created) + list(assigned)}
        if not case_ids:
            return []
        for cid in case_ids:
            rows.extend(
                evidence_crud.search_evidence(
                    db,
                    case_id=cid,
                    evidence_type=evidence_type,
                    filename=filename,
                    hash_value=hash_value,
                    skip=0,
                    limit=500,
                )
            )
        seen: set = set()
        deduped = []
        for ev in sorted(rows, key=_evidence_sort_key, reverse=True):
            if ev.id not in seen:
                seen.add(ev.id)
                deduped.append(ev)
        rows = deduped[skip : skip + limit]
    else:
        rows = evidence_crud.search_evidence(
            db,
            case_id=case_id,
            evidence_type=evidence_type,
            filename=filename,
            hash_value=hash_value,
            skip=skip,
            limit=limit,
        )

    visible = [ev for ev in rows if check_evidence_access(current_user, ev.id, db)]
    return [EvidenceSchema.model_validate(ev) for ev in visible]


@router.get("/{evidence_id}", response_model=EvidenceSchema)
async def get_evidence(
    evidence_id: int,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db),
):
    """Get evidence metadata; logs a chain-of-custody 'viewed' entry."""
    if not check_evidence_access(current_user, evidence_id, db):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    ev = evidence_crud.get_evidence(db, evidence_id)
    if not ev:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence not found")

    evidence_crud.create_chain_of_custody(
        db,
        ChainOfCustodyCreate(
            evidence_id=evidence_id,
            action="viewed",
            actor_id=current_user.id,
            details=f"Metadata viewed: {ev.filename}",
        ),
    )
    return EvidenceSchema.model_validate(ev)


@router.get("/{evidence_id}/chain-of-custody", response_model=List[ChainOfCustodySchema])
async def get_chain_of_custody(
    evidence_id: int,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db),
):
    """List chain-of-custody entries for an evidence item."""
    if not check_evidence_access(current_user, evidence_id, db):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    ev = evidence_crud.get_evidence(db, evidence_id)
    if not ev:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence not found")

    entries = evidence_crud.get_chain_of_custody(db, evidence_id)
    return [ChainOfCustodySchema.model_validate(c) for c in entries]


@router.post("/{evidence_id}/chain-of-custody", response_model=ChainOfCustodySchema)
async def append_chain_of_custody(
    evidence_id: int,
    body: ChainOfCustodyManualCreate,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db),
):
    """Manually append a chain-of-custody record (e.g. analysis step)."""
    if not check_evidence_access(current_user, evidence_id, db):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    ev = evidence_crud.get_evidence(db, evidence_id)
    if not ev:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence not found")

    coc = evidence_crud.create_chain_of_custody(
        db,
        ChainOfCustodyCreate(
            evidence_id=evidence_id,
            action=body.action,
            actor_id=current_user.id,
            details=body.details,
            tool_used=body.tool_used,
            output_hash=body.output_hash,
        ),
    )
    return ChainOfCustodySchema.model_validate(coc)


@router.post("/{evidence_id}/verify", response_model=EvidenceSchema)
async def verify_evidence(
    evidence_id: int,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db),
):
    """Recompute SHA-256 and update integrity status plus chain-of-custody."""
    if not check_evidence_access(current_user, evidence_id, db):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    updated = evidence_crud.verify_evidence_integrity(db, evidence_id, verified_by=current_user.id)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence not found")
    return EvidenceSchema.model_validate(updated)


@router.put("/{evidence_id}", response_model=EvidenceSchema)
async def update_evidence(
    evidence_id: int,
    body: EvidenceUpdate,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db),
):
    """Update editable metadata fields (not file content or hashes)."""
    if not check_evidence_access(current_user, evidence_id, db):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    updated = evidence_crud.update_evidence(db, evidence_id, body)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence not found")
    return EvidenceSchema.model_validate(updated)


@router.delete("/{evidence_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_evidence(
    evidence_id: int,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db),
):
    """Remove evidence record and stored file (admin or case access)."""
    if not check_evidence_access(current_user, evidence_id, db):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    ok = evidence_crud.delete_evidence(db, evidence_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence not found")


@router.get("/{evidence_id}/download")
async def download_evidence(
    evidence_id: int,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db),
):
    """Download the stored artifact; logs 'exported' in chain of custody."""
    if not check_evidence_access(current_user, evidence_id, db):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    ev = evidence_crud.get_evidence(db, evidence_id)
    if not ev or not ev.stored_path:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence not found")

    path = Path(ev.stored_path)
    if not path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stored file missing")

    evidence_crud.create_chain_of_custody(
        db,
        ChainOfCustodyCreate(
            evidence_id=evidence_id,
            action="exported",
            actor_id=current_user.id,
            details=f"File downloaded: {ev.filename}",
        ),
    )

    safe = quote(ev.filename)
    return FileResponse(
        path=str(path),
        filename=ev.filename,
        media_type=ev.mime_type or "application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''{safe}"},
    )
