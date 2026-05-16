"""Volatility 3 wrapper — runs a small set of plugins when `vol` is available."""

from __future__ import annotations

import shutil
import subprocess
from typing import List, Optional

from sqlalchemy.orm import Session

from app.config import get_settings
from app.crud.evidence import get_evidence
from app.models.forensics import VolatilityResult

settings = get_settings()

DEFAULT_PLUGINS = [
    "windows.info",
    "windows.pslist",
    "windows.pstree",
    "windows.netstat",
]


def analyze_memory_dump(
    db: Session,
    evidence_id: int,
    analyzed_by: Optional[int],
    plugins: Optional[List[str]] = None,
) -> List[VolatilityResult]:
    ev = get_evidence(db, evidence_id)
    if not ev or not ev.stored_path:
        raise ValueError("Evidence not found or missing file")

    vol_bin = shutil.which(settings.VOLATILITY_PATH) or settings.VOLATILITY_PATH
    use_plugins = plugins or DEFAULT_PLUGINS
    results: List[VolatilityResult] = []

    for plugin in use_plugins:
        out_text = ""
        try:
            proc = subprocess.run(
                [vol_bin, "-f", ev.stored_path, plugin],
                capture_output=True,
                text=True,
                timeout=300,
            )
            out_text = (proc.stdout or "") + (
                "\n# stderr:\n" + proc.stderr if proc.stderr else ""
            )
            if proc.returncode != 0 and not out_text.strip():
                out_text = f"# Plugin {plugin} exit {proc.returncode}"
        except FileNotFoundError:
            out_text = f"# Volatility binary not found: {vol_bin}"
        except subprocess.TimeoutExpired:
            out_text = f"# Plugin {plugin} timed out"

        # Basic suspicious indicator detection
        indicators = []
        if "powershell" in out_text.lower() and (
            "-enc" in out_text.lower() or "hidden" in out_text.lower()
        ):
            indicators.append("Encoded or hidden PowerShell process detected")
        if "cmd.exe" in out_text.lower() and (
            "winword.exe" in out_text.lower() or "excel.exe" in out_text.lower()
        ):
            indicators.append("Office application spawning cmd.exe detected")
        if "lsass.exe" in out_text.lower() and plugin == "windows.netstat":
            indicators.append("LSASS process making network connections (suspicious)")
        if "malfind" in plugin and "MZ" in out_text:
            indicators.append("Potential injected code (malfind match)")

        vr = VolatilityResult(
            evidence_id=evidence_id,
            memory_dump_name=ev.filename,
            plugin_name=plugin,
            plugin_output=out_text[:200000],
            suspicious_indicators=",".join(indicators) if indicators else None,
            analyzed_by=analyzed_by,
        )
        db.add(vr)
        results.append(vr)

    db.commit()
    for r in results:
        db.refresh(r)
    return results
