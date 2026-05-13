"""MITRE dashboard API schemas."""

from typing import Optional

from pydantic import BaseModel


class MitreTechniqueCount(BaseModel):
    technique_id: str
    technique: str
    tactic: Optional[str] = None
    count: int


class MitreCaseSummary(BaseModel):
    case_id: int
    techniques: list[MitreTechniqueCount]
    mapping_rows: int
    alerts_with_mitre: int
