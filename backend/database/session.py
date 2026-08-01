"""
database/session.py — Async SQLAlchemy 2.0 engine, session factory, and
                      FastAPI dependency for injecting a database session.

Connection string is read from the DATABASE_URL environment variable.
Override via a .env file at the project root (see .env.example).

Default (local dev): postgresql+asyncpg://postgres:postgres@localhost:5432/vendorhub
"""

import os
from collections.abc import AsyncGenerator

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

load_dotenv()

# ---------------------------------------------------------------------------
# Engine
# ---------------------------------------------------------------------------

_RAW_URL: str = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5432/vendorhub",
)

# asyncpg does not accept ?sslmode=require as a query parameter — it raises
# TypeError: connect() got an unexpected keyword argument 'sslmode'.
# Strip the query string from the URL and pass ssl='require' via connect_args
# when connecting to a hosted provider (Neon, Supabase, Railway, etc.).
_needs_ssl: bool = "sslmode=require" in _RAW_URL
DATABASE_URL: str = _RAW_URL.split("?")[0]  # strip ?sslmode=… and any other params

_connect_args: dict = {"ssl": "require"} if _needs_ssl else {}

engine = create_async_engine(
    DATABASE_URL,
    # Set SQL_ECHO=true in .env to log every statement — useful for debugging.
    echo=os.getenv("SQL_ECHO", "false").lower() == "true",
    # Validates that connections are still alive before using them from the pool.
    pool_pre_ping=True,
    # Pass SSL context for hosted providers; empty dict for local Postgres.
    connect_args=_connect_args,
)

# ---------------------------------------------------------------------------
# Session factory
# ---------------------------------------------------------------------------

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    # Don't expire ORM objects after commit so we can still access their
    # attributes in route handlers after the transaction closes.
    expire_on_commit=False,
)

# ---------------------------------------------------------------------------
# FastAPI dependency
# ---------------------------------------------------------------------------


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Yield an AsyncSession for use as a FastAPI dependency.

    Commits on clean exit; rolls back automatically on exception.

    Usage in a route:
        db: AsyncSession = Depends(get_db)
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
