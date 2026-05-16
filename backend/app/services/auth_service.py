"""
Authentication service for user authentication and authorization.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional
import bcrypt

if not hasattr(bcrypt, "__about__"):

    class About:
        __version__ = getattr(bcrypt, "__version__", "4.0.0")

    bcrypt.__about__ = About

from jose import JWTError, jwt
from passlib.context import CryptContext
from app.config import get_settings

settings = get_settings()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(
    user_id: int, username: str, role: str, expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT access token.

    Args:
        user_id: User ID
        username: Username
        role: User role
        expires_delta: Token expiration time (defaults to 24 hours)

    Returns:
        JWT token
    """
    to_encode = {
        "sub": str(user_id),
        "username": username,
        "role": role,
    }

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )

    return encoded_jwt


def decode_token(token: str) -> dict:
    """
    Decode and verify a JWT token.

    Args:
        token: JWT token

    Returns:
        Decoded token data

    Raises:
        JWTError: If token is invalid
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        raise
