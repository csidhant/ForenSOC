"""
CRUD operations for Evidence management.
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
import os
import hashlib
from datetime import datetime

from app.models.evidence import Evidence, ChainOfCustody
from app.schemas.evidence import EvidenceCreate, EvidenceUpdate, ChainOfCustodyCreate
from app.utils.hash_utils import calculate_file_hash


def get_evidence(db: Session, evidence_id: int) -> Optional[Evidence]:
    """Get evidence by ID."""
    return db.query(Evidence).filter(Evidence.id == evidence_id).first()


def get_evidence_by_evidence_id(db: Session, evidence_id: str) -> Optional[Evidence]:
    """Get evidence by evidence ID string."""
    return db.query(Evidence).filter(Evidence.evidence_id == evidence_id).first()


def get_evidence_by_case(db: Session, case_id: int, skip: int = 0, limit: int = 100) -> List[Evidence]:
    """Get all evidence for a case."""
    return db.query(Evidence).filter(Evidence.case_id == case_id).offset(skip).limit(limit).all()


def get_evidence_by_hash(db: Session, hash_value: str) -> List[Evidence]:
    """Get evidence by SHA256 hash."""
    return db.query(Evidence).filter(Evidence.sha256_hash == hash_value).all()


def search_evidence(
    db: Session,
    case_id: Optional[int] = None,
    evidence_type: Optional[str] = None,
    filename: Optional[str] = None,
    hash_value: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Evidence]:
    """Search evidence with filters."""
    query = db.query(Evidence)

    if case_id:
        query = query.filter(Evidence.case_id == case_id)
    if evidence_type:
        query = query.filter(Evidence.evidence_type == evidence_type)
    if filename:
        query = query.filter(Evidence.filename.ilike(f"%{filename}%"))
    if hash_value:
        query = query.filter(
            or_(Evidence.sha256_hash == hash_value, Evidence.md5_hash == hash_value)
        )

    return query.offset(skip).limit(limit).all()


def create_evidence(db: Session, evidence: EvidenceCreate, uploaded_by: int) -> Evidence:
    """Create new evidence record."""
    if not evidence.stored_path or not os.path.exists(evidence.stored_path):
        raise ValueError("Evidence file must exist at stored_path before persisting metadata")

    # Generate evidence ID
    existing_count = db.query(Evidence).filter(Evidence.case_id == evidence.case_id).count()
    evidence_id = f"EV-{evidence.case_id:03d}-{existing_count + 1:03d}"

    sha256_hash = calculate_file_hash(evidence.stored_path, "sha256")
    md5_hash = calculate_file_hash(evidence.stored_path, "md5")
    file_size = os.path.getsize(evidence.stored_path)

    db_evidence = Evidence(
        evidence_id=evidence_id,
        case_id=evidence.case_id,
        evidence_type=evidence.evidence_type,
        filename=evidence.filename,
        original_path=evidence.original_path,
        stored_path=evidence.stored_path,
        file_size=file_size,
        mime_type=evidence.mime_type,
        sha256_hash=sha256_hash,
        md5_hash=md5_hash,
        integrity_status="Verified",
        uploaded_by=uploaded_by,
        collected_date=evidence.collected_date,
        collected_by=evidence.collected_by,
        description=evidence.description,
        is_sensitive=evidence.is_sensitive,
        source_system=evidence.source_system,
    )

    db.add(db_evidence)
    db.commit()
    db.refresh(db_evidence)

    # Create initial chain of custody entry
    create_chain_of_custody(
        db=db,
        chain_of_custody=ChainOfCustodyCreate(
            evidence_id=db_evidence.id,
            action="uploaded",
            actor_id=uploaded_by,
            details=f"Evidence uploaded: {evidence.filename}",
        )
    )

    return db_evidence


def update_evidence(db: Session, evidence_id: int, evidence_update: EvidenceUpdate) -> Optional[Evidence]:
    """Update evidence record."""
    db_evidence = get_evidence(db, evidence_id)
    if not db_evidence:
        return None

    update_data = evidence_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_evidence, field, value)

    db.commit()
    db.refresh(db_evidence)
    return db_evidence


def delete_evidence(db: Session, evidence_id: int) -> bool:
    """Delete evidence record."""
    db_evidence = get_evidence(db, evidence_id)
    if not db_evidence:
        return False

    # Delete associated files if they exist
    if db_evidence.stored_path and os.path.exists(db_evidence.stored_path):
        try:
            os.remove(db_evidence.stored_path)
        except OSError:
            pass  # File may be in use or already deleted

    db.delete(db_evidence)
    db.commit()
    return True


def verify_evidence_integrity(db: Session, evidence_id: int, verified_by: int) -> Optional[Evidence]:
    """Verify evidence file integrity by recalculating hash."""
    db_evidence = get_evidence(db, evidence_id)
    if not db_evidence or not db_evidence.stored_path:
        return None

    if not os.path.exists(db_evidence.stored_path):
        db_evidence.integrity_status = "File Missing"
        db.commit()
        return db_evidence

    # Recalculate hash
    current_hash = calculate_file_hash(db_evidence.stored_path, "sha256")

    if current_hash == db_evidence.sha256_hash:
        db_evidence.integrity_status = "Verified"
    else:
        db_evidence.integrity_status = "Tampered"

    db_evidence.hash_verified_at = datetime.utcnow()
    db_evidence.hash_verified_by = verified_by

    db.commit()
    db.refresh(db_evidence)

    # Log to chain of custody
    create_chain_of_custody(
        db=db,
        chain_of_custody=ChainOfCustodyCreate(
            evidence_id=evidence_id,
            action="hash_verified",
            actor_id=verified_by,
            details=f"Integrity check: {db_evidence.integrity_status}",
        )
    )

    return db_evidence


# Chain of Custody operations

def get_chain_of_custody(db: Session, evidence_id: int) -> List[ChainOfCustody]:
    """Get chain of custody for evidence."""
    return db.query(ChainOfCustody).filter(
        ChainOfCustody.evidence_id == evidence_id
    ).order_by(ChainOfCustody.action_time).all()


def create_chain_of_custody(db: Session, chain_of_custody: ChainOfCustodyCreate) -> ChainOfCustody:
    """Create chain of custody entry."""
    db_coc = ChainOfCustody(
        evidence_id=chain_of_custody.evidence_id,
        action=chain_of_custody.action,
        actor_id=chain_of_custody.actor_id,
        actor_name=chain_of_custody.actor_name,
        details=chain_of_custody.details,
        tool_used=chain_of_custody.tool_used,
        output_hash=chain_of_custody.output_hash,
    )

    db.add(db_coc)
    db.commit()
    db.refresh(db_coc)
    return db_coc