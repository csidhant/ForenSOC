"""
File system forensics service for ForenSOC.
Analyzes evidence files for suspicious extensions, types, and Ransomware-like patterns.
"""

import os
import magic
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from pathlib import Path
from datetime import datetime

from app.models.forensics import (
    BrowserArtifact,
)  # Re-using this or could create a FileArtifact model
from app.crud.evidence import get_evidence, create_chain_of_custody
from app.schemas.evidence import ChainOfCustodyCreate

SUSPICIOUS_EXTENSIONS = {
    ".exe",
    ".dll",
    ".ps1",
    ".bat",
    ".vbs",
    ".scr",
    ".pif",
    ".com",
    ".msi",
    ".js",
    ".jse",
    ".wsf",
    ".wsh",
    ".hta",
    ".cpl",
    ".msc",
    ".jar",
}

ARCHIVE_EXTENSIONS = {".zip", ".rar", ".7z", ".tar", ".gz"}


def analyze_file(
    db: Session, evidence_id: int, analyzed_by: Optional[int] = None
) -> Dict[str, Any]:
    """Perform basic forensic analysis on a file."""
    ev = get_evidence(db, evidence_id)
    if not ev or not ev.stored_path:
        raise ValueError("Evidence not found or missing file")

    file_path = Path(ev.stored_path)
    if not file_path.is_file():
        raise ValueError(f"Evidence file not found at {ev.stored_path}")

    stats = file_path.stat()

    # Identify file type using magic
    file_type = magic.from_file(str(file_path))
    mime_type = magic.from_file(str(file_path), mime=True)

    # Check for suspicious extension
    ext = file_path.suffix.lower()
    is_suspicious_ext = ext in SUSPICIOUS_EXTENSIONS

    # Extension mismatch check
    # Simplified: if it's an executable but doesn't have an executable extension, or vice-versa
    is_mismatch = False
    if "executable" in file_type.lower() and ext not in SUSPICIOUS_EXTENSIONS:
        is_mismatch = True

    findings = {
        "filename": ev.filename,
        "extension": ext,
        "size": stats.st_size,
        "mime_type": mime_type,
        "file_description": file_type,
        "created_at": datetime.fromtimestamp(stats.st_ctime).isoformat(),
        "modified_at": datetime.fromtimestamp(stats.st_mtime).isoformat(),
        "accessed_at": datetime.fromtimestamp(stats.st_atime).isoformat(),
        "is_suspicious_extension": is_suspicious_ext,
        "is_type_mismatch": is_mismatch,
        "recommendations": [],
    }

    if is_suspicious_ext:
        findings["recommendations"].append(
            f"Suspicious extension {ext} detected. Perform YARA scan."
        )
    if is_mismatch:
        findings["recommendations"].append(
            f"File type mismatch: {file_type} with extension {ext}."
        )

    # Log to Chain of Custody
    create_chain_of_custody(
        db=db,
        chain_of_custody=ChainOfCustodyCreate(
            evidence_id=evidence_id,
            action="analyzed",
            actor_id=analyzed_by,
            details=f"Basic file analysis performed. Type: {mime_type}",
            tool_used="FileAnalyzer (python-magic)",
        ),
    )

    return findings


def scan_directory_for_ransomware(directory_path: str) -> List[Dict[str, Any]]:
    """
    Placeholder for ransomware detection logic.
    In a real scenario, this would scan a directory for many files modified recently
    with common ransomware extensions or high entropy.
    """
    # This would be used if the evidence was a directory/disk image
    return []
