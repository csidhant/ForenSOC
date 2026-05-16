"""
SQLAlchemy base class for all database models.
"""

from sqlalchemy.orm import declarative_base
from datetime import datetime
from sqlalchemy import Column, DateTime, func

Base = declarative_base()


class BaseModel(Base):
    """Base model with common fields (created_at, updated_at)."""

    __abstract__ = True

    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )
