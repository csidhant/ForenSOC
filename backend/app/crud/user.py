"""
CRUD operations for User and Role models.
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.user import User, Role
from app.services.auth_service import hash_password, verify_password
from datetime import datetime
from typing import Optional, List


class RoleCRUD:
    """CRUD operations for Role model."""

    @staticmethod
    def get_role(db: Session, role_id: int) -> Optional[Role]:
        """Get a role by ID."""
        return db.query(Role).filter(Role.id == role_id).first()

    @staticmethod
    def get_role_by_name(db: Session, name: str) -> Optional[Role]:
        """Get a role by name."""
        return db.query(Role).filter(Role.name == name).first()

    @staticmethod
    def get_all_roles(db: Session, skip: int = 0, limit: int = 10) -> List[Role]:
        """Get all roles with pagination."""
        return db.query(Role).offset(skip).limit(limit).all()

    @staticmethod
    def create_role(db: Session, name: str, description: Optional[str] = None) -> Role:
        """Create a new role."""
        role = Role(name=name, description=description)
        db.add(role)
        db.commit()
        db.refresh(role)
        return role

    @staticmethod
    def update_role(
        db: Session,
        role_id: int,
        name: Optional[str] = None,
        description: Optional[str] = None,
    ) -> Optional[Role]:
        """Update a role."""
        role = db.query(Role).filter(Role.id == role_id).first()
        if not role:
            return None

        if name is not None:
            role.name = name
        if description is not None:
            role.description = description

        db.commit()
        db.refresh(role)
        return role

    @staticmethod
    def delete_role(db: Session, role_id: int) -> bool:
        """Delete a role."""
        role = db.query(Role).filter(Role.id == role_id).first()
        if not role:
            return False

        db.delete(role)
        db.commit()
        return True


class UserCRUD:
    """CRUD operations for User model."""

    @staticmethod
    def get_user(db: Session, user_id: int) -> Optional[User]:
        """Get a user by ID."""
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_user_by_username(db: Session, username: str) -> Optional[User]:
        """Get a user by username."""
        return db.query(User).filter(User.username == username).first()

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """Get a user by email."""
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_all_users(
        db: Session, skip: int = 0, limit: int = 10, active_only: bool = False
    ) -> List[User]:
        """Get all users with pagination."""
        query = db.query(User)

        if active_only:
            query = query.filter(User.is_active == True)

        return query.offset(skip).limit(limit).all()

    @staticmethod
    def create_user(
        db: Session, username: str, email: str, password: str, role_id: int
    ) -> User:
        """Create a new user."""
        # Hash password
        hashed_password = hash_password(password)

        user = User(
            username=username,
            email=email,
            password_hash=hashed_password,
            role_id=role_id,
            is_active=True,
        )

        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def update_user(
        db: Session,
        user_id: int,
        email: Optional[str] = None,
        role_id: Optional[int] = None,
        is_active: Optional[bool] = None,
    ) -> Optional[User]:
        """Update a user."""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None

        if email is not None:
            user.email = email
        if role_id is not None:
            user.role_id = role_id
        if is_active is not None:
            user.is_active = is_active

        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def update_password(db: Session, user_id: int, new_password: str) -> Optional[User]:
        """Update a user's password."""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None

        user.password_hash = hash_password(new_password)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def verify_password_and_get_user(
        db: Session, username: str, password: str
    ) -> Optional[User]:
        """Verify password and get user."""
        user = UserCRUD.get_user_by_username(db, username)
        if not user or not verify_password(password, user.password_hash):
            return None

        return user

    @staticmethod
    def update_last_login(db: Session, user_id: int) -> Optional[User]:
        """Update user's last login timestamp."""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None

        user.last_login = datetime.utcnow()
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def delete_user(db: Session, user_id: int) -> bool:
        """Delete a user."""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return False

        db.delete(user)
        db.commit()
        return True

    @staticmethod
    def deactivate_user(db: Session, user_id: int) -> Optional[User]:
        """Deactivate a user (soft delete)."""
        return UserCRUD.update_user(db, user_id, is_active=False)

    @staticmethod
    def activate_user(db: Session, user_id: int) -> Optional[User]:
        """Activate a user."""
        return UserCRUD.update_user(db, user_id, is_active=True)
