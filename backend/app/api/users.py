"""
User management API routes for ForenSOC.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.user import (
    UserCreate,
    UserUpdate,
    UserResponse,
    UserWithRole,
    RoleResponse,
)
from app.crud.user import UserCRUD, RoleCRUD
from app.api.dependencies import get_current_user, get_current_admin_user
from app.models.user import User

router = APIRouter(prefix="/api/users", tags=["users"])


@router.post("", response_model=UserWithRole, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """
    Create a new user (Admin only).
    """
    # Check if username already exists
    if UserCRUD.get_user_by_username(db, user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )

    # Check if email already exists
    if UserCRUD.get_user_by_email(db, user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    # Check if role exists
    role = RoleCRUD.get_role(db, user_data.role_id)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Role not found"
        )

    # Create user
    new_user = UserCRUD.create_user(
        db,
        username=user_data.username,
        email=user_data.email,
        password=user_data.password,
        role_id=user_data.role_id,
    )

    return UserWithRole.from_orm(new_user)


@router.get("/me", response_model=UserWithRole)
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Get current user information.
    """
    return UserWithRole.from_orm(current_user)


@router.get("", response_model=List[UserWithRole])
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    active_only: bool = Query(False),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """
    List all users (Admin only).
    """
    users = UserCRUD.get_all_users(db, skip=skip, limit=limit, active_only=active_only)
    return [UserWithRole.from_orm(user) for user in users]


@router.get("/{user_id}", response_model=UserWithRole)
async def get_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get user by ID.

    Users can view their own profile or admin can view any profile.
    """
    # Check permissions
    if current_user.id != user_id and current_user.role.name.lower() != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this user",
        )

    user = UserCRUD.get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    return UserWithRole.from_orm(user)


@router.put("/{user_id}", response_model=UserWithRole)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update user information.

    Users can update their own profile or admin can update any profile.
    """
    # Check permissions
    if current_user.id != user_id and current_user.role.name.lower() != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this user",
        )

    user = UserCRUD.get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Check if new email already exists (for other users)
    if user_data.email and user_data.email != user.email:
        if UserCRUD.get_user_by_email(db, user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Email already in use"
            )

    # Check if role exists (if being updated)
    if user_data.role_id and user_data.role_id != user.role_id:
        if not RoleCRUD.get_role(db, user_data.role_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Role not found"
            )

        # Only admin can change roles
        if current_user.role.name.lower() != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins can change user roles",
            )

    # Update user
    updated_user = UserCRUD.update_user(
        db, user_id, email=user_data.email, role_id=user_data.role_id
    )

    return UserWithRole.from_orm(updated_user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """
    Delete a user (Admin only).

    Note: Consider deactivating users instead of deleting for audit trail.
    """
    user = UserCRUD.get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Don't allow deleting the current admin
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own user account",
        )

    UserCRUD.delete_user(db, user_id)


@router.post("/{user_id}/deactivate", response_model=UserWithRole)
async def deactivate_user(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """
    Deactivate a user (Admin only).

    This is a soft delete - the user is marked as inactive.
    """
    user = UserCRUD.get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Don't allow deactivating the current admin
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own user account",
        )

    deactivated_user = UserCRUD.deactivate_user(db, user_id)
    return UserWithRole.from_orm(deactivated_user)


@router.post("/{user_id}/activate", response_model=UserWithRole)
async def activate_user(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """
    Activate a user (Admin only).
    """
    user = UserCRUD.get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    activated_user = UserCRUD.activate_user(db, user_id)
    return UserWithRole.from_orm(activated_user)


# Role routes
@router.get("/roles/list", response_model=List[RoleResponse])
async def list_roles(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    List all available roles.
    """
    roles = RoleCRUD.get_all_roles(db, skip=skip, limit=limit)
    return [RoleResponse.from_orm(role) for role in roles]


@router.get("/roles/{role_id}", response_model=RoleResponse)
async def get_role(
    role_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get role by ID.
    """
    role = RoleCRUD.get_role(db, role_id)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Role not found"
        )

    return RoleResponse.from_orm(role)


from app.schemas.user import UserPreferencesUpdate, UserPreferencesResponse
from app.models.user import UserPreferences


@router.get("/{user_id}/preferences", response_model=UserPreferencesResponse)
async def get_user_preferences(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.id != user_id and current_user.role.name.lower() != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    prefs = db.query(UserPreferences).filter(UserPreferences.user_id == user_id).first()
    if not prefs:
        prefs = UserPreferences(user_id=user_id)
        db.add(prefs)
        db.commit()
        db.refresh(prefs)

    return prefs


@router.put("/{user_id}/preferences", response_model=UserPreferencesResponse)
async def update_user_preferences(
    user_id: int,
    prefs_update: UserPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.id != user_id and current_user.role.name.lower() != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    prefs = db.query(UserPreferences).filter(UserPreferences.user_id == user_id).first()
    if not prefs:
        prefs = UserPreferences(user_id=user_id)
        db.add(prefs)

    for key, value in prefs_update.dict(exclude_unset=True).items():
        setattr(prefs, key, value)

    db.commit()
    db.refresh(prefs)
    return prefs
