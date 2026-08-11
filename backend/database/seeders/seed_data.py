import asyncio
import logging

from database.connection import AsyncSessionLocal, engine
from models.base import Base
from models.user import User  # noqa: F401 - ensures users table is registered with Base

# Existing seeders
from database.seeders.seed_orders import seed_orders
from database.seeders.seed_documents import seed_documents
from database.seeders.seed_reviews import seed_reviews
from database.seeders.seed_admin_reports import seed_admin_reports

# Vendor/Product branch seeders
from database.seeders.seed_vendors import seed_vendors
from database.seeders.seed_products import seed_products
from database.seeders.seed_quotes import seed_quotes
from database.seeders.seed_categories import seed_categories


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Seeder")


async def run_seeders():
    # Create tables first
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        try:
            logger.info("🌱 Starting Database Seeding Process...")

            # Vendor/Product branch seeders
            await seed_vendors(db)
            await seed_products(db)
            await seed_quotes(db)
            await seed_categories(db)

            # Existing project seeders
            await seed_orders()
            await seed_documents()
            await seed_reviews()
            await seed_admin_reports()

            await db.commit()

            logger.info("🎉 Database Seeding Completed Successfully!")

        except Exception as e:
            await db.rollback()
            logger.error(f"❌ Error during seeding: {e}")
            raise


if __name__ == "__main__":
    asyncio.run(run_seeders())