from fastapi import APIRouter, Depends, Query, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Dict, Any
from app.database import get_db
from app.models.alert import Alert
from app.models.evidence import Evidence
from app.services.yara_scanner import scan_file_path
import hashlib
import os
import shutil
import json

router = APIRouter(prefix="/api/public", tags=["public"])

@router.get("/search", response_model=Dict[str, Any])
async def public_search(
    query: str = Query(..., description="IP, Domain, or Hash to search for"),
    db: Session = Depends(get_db),
):
    """
    Public Threat Intelligence Search Endpoint (No Authentication required)
    Searches the ForenSOC database for any known indicators (hashes, IPs, etc.)
    """
    results = {
        "query": query,
        "intel_found": False,
        "alerts": [],
        "evidence": [],
        "summary": ""
    }

    # Search Evidence by Hash
    evidence = db.query(Evidence).filter(
        or_(
            Evidence.sha256_hash == query,
            Evidence.md5_hash == query,
            Evidence.filename.ilike(f"%{query}%")
        )
    ).all()

    if evidence:
        results["intel_found"] = True
        for ev in evidence:
            results["evidence"].append({
                "type": ev.evidence_type,
                "filename": ev.filename,
                "sha256": ev.sha256_hash,
                "integrity_status": ev.integrity_status,
                "uploaded_at": str(ev.uploaded_at)
            })

    # Search Alerts by IP or description containing the query
    alerts = db.query(Alert).filter(
        or_(
            Alert.source_ip == query,
            Alert.dest_ip == query,
            Alert.description.ilike(f"%{query}%")
        )
    ).limit(50).all()

    if alerts:
        results["intel_found"] = True
        for al in alerts:
            results["alerts"].append({
                "name": al.title,
                "severity": al.severity,
                "source_ip": al.source_ip,
                "timestamp": str(al.detected_time),
                "mitre_id": al.mitre_id,
            })
            
    if not results["intel_found"]:
        results["summary"] = f"No threat intelligence found for indicator: {query}"
    else:
        results["summary"] = f"Found {len(results['alerts'])} alerts and {len(results['evidence'])} evidence files associated with this indicator."

    return results

@router.post("/scan", response_model=Dict[str, Any])
async def public_file_scan(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Public Threat Intelligence File Scanner (Like VirusTotal).
    Upload a file anonymously to get it hashed and scanned with YARA rules.
    If malicious, it is saved to the crowdsourced vault and an Alert is generated.
    """
    temp_dir = "uploads/temp_public"
    os.makedirs(temp_dir, exist_ok=True)
    temp_path = os.path.join(temp_dir, file.filename)
    
    sha256_hash = hashlib.sha256()
    
    try:
        with open(temp_path, "wb") as buffer:
            while chunk := await file.read(8192):
                sha256_hash.update(chunk)
                buffer.write(chunk)
                
        file_hash = sha256_hash.hexdigest()
        
        # Scan with YARA
        yara_results = scan_file_path(temp_path)
        
        is_malicious = len(yara_results) > 0
        
        if is_malicious:
            import uuid
            perm_dir = "uploads/crowdsourced"
            os.makedirs(perm_dir, exist_ok=True)
            perm_path = os.path.join(perm_dir, f"{file_hash}_{file.filename}")
            shutil.copy2(temp_path, perm_path)
            
            # Generate Alert
            rule_names = [r["rule_name"] for r in yara_results]
            new_alert = Alert(
                alert_number=f"ALT-CROWD-{uuid.uuid4().hex[:8].upper()}",
                title=f"Crowdsourced Malware: {file.filename}",
                description=f"Anonymous upload detected as malicious by YARA.\\nHash: {file_hash}\\nSaved to: {perm_path}\\nMatches: {', '.join(rule_names)}",
                severity="High",
                status="New",
                alert_type="Crowdsourced Malware",
            )
            db.add(new_alert)
            db.commit()
        
        return {
            "filename": file.filename,
            "sha256": file_hash,
            "yara_matches": yara_results,
            "status": "Malicious" if is_malicious else "Clean",
            "message": "File analyzed successfully. Malicious files have been forwarded to the SOC."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to scan file: {str(e)}")
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
