import asyncio
from sqlalchemy import text
from database.connection import engine


async def run_migration():
    async with engine.begin() as conn:
        await conn.execute(text("ALTER TABLE vendors ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE"))
        await conn.execute(text("ALTER TABLE vendors ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE"))
        await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE"))
        await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE"))
        await conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id INTEGER"))
    print("✅ Migration completed: moderation/featured columns added.")


if __name__ == "__main__":
    asyncio.run(run_migration())
