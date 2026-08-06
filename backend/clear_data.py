import asyncio
from sqlalchemy import delete
from database.connection import AsyncSessionLocal, engine
from models.base import Base
from models.vendors import Vendor
from models.product import Product


async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        try:
            result_products = await db.execute(delete(Product))
            result_vendors = await db.execute(delete(Vendor))
            await db.commit()
            print(f"🗑️ Deleted {result_products.rowcount} products and {result_vendors.rowcount} vendors.")
        except Exception as e:
            await db.rollback()
            print(f"❌ Error: {e}")


if __name__ == "__main__":
    asyncio.run(main())
