import asyncio
import logging

from database.seeders.seed_buyer_dashboard import seed_buyer_dashboard
from database.seeders.seed_reviews import seed_reviews


logging.basicConfig(level=logging.INFO)

logger = logging.getLogger("Seeder")


async def run_seeders():

    try:
        logger.info(
            "🌱 Starting Database Seeding Process (Async)..."
        )

        # Buyer Dashboard
        await seed_buyer_dashboard()

        logger.info(
            "✅ Buyer dashboard seeded"
        )

        # Reviews
        await seed_reviews()

        logger.info(
            "✅ Reviews & Ratings seeded"
        )

        logger.info(
            "🎉 Database Seeding Completed Successfully!"
        )

    except Exception as e:

        logger.error(
            f"❌ Error during seeding: {e}"
        )

        raise


if __name__ == "__main__":
    asyncio.run(run_seeders())