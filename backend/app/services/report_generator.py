"""Generate a simple PDF incident report for a case (ReportLab)."""

from __future__ import annotations

from pathlib import Path
from typing import List

from sqlalchemy.orm import Session, joinedload

from app.config import get_settings
from app.models.case import Case
from app.models.alert import Alert
from app.utils.hash_utils import calculate_sha256
from sqlalchemy import func

settings = get_settings()


import html


def _safe_paragraph(text: str, max_len: int = 4000) -> str:
    if not text:
        return ""
    return html.escape(text.replace("\x00", "")[:max_len])


def generate_case_pdf(db: Session, case_id: int, title: str, generated_by: int | None) -> tuple[str, int, str, int]:
    """
    Build PDF under UPLOAD_DIR/reports/{case_id}/.

    Returns (file_path, file_size_bytes, sha256, page_count)
    """
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
    from reportlab.lib import colors

    case = (
        db.query(Case)
        .options(
            joinedload(Case.alerts),
            joinedload(Case.evidence),
            joinedload(Case.notes),
        )
        .filter(Case.id == case_id)
        .first()
    )
    if not case:
        raise ValueError("Case not found")

    out_dir = Path(settings.UPLOAD_DIR).resolve() / "reports" / str(case_id)
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"case-{case_id}-report.pdf"

    styles = getSampleStyleSheet()
    story: List = []

    story.append(Paragraph(_safe_paragraph(f"<b>{title}</b>"), styles["Title"]))
    story.append(Spacer(1, 12))
    story.append(
        Paragraph(
            _safe_paragraph(
                f"<b>Case:</b> {case.case_number} — {case.title}<br/>"
                f"<b>Status:</b> {case.status}<br/>"
                f"<b>Severity:</b> {case.severity}<br/>"
                f"<b>Description:</b> {case.description or 'N/A'}"
            ),
            styles["BodyText"],
        )
    )
    story.append(Spacer(1, 18))
    story.append(Paragraph("<b>Alerts (summary)</b>", styles["Heading2"]))
    alert_data = [["#", "Severity", "Title", "When"]]
    for a in sorted(case.alerts or [], key=lambda x: x.detected_time or x.id)[:40]:
        alert_data.append(
            [
                _safe_paragraph(a.alert_number, 200),
                _safe_paragraph(a.severity, 40),
                _safe_paragraph(a.title, 200),
                str(a.detected_time)[:19] if a.detected_time else "",
            ]
        )
    t = Table(alert_data, repeatRows=1)
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
            ]
        )
    )
    story.append(t)
    story.append(Spacer(1, 18))

    story.append(Paragraph("<b>Evidence (summary)</b>", styles["Heading2"]))
    ev_data = [["ID", "Type", "Filename", "SHA-256 (prefix)"]]
    for e in case.evidence or []:
        ev_data.append(
            [
                _safe_paragraph(e.evidence_id, 80),
                _safe_paragraph(e.evidence_type, 80),
                _safe_paragraph(e.filename, 120),
                (e.sha256_hash or "")[:16] + "…",
            ]
        )
    if len(ev_data) == 1:
        ev_data.append(["—", "—", "No evidence", "—"])
    t2 = Table(ev_data, repeatRows=1)
    t2.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
            ]
        )
    )
    story.append(t2)
    story.append(Spacer(1, 18))

    # MITRE ATT&CK Section
    story.append(Paragraph("<b>MITRE ATT&CK Summary</b>", styles["Heading2"]))
    mitre_data = [["ID", "Technique", "Tactic", "Count"]]
    q = (
        db.query(Alert.mitre_id, Alert.mitre_technique, Alert.mitre_tactic, func.count(Alert.id))
        .filter(Alert.case_id == case_id, Alert.mitre_id.is_not(None))
        .group_by(Alert.mitre_id, Alert.mitre_technique, Alert.mitre_tactic)
        .all()
    )
    for m_id, tech, tact, cnt in q:
        mitre_data.append([
            _safe_paragraph(m_id, 20),
            _safe_paragraph(tech, 100),
            _safe_paragraph(tact, 100),
            str(cnt)
        ])
    
    if len(mitre_data) == 1:
        mitre_data.append(["—", "—", "No MITRE mappings", "—"])
    
    t3 = Table(mitre_data, repeatRows=1)
    t3.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
    ]))
    story.append(t3)
    story.append(Spacer(1, 18))

    story.append(Paragraph("<b>Recommendations</b>", styles["Heading2"]))
    recs = [n for n in (case.notes or []) if n.note_type == "recommendation"]
    if not recs:
        story.append(Paragraph("No recommendations recorded for this case.", styles["Italic"]))
    for r in recs[:10]:
        story.append(Paragraph(f"• {_safe_paragraph(r.note_text, 1500)}", styles["BodyText"]))
        story.append(Spacer(1, 4))
    story.append(Spacer(1, 18))

    story.append(Paragraph("<b>Investigation Notes</b>", styles["Heading2"]))
    invest_notes = [n for n in (case.notes or []) if n.note_type != "recommendation"]
    if not invest_notes:
        story.append(Paragraph("No investigation notes recorded.", styles["Italic"]))
    for n in invest_notes[:20]:
        story.append(Paragraph(_safe_paragraph(n.note_text, 1500), styles["BodyText"]))
        story.append(Spacer(1, 6))

    doc = SimpleDocTemplate(str(out_path), pagesize=letter)
    doc.build(story)

    size = out_path.stat().st_size
    sha = calculate_sha256(str(out_path))
    return str(out_path), size, sha, 1
