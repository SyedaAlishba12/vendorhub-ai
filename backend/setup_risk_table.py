"""
setup_risk_table.py — Creates the risk_reports table on Neon.
Run from the project root: python backend/setup_risk_table.py
"""

import asyncio, os, sys
from urllib.parse import urlparse

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from dotenv import load_dotenv
load_dotenv("backend/.env")

_RAW = os.getenv("DATABASE_URL", "")
_NEEDS_SSL = "sslmode=require" in _RAW
DATABASE_URL = _RAW.split("?")[0]
_CONNECT_ARGS = {"ssl": "require"} if _NEEDS_SSL else {}

# Import ALL models so Base.metadata contains every table
from database.base import Base                # noqa
import backend.models.Conversation                    # noqa
import backend.models.Message                         # noqa
import backend.models.RiskReport                      # noqa  <- new

from sqlalchemy.ext.asyncio import create_async_engine
import asyncpg

def _parse(url):
    c = url.replace("postgresql+asyncpg://", "postgresql://").split("?")[0]
    p = urlparse(c)
    return dict(user=p.username, password=p.password, host=p.hostname, port=p.port or 5432, database=p.path.lstrip("/"))

async def main():
    print("\n== Creating risk_reports table ==")
    engine = create_async_engine(DATABASE_URL, echo=True, connect_args=_CONNECT_ARGS)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await engine.dispose()
    print("\n== Verifying ==")
    params = _parse(DATABASE_URL)
    if _NEEDS_SSL:
        params["ssl"] = "require"
    conn = await asyncpg.connect(**params)
    try:
        tables = await conn.fetch("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name")
        for t in tables:
            print("  [OK]", t["table_name"])
        cols = await conn.fetch("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='risk_reports' AND table_schema='public' ORDER BY ordinal_position")
        print("\n  Columns of risk_reports:")
        for c in cols:
            print(f"    {c['column_name']:30s} {c['data_type']}")
    finally:
        await conn.close()
    print("\nDone.\n")

if __name__ == "__main__":
    asyncio.run(main())
