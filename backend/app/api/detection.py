"""
Detection rules and engine API routes for ForenSOC.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.detection import (
    DetectionRuleCreate, DetectionRuleUpdate, DetectionRuleResponse,
    DetectionAlertResponse, DetectionScanRequest, DetectionScanResponse
)
from app.services.detection_engine import DetectionEngine, RuleManager
from app.api.dependencies import get_current_analyst_user
from app.models.user import User

router = APIRouter(prefix="/api/detection", tags=["detection"])


@router.post("/rules", response_model=DetectionRuleResponse, status_code=status.HTTP_201_CREATED)
async def create_detection_rule(
    rule_data: DetectionRuleCreate,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db)
):
    """
    Create a new detection rule.
    """
    # Check if rule name already exists
    rule_manager = RuleManager(db)
    existing = db.query(DetectionRule).filter(DetectionRule.name == rule_data.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rule name already exists"
        )

    rule = rule_manager.create_rule(rule_data.dict(), current_user.id)
    return DetectionRuleResponse.from_orm(rule)


@router.get("/rules", response_model=List[DetectionRuleResponse])
async def list_detection_rules(
    enabled_only: bool = Query(False, description="Return only enabled rules"),
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db)
):
    """
    List all detection rules.
    """
    rule_manager = RuleManager(db)
    rules = rule_manager.get_rules(enabled_only=enabled_only)
    return [DetectionRuleResponse.from_orm(rule) for rule in rules]


@router.get("/rules/{rule_id}", response_model=DetectionRuleResponse)
async def get_detection_rule(
    rule_id: int,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific detection rule by ID.
    """
    rule_manager = RuleManager(db)
    rule = rule_manager.get_rule(rule_id)
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Detection rule not found"
        )

    return DetectionRuleResponse.from_orm(rule)


@router.put("/rules/{rule_id}", response_model=DetectionRuleResponse)
async def update_detection_rule(
    rule_id: int,
    rule_data: DetectionRuleUpdate,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db)
):
    """
    Update a detection rule.
    """
    rule_manager = RuleManager(db)
    rule = rule_manager.update_rule(rule_id, rule_data.dict(exclude_unset=True))
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Detection rule not found"
        )

    return DetectionRuleResponse.from_orm(rule)


@router.delete("/rules/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_detection_rule(
    rule_id: int,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db)
):
    """
    Delete a detection rule.
    """
    rule_manager = RuleManager(db)
    success = rule_manager.delete_rule(rule_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Detection rule not found"
        )


@router.post("/rules/{rule_id}/toggle", response_model=DetectionRuleResponse)
async def toggle_detection_rule(
    rule_id: int,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db)
):
    """
    Toggle a detection rule's enabled status.
    """
    rule_manager = RuleManager(db)
    rule = rule_manager.toggle_rule(rule_id)
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Detection rule not found"
        )

    return DetectionRuleResponse.from_orm(rule)


@router.post("/scan", response_model=DetectionScanResponse)
async def scan_events(
    scan_request: DetectionScanRequest,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db)
):
    """
    Manually scan historical events for alerts.
    """
    detection_engine = DetectionEngine(db)
    alerts = detection_engine.scan_historical_events(scan_request.hours_back)

    return DetectionScanResponse(
        alerts_scanned=len(alerts),
        alerts_generated=len(alerts),
        message=f"Scanned events and generated {len(alerts)} alerts"
    )


@router.get("/alerts", response_model=List[DetectionAlertResponse])
async def list_detection_alerts(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    rule_id: Optional[int] = None,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db)
):
    """
    List alerts generated by detection rules.
    """
    from app.crud.alert import AlertCRUD

    # Get alerts that have detection rules
    query = db.query(Alert).filter(Alert.detection_rule_id.isnot(None))

    if rule_id:
        query = query.filter(Alert.detection_rule_id == rule_id)

    alerts = query.offset(skip).limit(limit).all()

    return [DetectionAlertResponse.from_orm(alert) for alert in alerts]


@router.get("/alerts/{alert_id}", response_model=DetectionAlertResponse)
async def get_detection_alert(
    alert_id: int,
    current_user: User = Depends(get_current_analyst_user),
    db: Session = Depends(get_db)
):
    """
    Get a detection-generated alert with rule and event details.
    """
    from app.crud.alert import AlertCRUD

    alert = AlertCRUD.get_alert(db, alert_id)
    if not alert or not alert.detection_rule_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Detection alert not found"
        )

    return DetectionAlertResponse.from_orm(alert)