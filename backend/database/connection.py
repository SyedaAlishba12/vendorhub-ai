import os
import ssl
import logging

from dotenv import load_dotenv

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncSession,
    async_sessionmaker,
)

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("DatabaseLogger")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set in the environment.")

# --------------------------------------------------
# Async database setup
# --------------------------------------------------

# psycopg2 -> psycopg2://...
# asyncpg  -> postgresql+asyncpg://...

ASYNC_DATABASE_URL = DATABASE_URL.replace(
    "postgresql://",
    "postgresql+asyncpg://",
).replace(
    "postgres://",
    "postgresql+asyncpg://",
)

ssl_context = ssl.create_default_context()

engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=False,
    connect_args={"ssl": ssl_context},
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# --------------------------------------------------
# Sync database setup
# --------------------------------------------------

SYNC_DATABASE_URL = DATABASE_URL.replace(
    "postgresql+asyncpg://",
    "postgresql+psycopg2://",
).replace(
    "postgresql://",
    "postgresql+psycopg2://",
).replace(
    "postgres://",
    "postgresql+psycopg2://",
)

sync_engine = create_engine(
    SYNC_DATABASE_URL,
    echo=False,
    connect_args={"sslmode": "require"},
)

SessionLocal = sessionmaker(
    bind=sync_engine,
    autocommit=False,
    autoflush=False,
)

logger.info("✅ Database configuration loaded successfully.")