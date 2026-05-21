"""
YARA scanner service for ForenSOC.
Compiles and runs YARA rules against evidence files.
"""

import os
import yara
from typing import List, Optional
from sqlalchemy.orm import Session
from pathlib import Path

from app.models.forensics import YaraResult
from app.crud.evidence import get_evidence
from app.config import get_settings

settings = get_settings()

RULES_DIR = Path(__file__).parent.parent / "rules" / "yara"


def ensure_rules_dir():
    """Ensure the YARA rules directory exists and has at least one rule."""
    if not RULES_DIR.exists():
        RULES_DIR.mkdir(parents=True, exist_ok=True)

    # Create a default rule if none exist
    default_rule_path = RULES_DIR / "default.yar"
    if not default_rule_path.exists():
        with open(default_rule_path, "w") as f:
            f.write(
                """
rule Suspicious_Strings {
    meta:
        description = "Detects suspicious strings commonly used in malware"
        severity = "Medium"
    strings:
        $s1 = "powershell.exe" nocase
        $s2 = "cmd.exe /c" nocase
        $s3 = "Invoke-Expression" nocase
        $s4 = "base64" nocase
        $s5 = "Temp\\\\.+\\\\.exe" regex
    condition:
        any of them
}
"""
            )


def scan_evidence(
    db: Session, evidence_id: int, analyzed_by: Optional[int] = None
) -> List[YaraResult]:
    """Scan a file with all compiled YARA rules."""
    ensure_rules_dir()

    ev = get_evidence(db, evidence_id)
    if not ev or not ev.stored_path:
        raise ValueError("Evidence not found or missing file")

    file_path = Path(ev.stored_path)
    if not file_path.is_file():
        raise ValueError(f"Evidence file not found at {ev.stored_path}")

    # Compile rules
    rule_files = list(RULES_DIR.glob("*.yar")) + list(RULES_DIR.glob("*.yara"))
    if not rule_files:
        return []

    results = []

    try:
        # Compile all rules together
        rules = yara.compile(filepaths={str(f.stem): str(f) for f in rule_files})
        matches = rules.match(str(file_path))

        # Track which rules matched
        matched_rule_names = {m.rule for m in matches}

        # We want to record results for all rules, or at least the matches
        # The model seems to store one row per rule match

        for match in matches:
            # Extract metadata if available
            severity = match.meta.get("severity", "Medium")
            category = match.meta.get("category", "Malware")
            description = match.meta.get("description", "")

            # Format matched strings
            matched_strings = []
            for offset, identifier, data in match.strings:
                try:
                    string_val = data.decode("utf-8", errors="replace")
                    matched_strings.append(f"{identifier}: {string_val}")
                except Exception:
                    matched_strings.append(f"{identifier}: [binary data]")

            res = YaraResult(
                evidence_id=evidence_id,
                rule_name=match.rule,
                rule_severity=severity,
                rule_category=category,
                matched=True,
                matched_strings="\\n".join(matched_strings[:100]),  # Cap strings
                match_count=len(match.strings),
                raw_output=str(match.tags) + " " + description,
            )
            db.add(res)
            results.append(res)

        if not matches:
            # Optionally log a "no match" result for the whole scan
            # But usually we just care about matches.
            # The roadmap says "Parse YARA results (matched rules, strings, severity)"
            pass

        db.commit()
        for r in results:
            db.refresh(r)

    except yara.Error as e:
        # Log error or handle it
        print(f"YARA Error: {e}")
        raise ValueError(f"YARA compilation or scanning failed: {e}")

    return results

def scan_file_path(file_path: str) -> List[dict]:
    """Scan a raw file path with all compiled YARA rules without DB interactions."""
    ensure_rules_dir()
    
    path = Path(file_path)
    if not path.is_file():
        raise ValueError(f"File not found at {file_path}")

    rule_files = list(RULES_DIR.glob("*.yar")) + list(RULES_DIR.glob("*.yara"))
    if not rule_files:
        return []

    results = []
    try:
        rules = yara.compile(filepaths={str(f.stem): str(f) for f in rule_files})
        matches = rules.match(str(path))

        for match in matches:
            severity = match.meta.get("severity", "Medium")
            category = match.meta.get("category", "Malware")
            description = match.meta.get("description", "")

            matched_strings = []
            for offset, identifier, data in match.strings:
                try:
                    string_val = data.decode("utf-8", errors="replace")
                    matched_strings.append(f"{identifier}: {string_val}")
                except Exception:
                    matched_strings.append(f"{identifier}: [binary data]")

            results.append({
                "rule_name": match.rule,
                "rule_severity": severity,
                "rule_category": category,
                "matched_strings": "\\n".join(matched_strings[:10]),
                "match_count": len(match.strings),
                "description": description
            })
    except yara.Error as e:
        print(f"YARA Error: {e}")
        raise ValueError(f"YARA scanning failed: {e}")

    return results
