import asyncio
import logging
from database.connection import AsyncSessionLocal, engine
from models.base import Base
from database.seeders.seed_vendors import seed_vendors
from database.seeders.seed_products import seed_products

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Seeder")


async def run_seeders():
    # Create tables if they don't exist yet
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        try:
            logger.info("🌱 Starting Database Seeding Process...")

            await seed_vendors(db)
            await seed_products(db)

            logger.info("🎉 Database Seeding Completed Successfully!")
        except Exception as e:
            await db.rollback()
            logger.error(f"❌ Error during seeding: {e}")


if __name__ == "__main__":
    asyncio.run(run_seeders())
