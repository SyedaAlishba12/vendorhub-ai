import asyncio
from sqlalchemy import text
from database.connection import engine


async def reset_database():
    async with engine.begin() as conn:
        print("🗑️ Dropping database schema...")
        await conn.execute(text("DROP SCHEMA public CASCADE"))

        print("🔄 Creating fresh schema...")
        await conn.execute(text("CREATE SCHEMA public"))

    print("✅ Database reset successfully!")


asyncio.run(reset_database())