import asyncio
from sqlalchemy import text
from database.connection import engine


async def reset():
    async with engine.begin() as conn:
        await conn.execute(text("DROP TABLE IF EXISTS quotations CASCADE"))
        await conn.execute(text("DROP TABLE IF EXISTS products CASCADE"))
        await conn.execute(text("DROP TABLE IF EXISTS vendors CASCADE"))
    print("🗑️ Dropped vendors, products, quotations tables.")


if __name__ == "__main__":
    asyncio.run(reset())