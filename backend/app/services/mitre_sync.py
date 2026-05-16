"""Create MitreMapping rows from alerts linked to a case."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.alert import Alert
from app.models.mitre import MitreMapping


def sync_mitre_from_case_alerts(db: Session, case_id: int) -> int:
    """Replace mappings for this case derived from alert MITRE fields."""
    db.query(MitreMapping).filter(MitreMapping.case_id == case_id).delete(
        synchronize_session=False
    )

    alerts = db.query(Alert).filter(Alert.case_id == case_id).all()
    created = 0
    for a in alerts:
        if not a.mitre_id:
            continue
        mm = MitreMapping(
            case_id=case_id,
            alert_id=a.id,
            tactic=a.mitre_tactic or "Unknown",
            technique=a.mitre_technique or a.mitre_id,
            technique_id=a.mitre_id,
            confidence_level="High",
            description=(a.title or "")[:500],
            evidence_count=1,
        )
        db.add(mm)
        created += 1

    db.commit()
    return created
