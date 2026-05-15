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

    # Heuristic detection from logs
    port_scans = 0
    suspicious_dns = 0
    data_exfil = 0
    suspicious_downloads = 0
    
    findings = []
    
    if row.zeek_conn_log:
        try:
            unique_ports = set()
            total_bytes_out = 0
            lines = row.zeek_conn_log.split("\n")
            for line in lines:
                if line.startswith("#") or not line.strip():
                    continue
                parts = line.split("\t")
                if len(parts) > 5:
                    resp_p = parts[5]
                    unique_ports.add(resp_p)
                    if len(parts) > 10:
                        try:
                            # Zeek conn.log usually has orig_bytes at index 9 and resp_bytes at index 10
                            bytes_sent = int(parts[9]) if parts[9].isdigit() else 0
                            total_bytes_out += bytes_sent
                        except (ValueError, IndexError):
                            pass
            
            if len(unique_ports) > 20:
                port_scans = 1
                findings.append({
                    "title": "Network Port Scan Detected",
                    "severity": "Medium",
                    "type": "Network",
                    "desc": f"Observed traffic to {len(unique_ports)} unique destination ports, suggesting a port scan.",
                    "mitre": ("Discovery", "Network Service Discovery", "T1046")
                })
                
            if total_bytes_out > 100 * 1024 * 1024: # 100MB
                data_exfil = 1
                findings.append({
                    "title": "Large Outbound Data Transfer",
                    "severity": "High",
                    "type": "Data Exfiltration",
                    "desc": f"Detected over {total_bytes_out // (1024*1024)}MB of outbound data transfer.",
                    "mitre": ("Exfiltration", "Exfiltration Over Alternative Protocol", "T1048")
                })
        except Exception:
            pass

    if row.zeek_dns_log:
        try:
            lines = row.zeek_dns_log.split("\n")
            domains = {}
            long_queries = []
            
            for line in lines:
                if line.startswith("#") or not line.strip():
                    continue
                parts = line.split("\t")
                if len(parts) > 8:
                    query = parts[9] if len(parts) > 9 else ""
                    if not query: continue
                    
                    # Heuristic 1: Query length
                    if len(query) > 100:
                        long_queries.append(query)
                    
                    # Heuristic 2: Subdomain entropy/count
                    base_domain = ".".join(query.split(".")[-2:])
                    if base_domain not in domains:
                        domains[base_domain] = set()
                    domains[base_domain].add(query)

            # Check heuristics
            for dom, queries in domains.items():
                if len(queries) > 50: # High number of unique subdomains
                    suspicious_dns += 1
                    findings.append({
                        "title": "Possible DNS Tunneling Detected",
                        "severity": "High",
                        "type": "C2",
                        "desc": f"Detected high volume of unique subdomains ({len(queries)}) for domain: {dom}",
                        "mitre": ("Command and Control", "Protocol Tunneling", "T1572")
                    })
            
            if len(long_queries) > 5:
                suspicious_dns += 1
                findings.append({
                    "title": "Suspiciously Long DNS Queries",
                    "severity": "Medium",
                    "type": "Network",
                    "desc": f"Detected {len(long_queries)} DNS queries exceeding 100 characters, common in C2/Tunneling.",
                    "mitre": ("Command and Control", "Protocol Tunneling", "T1572")
                })
        except Exception:
            pass

    if row.zeek_http_log or row.zeek_files_log:
        try:
            # Check for suspicious download patterns
            patterns = ["raw.githubusercontent.com", "pastebin.com/raw", "github.com/.*/raw/"]
            all_logs = (row.zeek_http_log or "") + (row.zeek_files_log or "")
            for p in patterns:
                if p in all_logs:
                    suspicious_downloads += 1
                    findings.append({
                        "title": "Suspicious Script Download",
                        "severity": "Medium",
                        "type": "Malware",
                        "desc": f"Detected network activity associated with common script/malware hosting pattern: {p}",
                        "mitre": ("Execution", "Command and Scripting Interpreter", "T1059")
                    })
                    break
        except Exception:
            pass

    row.port_scans_detected = port_scans
    row.suspicious_dns_detected = suspicious_dns
    row.data_exfiltration_detected = data_exfil
    row.suspicious_downloads_detected = suspicious_downloads

    # Generate Alerts in DB
    from app.crud.alert import AlertCRUD
    import time
    
    for f in findings:
        AlertCRUD.create_alert(
            db,
            alert_number=f"NET-{int(time.time())}-{evidence_id}",
            title=f["title"],
            severity=f["severity"],
            description=f["desc"],
            alert_type=f["type"],
            case_id=ev.case_id,
            mitre_tactic=f["mitre"][0],
            mitre_technique=f["mitre"][1],
            mitre_id=f["mitre"][2],
            created_by=analyzed_by
        )

    db.add(row)
    db.commit()
    db.refresh(row)
    return row
