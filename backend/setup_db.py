"""
setup_db.py -- One-shot script:
  1. Creates the database if it does not exist (skipped for hosted DBs like Neon
     where the database already exists and CREATE DATABASE is not permitted).
  2. Runs Base.metadata.create_all() to create tables.
  3. Verifies and prints the resulting schema.

Run from the project root:
    python backend/setup_db.py
"""

import asyncio
import os
import sys
from urllib.parse import urlparse

# Make 'backend' importable from the project root
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv

load_dotenv("backend/.env")

_RAW_URL: str = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5432/vendorhub",
)

# asyncpg/SQLAlchemy do not accept ?sslmode= as a query param -- strip it and
# pass ssl='require' via connect_args instead.
_NEEDS_SSL: bool = "sslmode=require" in _RAW_URL
DATABASE_URL: str = _RAW_URL.split("?")[0]

_CONNECT_ARGS: dict = {"ssl": "require"} if _NEEDS_SSL else {}

# Hosted DB providers already have the database -- skip CREATE DATABASE.
IS_HOSTED: bool = any(
    h in _RAW_URL for h in ["neon.tech", "supabase.co", "railway.app", "render.com"]
)

# ---------------------------------------------------------------------------
# Parse connection params (for raw asyncpg calls in steps 1 and 3)
# ---------------------------------------------------------------------------

def _parse_url(url: str) -> dict:
    clean = url.replace("postgresql+asyncpg://", "postgresql://").split("?")[0]
    parsed = urlparse(clean)
    return {
        "user":     parsed.username or "postgres",
        "password": parsed.password or "",
        "host":     parsed.hostname or "localhost",
        "port":     parsed.port or 5432,
        "database": parsed.path.lstrip("/"),
    }

import asyncpg  # noqa: E402

# ---------------------------------------------------------------------------
# Step 1: Create database (local only)
# ---------------------------------------------------------------------------

async def create_database_if_missing():
    params = _parse_url(DATABASE_URL)
    db_name = params["database"]

    print("")
    print("=" * 60)
    print("STEP 1: Database check")
    print("=" * 60)

    if IS_HOSTED:
        print("  Hosted database detected -- skipping CREATE DATABASE.")
        print("  Database '" + db_name + "' assumed to exist on the remote host.")
        return

    print("  Checking if '" + db_name + "' exists...")
    conn = await asyncpg.connect(
        user=params["user"], password=params["password"],
        host=params["host"], port=params["port"],
        database="postgres",
    )
    try:
        exists = await conn.fetchval(
            "SELECT 1 FROM pg_database WHERE datname = $1", db_name
        )
        if exists:
            print("  Database '" + db_name + "' already exists.")
        else:
            print("  Creating database '" + db_name + "'...")
            await conn.execute('CREATE DATABASE "' + db_name + '"')
            print("  Database '" + db_name + "' created.")
    finally:
        await conn.close()

# ---------------------------------------------------------------------------
# Step 2: Create tables via SQLAlchemy create_all()
# ---------------------------------------------------------------------------

from sqlalchemy.ext.asyncio import create_async_engine  # noqa: E402

# Import models so they register on Base.metadata BEFORE create_all runs
from database.base import Base              # noqa: E402, F401
import backend.models.Conversation                  # noqa: E402, F401
import backend.models.Message                       # noqa: E402, F401

async def create_tables():
    print("")
    print("=" * 60)
    print("STEP 2: Creating tables  [SQLAlchemy create_all()]")
    print("=" * 60)

    engine = create_async_engine(DATABASE_URL, echo=True, connect_args=_CONNECT_ARGS)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    await engine.dispose()
    print("")
    print("STEP 2 COMPLETE -- tables created (or already existed).")

# ---------------------------------------------------------------------------
# Step 3: Verify schema
# ---------------------------------------------------------------------------

async def verify_tables():
    params = _parse_url(DATABASE_URL)
    db_name = params["database"]

    print("")
    print("=" * 60)
    print("STEP 3: Verifying schema in '" + db_name + "'")
    print("=" * 60)

    connect_kwargs: dict = dict(
        user=params["user"], password=params["password"],
        host=params["host"], port=params["port"],
        database=params["database"],
    )
    if _NEEDS_SSL:
        connect_kwargs["ssl"] = "require"

    conn = await asyncpg.connect(**connect_kwargs)
    try:
        tables = await conn.fetch(
            """
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
            """
        )
        print("")
        print("  Tables in public schema:")
        for t in tables:
            print("    [OK] " + t["table_name"])

        for tbl in ["conversations", "messages"]:
            cols = await conn.fetch(
                """
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name = $1 AND table_schema = 'public'
                ORDER BY ordinal_position
                """,
                tbl,
            )
            print("")
            print("  Columns of '" + tbl + "':")
            for c in cols:
                nullable = "NULL    " if c["is_nullable"] == "YES" else "NOT NULL"
                default  = " DEFAULT " + str(c["column_default"]) if c["column_default"] else ""
                print(
                    "    " + c["column_name"].ljust(22)
                    + c["data_type"].ljust(32)
                    + nullable + default
                )

        enum_vals = await conn.fetch(
            """
            SELECT e.enumlabel
            FROM pg_enum e
            JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'messagetype'
            ORDER BY e.enumsortorder
            """
        )
        print("")
        print("  Enum 'messagetype' values:")
        for v in enum_vals:
            print("    - " + v["enumlabel"])

    finally:
        await conn.close()

    print("")
    print("=" * 60)
    print("SETUP COMPLETE -- Neon database is ready.")
    print("=" * 60)
    print("")

# ---------------------------------------------------------------------------

async def main():
    await create_database_if_missing()
    await create_tables()
    await verify_tables()

if __name__ == "__main__":
    asyncio.run(main())
