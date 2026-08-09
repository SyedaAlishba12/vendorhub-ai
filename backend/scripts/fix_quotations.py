import asyncio
from sqlalchemy import text
from database.connection import engine


async def fix():
    async with engine.begin() as conn:
        await conn.execute(text("DROP TABLE IF EXISTS quotations CASCADE"))
    print("✅ Dropped quotations table — will be recreated with correct schema on next seed.")


if __name__ == "__main__":
    asyncio.run(fix())