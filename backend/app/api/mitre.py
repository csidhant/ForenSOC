"""MITRE ATT&CK summary for a case."""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.dependencies import check_case_access, get_current_analyst_user
from app.database import get_db
from app.models.alert import Alert
from app.models.mitre import MitreMapping
from app.models.user import User
from app.schemas.mitre_api import MitreCaseSummary, MitreTechniqueCount
from app.services import mitre_sync

router = APIRouter(prefix="/api/mitre", tags=["mitre"])


@router.get("/cases/{case_id}/summary", response_model=MitreCaseSummary)
async def mitre_case_summary(
    case_id: int,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db),
):
    if not check_case_access(current_user, case_id, db):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No access to case")

    q = (
        db.query(Alert.mitre_id, Alert.mitre_technique, Alert.mitre_tactic, func.count(Alert.id))
        .filter(Alert.case_id == case_id, Alert.mitre_id.is_not(None))
        .group_by(Alert.mitre_id, Alert.mitre_technique, Alert.mitre_tactic)
        .all()
    )
    techniques: List[MitreTechniqueCount] = []
    for mitre_id, technique, tactic, cnt in q:
        techniques.append(
            MitreTechniqueCount(
                technique_id=mitre_id,
                technique=technique or mitre_id,
                tactic=tactic,
                count=int(cnt),
            )
        )

    map_count = db.query(MitreMapping).filter(MitreMapping.case_id == case_id).count()
    alert_mitre = (
        db.query(Alert).filter(Alert.case_id == case_id, Alert.mitre_id.is_not(None)).count()
    )

    return MitreCaseSummary(
        case_id=case_id,
        techniques=sorted(techniques, key=lambda x: -x.count),
        mapping_rows=map_count,
        alerts_with_mitre=alert_mitre,
    )


@router.post("/cases/{case_id}/sync", response_model=dict)
async def mitre_sync_case(
    case_id: int,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db),
):
    if not check_case_access(current_user, case_id, db):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No access to case")
    n = mitre_sync.sync_mitre_from_case_alerts(db, case_id)
    return {"case_id": case_id, "mappings_created": n}


@router.get("/global-heatmap", response_model=List[MitreTechniqueCount])
async def mitre_global_heatmap(
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db),
):
    """Get cross-case MITRE technique counts for a global heatmap."""
    q = (
        db.query(Alert.mitre_id, Alert.mitre_technique, Alert.mitre_tactic, func.count(Alert.id))
        .filter(Alert.mitre_id.is_not(None))
        .group_by(Alert.mitre_id, Alert.mitre_technique, Alert.mitre_tactic)
        .all()
    )
    techniques: List[MitreTechniqueCount] = []
    for mitre_id, technique, tactic, cnt in q:
        techniques.append(
            MitreTechniqueCount(
                technique_id=mitre_id,
                technique=technique or mitre_id,
                tactic=tactic,
                count=int(cnt),
            )
        )
    return sorted(techniques, key=lambda x: -x.count)
