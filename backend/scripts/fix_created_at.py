import asyncio
from sqlalchemy import text
from database.connection import engine


async def fix():
    async with engine.begin() as conn:
        await conn.execute(text("UPDATE vendors SET created_at = NOW() WHERE created_at IS NULL"))
        await conn.execute(text("ALTER TABLE vendors ALTER COLUMN created_at SET DEFAULT NOW()"))
    print("✅ Filled missing created_at values and set default for future rows.")


if __name__ == "__main__":
    asyncio.run(fix())