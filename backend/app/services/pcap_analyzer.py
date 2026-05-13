"""PCAP analysis: optional Zeek, optional pyshark summary."""

from __future__ import annotations

import json
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Optional

from sqlalchemy.orm import Session

from app.config import get_settings
from app.crud.evidence import get_evidence
from app.models.forensics import PCAPAnalysis

settings = get_settings()


def _read_tail(path: Path, max_chars: int = 80000) -> str:
    if not path.is_file():
        return ""
    try:
        data = path.read_text(encoding="utf-8", errors="replace")
        return data[:max_chars]
    except OSError:
        return ""


def analyze_pcap_for_evidence(db: Session, evidence_id: int, analyzed_by: Optional[int]) -> PCAPAnalysis:
    ev = get_evidence(db, evidence_id)
    if not ev or not ev.stored_path:
        raise ValueError("Evidence not found or missing file")

    pcap_path = Path(ev.stored_path)
    if not pcap_path.is_file():
        raise ValueError("PCAP file missing on disk")

    row = PCAPAnalysis(
        evidence_id=evidence_id,
        analyzed_by=analyzed_by,
        zeek_executed=False,
        suricata_executed=False,
    )

    zeek_bin = shutil.which(settings.ZEEK_PATH) or settings.ZEEK_PATH
    if zeek_bin:
        td = tempfile.mkdtemp(prefix="forensoc-zeek-")
        try:
            proc = subprocess.run(
                [zeek_bin, "-r", str(pcap_path)],
                cwd=td,
                capture_output=True,
                text=True,
                timeout=600,
            )
            row.zeek_executed = proc.returncode == 0
            td_path = Path(td)
            row.zeek_conn_log = _read_tail(td_path / "conn.log")
            row.zeek_dns_log = _read_tail(td_path / "dns.log")
            row.zeek_http_log = _read_tail(td_path / "http.log")
            row.zeek_ssl_log = _read_tail(td_path / "ssl.log")
            row.zeek_files_log = _read_tail(td_path / "files.log")
            row.zeek_ssh_log = _read_tail(td_path / "ssh.log")
            if proc.returncode != 0 and proc.stderr:
                row.zeek_conn_log = (row.zeek_conn_log or "") + "\n# zeek stderr:\n" + proc.stderr[:5000]
        except (subprocess.TimeoutExpired, FileNotFoundError, OSError) as exc:
            row.zeek_conn_log = f"# Zeek failed: {exc}"
        finally:
            shutil.rmtree(td, ignore_errors=True)

    pyshark_note = ""
    try:
        import pyshark

        cap = pyshark.FileCapture(str(pcap_path))
        n = 0
        for _ in cap:
            n += 1
            if n >= 5000:
                break
        cap.close()
        pyshark_note = json.dumps({"packet_count_sampled": n, "note": "pyshark count (capped)"})
    except Exception as exc:  # noqa: BLE001
        pyshark_note = json.dumps({"pyshark": "unavailable", "error": str(exc)[:500]})

    existing = (
        (row.zeek_conn_log or "")
        + "\n# pyshark:\n"
        + pyshark_note
    )
    row.zeek_conn_log = existing[:120000]

    # Heuristic port-scan proxy: unique dst ports in conn log not parsed here — placeholder counters
    row.port_scans_detected = 0
    row.suspicious_dns_detected = 0
    row.data_exfiltration_detected = 0
    row.suspicious_downloads_detected = 0

    db.add(row)
    db.commit()
    db.refresh(row)
    return row
