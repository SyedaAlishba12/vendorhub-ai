import asyncio
from sqlalchemy import text
from database.connection import engine


async def fix():
    async with engine.begin() as conn:
        await conn.execute(text("DROP TABLE IF EXISTS users CASCADE"))
    print("✅ Dropped users table — will be recreated with correct schema.")


if __name__ == "__main__":
    asyncio.run(fix())