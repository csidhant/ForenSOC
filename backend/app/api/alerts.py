"""
Alert management API routes for ForenSOC.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.alert import (
    AlertCreate, AlertUpdate, AlertResponse, AlertDetailResponse,
    AlertNoteCreate, AlertNoteUpdate, AlertNoteResponse,
    AlertStatisticsResponse
)
from app.crud.alert import AlertCRUD, AlertNoteCRUD
from app.api.dependencies import (
    get_current_user, get_current_analyst_user, check_alert_access
)
from app.models.user import User

router = APIRouter(prefix="/api/alerts", tags=["alerts"])


@router.post("", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
async def create_alert(
    alert_data: AlertCreate,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db)
):
    """
    Create a new alert.
    """
    # Check if alert number already exists
    if AlertCRUD.get_alert_by_number(db, alert_data.alert_number):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Alert number already exists"
        )
    
    # Create alert
    new_alert = AlertCRUD.create_alert(
        db,
        alert_number=alert_data.alert_number,
        title=alert_data.title,
        severity=alert_data.severity,
        description=alert_data.description,
        alert_type=alert_data.alert_type,
        source_ip=alert_data.source_ip,
        dest_ip=alert_data.dest_ip,
        source_port=alert_data.source_port,
        dest_port=alert_data.dest_port,
        hostname=alert_data.hostname,
        username=alert_data.username,
        event_time=alert_data.event_time,
        mitre_tactic=alert_data.mitre_tactic,
        mitre_technique=alert_data.mitre_technique,
        mitre_id=alert_data.mitre_id,
        created_by=current_user.id
    )
    
    return AlertResponse.from_orm(new_alert)


@router.get("", response_model=List[AlertResponse])
async def list_alerts(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    status: Optional[str] = None,
    severity: Optional[str] = None,
    case_id: Optional[int] = None,
    alert_type: Optional[str] = None,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db)
):
    """
    List alerts with optional filtering.
    
    Analysts see alerts assigned to them, admins see all alerts.
    """
    if current_user.role.name.lower() in ["admin", "viewer"]:
        alerts = AlertCRUD.get_all_alerts(
            db,
            skip=skip,
            limit=limit,
            status=status,
            severity=severity,
            case_id=case_id,
            alert_type=alert_type
        )
    else:
        # Analysts see alerts assigned to them
        alerts = AlertCRUD.get_alerts_assigned_to(db, current_user.id, skip=skip, limit=limit)
        
        # Apply additional filters
        if status:
            alerts = [a for a in alerts if a.status == status]
        if severity:
            alerts = [a for a in alerts if a.severity == severity]
        if alert_type:
            alerts = [a for a in alerts if a.alert_type == alert_type]
    
    return [AlertResponse.from_orm(alert) for alert in alerts]


@router.get("/{alert_id}", response_model=AlertDetailResponse)
async def get_alert(
    alert_id: int,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db)
):
    """
    Get alert by ID with all related data.
    """
    # Check access
    if not check_alert_access(current_user, alert_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this alert"
        )
    
    alert = AlertCRUD.get_alert(db, alert_id)
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    # Get related notes
    notes = [AlertNoteResponse.from_orm(n) for n in alert.notes]
    
    alert_detail = AlertDetailResponse.from_orm(alert)
    alert_detail.notes = notes
    
    return alert_detail


@router.put("/{alert_id}", response_model=AlertResponse)
async def update_alert(
    alert_id: int,
    alert_data: AlertUpdate,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db)
):
    """
    Update an alert.
    """
    # Check access
    if not check_alert_access(current_user, alert_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this alert"
        )
    
    alert = AlertCRUD.get_alert(db, alert_id)
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    # Update alert
    updated_alert = AlertCRUD.update_alert(
        db,
        alert_id,
        title=alert_data.title,
        description=alert_data.description,
        severity=alert_data.severity,
        status=alert_data.status,
        case_id=alert_data.case_id,
        assigned_to=alert_data.assigned_to,
        mitre_tactic=alert_data.mitre_tactic,
        mitre_technique=alert_data.mitre_technique
    )
    
    return AlertResponse.from_orm(updated_alert)


@router.delete("/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_alert(
    alert_id: int,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db)
):
    """
    Delete an alert (alert creator or admin only).
    """
    alert = AlertCRUD.get_alert(db, alert_id)
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    # Check permissions
    if alert.created_by != current_user.id and current_user.role.name.lower() != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this alert"
        )
    
    AlertCRUD.delete_alert(db, alert_id)


# Alert Notes endpoints
@router.post("/{alert_id}/notes", response_model=AlertNoteResponse, status_code=status.HTTP_201_CREATED)
async def add_alert_note(
    alert_id: int,
    note_data: AlertNoteCreate,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db)
):
    """
    Add a note to an alert.
    """
    # Check alert exists and user has access
    if not check_alert_access(current_user, alert_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this alert"
        )
    
    alert = AlertCRUD.get_alert(db, alert_id)
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    # Create note
    new_note = AlertNoteCRUD.create_note(
        db,
        alert_id=alert_id,
        note_text=note_data.note_text,
        analyst_id=current_user.id
    )
    
    return AlertNoteResponse.from_orm(new_note)


@router.get("/{alert_id}/notes", response_model=List[AlertNoteResponse])
async def get_alert_notes(
    alert_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db)
):
    """
    Get all notes for an alert.
    """
    # Check access
    if not check_alert_access(current_user, alert_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this alert"
        )
    
    alert = AlertCRUD.get_alert(db, alert_id)
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    notes = AlertNoteCRUD.get_alert_notes(db, alert_id, skip=skip, limit=limit)
    return [AlertNoteResponse.from_orm(note) for note in notes]


@router.put("/{alert_id}/notes/{note_id}", response_model=AlertNoteResponse)
async def update_alert_note(
    alert_id: int,
    note_id: int,
    note_data: AlertNoteUpdate,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db)
):
    """
    Update an alert note.
    """
    # Check alert access
    if not check_alert_access(current_user, alert_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this alert"
        )
    
    note = AlertNoteCRUD.get_note(db, note_id)
    if not note or note.alert_id != alert_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    updated_note = AlertNoteCRUD.update_note(db, note_id, note_data.note_text)
    return AlertNoteResponse.from_orm(updated_note)


@router.delete("/{alert_id}/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_alert_note(
    alert_id: int,
    note_id: int,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db)
):
    """
    Delete an alert note.
    """
    # Check alert access
    if not check_alert_access(current_user, alert_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this alert"
        )
    
    note = AlertNoteCRUD.get_note(db, note_id)
    if not note or note.alert_id != alert_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    AlertNoteCRUD.delete_note(db, note_id)


@router.post("/{alert_id}/close", response_model=AlertResponse)
async def close_alert(
    alert_id: int,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db)
):
    """
    Close an alert.
    """
    # Check access
    if not check_alert_access(current_user, alert_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this alert"
        )
    
    alert = AlertCRUD.close_alert(db, alert_id)
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    return AlertResponse.from_orm(alert)


@router.post("/{alert_id}/false-positive", response_model=AlertResponse)
async def mark_false_positive(
    alert_id: int,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db)
):
    """
    Mark an alert as false positive.
    """
    # Check access
    if not check_alert_access(current_user, alert_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this alert"
        )
    
    alert = AlertCRUD.mark_false_positive(db, alert_id)
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    return AlertResponse.from_orm(alert)


@router.post("/{alert_id}/assign/{user_id}", response_model=AlertResponse)
async def assign_alert(
    alert_id: int,
    user_id: int,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db)
):
    """
    Assign an alert to a user.
    """
    # Check access
    if not check_alert_access(current_user, alert_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this alert"
        )
    
    alert = AlertCRUD.assign_alert(db, alert_id, user_id)
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    return AlertResponse.from_orm(alert)


@router.post("/{alert_id}/unassign", response_model=AlertResponse)
async def unassign_alert(
    alert_id: int,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db)
):
    """
    Unassign an alert.
    """
    if not check_alert_access(current_user, alert_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this alert"
        )
    
    alert = AlertCRUD.unassign_alert(db, alert_id)
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    return AlertResponse.from_orm(alert)


@router.post("/{alert_id}/case/{case_id}", response_model=AlertResponse)
async def link_alert_to_case(
    alert_id: int,
    case_id: int,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db)
):
    """
    Link an alert to a case.
    """
    if not check_alert_access(current_user, alert_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this alert"
        )
    
    alert = AlertCRUD.link_alert_to_case(db, alert_id, case_id)
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    return AlertResponse.from_orm(alert)


@router.delete("/{alert_id}/case", response_model=AlertResponse)
async def unlink_alert_from_case(
    alert_id: int,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db)
):
    """
    Unlink an alert from its case.
    """
    if not check_alert_access(current_user, alert_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this alert"
        )
    
    alert = AlertCRUD.unlink_alert_from_case(db, alert_id)
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    return AlertResponse.from_orm(alert)


@router.get("/stats/overview", response_model=AlertStatisticsResponse)
async def get_alert_statistics(
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db)
):
    """
    Get alert statistics overview.
    """
    # Get all alerts the user can see
    if current_user.role.name.lower() in ["admin", "viewer"]:
        alerts = AlertCRUD.get_all_alerts(db, skip=0, limit=10000)
    else:
        alerts = AlertCRUD.get_alerts_assigned_to(db, current_user.id, skip=0, limit=10000)
    
    # Calculate statistics
    stats = {
        "total_alerts": len(alerts),
        "new_alerts": len([a for a in alerts if a.status == "New"]),
        "in_progress_alerts": len([a for a in alerts if a.status == "In Progress"]),
        "closed_alerts": len([a for a in alerts if a.status == "Closed"]),
        "false_positive_alerts": len([a for a in alerts if a.status == "False Positive"]),
        "critical_alerts": len([a for a in alerts if a.severity == "Critical"]),
        "high_alerts": len([a for a in alerts if a.severity == "High"]),
        "medium_alerts": len([a for a in alerts if a.severity == "Medium"]),
        "low_alerts": len([a for a in alerts if a.severity == "Low"]),
    }
    
    return AlertStatisticsResponse(**stats)
