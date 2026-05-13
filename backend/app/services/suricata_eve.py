"""Parse Suricata EVE JSON (newline-delimited) and attach summary to PCAPAnalysis."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, List

from sqlalchemy.orm import Session

from app.crud.evidence import get_evidence
from app.models.forensics import PCAPAnalysis


def analyze_suricata_eve_file(db: Session, evidence_id: int, eve_file_path: str, analyzed_by: int | None) -> PCAPAnalysis:
    """Read EVE NDJSON from disk path (already uploaded as evidence)."""
    ev = get_evidence(db, evidence_id)
    if not ev:
        raise ValueError("Evidence not found")

    path = Path(eve_file_path)
    if not path.is_file():
        raise ValueError("EVE file missing")

    alerts: List[dict] = []
    flows: List[dict] = []
    dns_rows: List[dict] = []
    http_rows: List[dict] = []
    tls_rows: List[dict] = []

    with path.open("r", encoding="utf-8", errors="replace") as fh:
        for i, line in enumerate(fh):
            if i > 50000:
                break
            line = line.strip()
            if not line:
                continue
            try:
                obj: Any = json.loads(line)
            except json.JSONDecodeError:
                continue
            et = obj.get("event_type")
            if et == "alert":
                alerts.append(obj)
            elif et == "flow":
                flows.append(obj)
            elif et == "dns":
                dns_rows.append(obj)
            elif et == "http":
                http_rows.append(obj)
            elif et == "tls":
                tls_rows.append(obj)

    row = PCAPAnalysis(
        evidence_id=evidence_id,
        analyzed_by=analyzed_by,
        suricata_executed=True,
        suricata_alerts=json.dumps(alerts[:500])[:120000],
        suricata_flows=json.dumps(flows[:200])[:80000],
        suricata_dns=json.dumps(dns_rows[:200])[:80000],
        suricata_http=json.dumps(http_rows[:200])[:80000],
        suricata_tls=json.dumps(tls_rows[:200])[:80000],
        suspicious_dns_detected=len([d for d in dns_rows if len(str(d.get("rrname", ""))) > 80]),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row
