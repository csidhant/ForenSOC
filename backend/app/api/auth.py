"""
Authentication API routes for ForenSOC.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.config import get_settings
from app.schemas.user import UserLogin, Token, UserWithRole, UserRegister
from app.crud.user import UserCRUD, RoleCRUD
from app.services.auth_service import create_access_token, decode_token
from jose import JWTError, jwt

router = APIRouter(prefix="/api/auth", tags=["authentication"])
settings = get_settings()


def _get_token(request: Request) -> str:
    """Extract JWT token from Authorization header."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return auth_header[7:]


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    User login endpoint.

    Returns JWT access token on successful authentication.
    """
    # Verify username and password
    user = UserCRUD.verify_password_and_get_user(
        db, credentials.username, credentials.password
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="User account is inactive"
        )

    # Update last login
    UserCRUD.update_last_login(db, user.id)

    # Create JWT token
    access_token = create_access_token(
        user_id=user.id, username=user.username, role=user.role.name
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserWithRole.from_orm(user),
    }


@router.post(
    "/register", response_model=UserWithRole, status_code=status.HTTP_201_CREATED
)
async def register(credentials: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user.

    New users are assigned the default viewer role.
    """
    if UserCRUD.get_user_by_username(db, credentials.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )

    if UserCRUD.get_user_by_email(db, credentials.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    role = RoleCRUD.get_role_by_name(db, "viewer")
    if not role:
        role = RoleCRUD.get_role_by_name(db, "Viewer")
    if not role:
        role = RoleCRUD.create_role(db, "viewer", "Default self-registered user role")

    user = UserCRUD.create_user(
        db,
        username=credentials.username,
        email=credentials.email,
        password=credentials.password,
        role_id=role.id,
    )

    return UserWithRole.from_orm(user)


@router.post("/logout")
async def logout():
    """
    User logout endpoint.

    Client should discard the token after receiving this response.
    """
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserWithRole)
async def get_current_user(
    token: str = Depends(_get_token), db: Session = Depends(get_db)
):
    """
    Get current authenticated user information.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_token(token)
        user_id: int = int(payload.get("sub"))
        username: str = payload.get("username")

        if user_id is None or username is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = UserCRUD.get_user(db, user_id)

    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="User account is inactive"
        )

    return UserWithRole.from_orm(user)


@router.post("/refresh")
async def refresh_token(
    token: str = Depends(_get_token), db: Session = Depends(get_db)
):
    """
    Refresh JWT access token.

    Returns a new access token if the current token is valid.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_token(token)
        user_id: int = int(payload.get("sub"))
        username: str = payload.get("username")
        role: str = payload.get("role")

        if user_id is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = UserCRUD.get_user(db, user_id)

    if user is None or not user.is_active:
        raise credentials_exception

    # Create new JWT token
    new_access_token = create_access_token(
        user_id=user.id, username=user.username, role=user.role.name
    )

    return {"access_token": new_access_token, "token_type": "bearer"}
