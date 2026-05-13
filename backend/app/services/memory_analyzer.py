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
            out_text = (proc.stdout or "") + ("\n# stderr:\n" + proc.stderr if proc.stderr else "")
            if proc.returncode != 0 and not out_text.strip():
                out_text = f"# Plugin {plugin} exit {proc.returncode}"
        except FileNotFoundError:
            out_text = f"# Volatility binary not found: {vol_bin}"
        except subprocess.TimeoutExpired:
            out_text = f"# Plugin {plugin} timed out"

        vr = VolatilityResult(
            evidence_id=evidence_id,
            memory_dump_name=ev.filename,
            plugin_name=plugin,
            plugin_output=out_text[:200000],
            suspicious_indicators=None,
            analyzed_by=analyzed_by,
        )
        db.add(vr)
        results.append(vr)

    db.commit()
    for r in results:
        db.refresh(r)
    return results
