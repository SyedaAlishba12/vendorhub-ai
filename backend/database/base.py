"""
database/base.py — Shared SQLAlchemy declarative base.

Every ORM model in this project must inherit from Base so that
`Base.metadata.create_all()` and Alembic migrations see them all.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """
    Project-wide declarative base for SQLAlchemy 2.0 ORM models.

    Usage:
        from backend.database.base import Base

        class MyModel(Base):
            __tablename__ = "my_table"
            ...
    """
    pass
