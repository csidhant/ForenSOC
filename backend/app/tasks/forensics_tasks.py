"""Background forensics tasks."""

from app.celery_app import celery_app


@celery_app.task(name="forensics.analyze_pcap")
def analyze_pcap_task(evidence_id: int) -> str:
    from app.database import SessionLocal
    from app.services import pcap_analyzer

    db = SessionLocal()
    try:
        pcap_analyzer.analyze_pcap_for_evidence(db, evidence_id, analyzed_by=None)
        return f"pcap_done:{evidence_id}"
    finally:
        db.close()


@celery_app.task(name="forensics.analyze_memory")
def analyze_memory_task(evidence_id: int) -> str:
    from app.database import SessionLocal
    from app.services import memory_analyzer

    db = SessionLocal()
    try:
        memory_analyzer.analyze_memory_dump(db, evidence_id, analyzed_by=None)
        return f"memory_done:{evidence_id}"
    finally:
        db.close()
