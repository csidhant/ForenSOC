"""
Dependency functions for FastAPI routes.
"""

from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud.user import UserCRUD
from app.services.auth_service import decode_token
from app.models.user import User
from jose import JWTError
from typing import Optional


async def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    """
    Dependency to get current authenticated user from JWT token.

    Raises:
        HTTPException: If token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Extract token from Authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise credentials_exception

    token = auth_header[7:]  # Remove "Bearer " prefix

    try:
        payload = decode_token(token)
        user_id: int = int(payload.get("sub"))

        if user_id is None:
            raise credentials_exception

    except (JWTError, ValueError):
        raise credentials_exception

    user = UserCRUD.get_user(db, user_id)

    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="User account is inactive"
        )

    return user


async def get_current_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependency to get current authenticated user and verify admin role.

    Raises:
        HTTPException: If user is not an admin
    """
    if current_user.role.name.lower() != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )

    return current_user


async def get_current_analyst_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependency to get current authenticated user and verify analyst role.

    Raises:
        HTTPException: If user is not an analyst, admin, or viewer
    """
    allowed_roles = ["analyst", "investigator", "admin", "viewer"]
    if current_user.role.name.lower() not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Analyst or Viewer access required",
        )

    return current_user


def check_case_access(user: User, case_id: int, db: Session) -> bool:
    """
    Check if user has access to a case.

    Returns True if:
    - User is admin or viewer
    - User created the case
    - User is assigned to the case
    """
    from app.crud.case import CaseCRUD

    if user.role.name.lower() in ["admin", "viewer"]:
        return True

    case = CaseCRUD.get_case(db, case_id)
    if not case:
        return False

    if case.created_by == user.id or case.assigned_to == user.id:
        return True

    return False


def check_alert_access(user: User, alert_id: int, db: Session) -> bool:
    """
    Check if user has access to an alert.

    Returns True if:
    - User is admin or viewer
    - User created the alert
    - User is assigned to the alert
    """
    from app.crud.alert import AlertCRUD

    if user.role.name.lower() in ["admin", "viewer"]:
        return True

    alert = AlertCRUD.get_alert(db, alert_id)
    if not alert:
        return False

    if alert.created_by == user.id or alert.assigned_to == user.id:
        return True

    return False


def check_evidence_access(
    user: User,
    evidence_db_id: int,
    db: Session,
) -> bool:
    """
    Check if user has access to an evidence item via its parent case.

    Same rules as case access: admin, case creator, or assignee.
    """
    from app.crud.evidence import get_evidence

    if user.role.name.lower() == "admin":
        return True

    ev = get_evidence(db, evidence_db_id)
    if not ev:
        return False

    return check_case_access(user, ev.case_id, db)
