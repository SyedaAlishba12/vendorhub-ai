
import logging
import asyncio

from database.connection import AsyncSessionLocal
from database.seeders.seed_buyer_dashboard import seed_buyer_dashboard
from database.seeders.seed_reviews import seed_reviews

# Temporarily disabled until other modules are fixed
# from database.seeders.seed_orders import seed_orders
# from database.seeders.seed_documents import seed_documents
# from database.seeders.seed_admin_reports import seed_admin_reports


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Seeder")


async def run_seeders():
    async with AsyncSessionLocal() as db:
        try:
            logger.info("🌱 Starting Database Seeding Process (Async)...")

            # Buyer Dashboard
            await seed_buyer_dashboard()
            logger.info("✅ Buyer dashboard seeded")

            # Reviews & Ratings
            await seed_reviews()
            logger.info("✅ Reviews & Ratings seeded")

            # Other seeders will be added later
            # await seed_orders()
            # await seed_documents()
            # await seed_admin_reports()

            await db.commit()

            logger.info("🎉 Database Seeding Completed Successfully!")

        except Exception as e:
            await db.rollback()
            logger.error(f"❌ Error during seeding: {e}")
            raise


if __name__ == "__main__":
    asyncio.run(run_seeders())

