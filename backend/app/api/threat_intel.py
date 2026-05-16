from fastapi import APIRouter, Depends, Query
from app.services.threat_intel import ThreatIntelService
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/threat-intel", tags=["threat-intel"])


@router.get("/check-ip")
async def check_ip(
    ip: str = Query(..., description="IP address to check"),
    current_user: User = Depends(get_current_user),
):
    """Check IP against public threat intelligence feeds."""
    return ThreatIntelService.check_ip(ip)


@router.get("/check-hash")
async def check_hash(
    file_hash: str = Query(..., description="File hash to check"),
    current_user: User = Depends(get_current_user),
):
    """Check file hash against public threat intelligence feeds."""
    return ThreatIntelService.check_hash(file_hash)
