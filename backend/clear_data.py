import asyncio
from sqlalchemy import delete
from database.connection import AsyncSessionLocal, engine
from models.base import Base
from models.vendors import Vendor
from models.product import Product
from models.quote import Quote


async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        try:
            result_quotes = await db.execute(delete(Quote))
            await db.commit()
            print(f"🗑️ Deleted {result_quotes.rowcount} quotes.")
        except Exception as e:
            await db.rollback()
            print(f"❌ Error: {e}")


if __name__ == "__main__":
    asyncio.run(main())