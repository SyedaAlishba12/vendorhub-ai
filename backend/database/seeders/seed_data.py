import asyncio
import logging

from database.connection import AsyncSessionLocal, engine
from database.base import Base

# Ensure models are registered with SQLAlchemy
from models.user import User  # noqa: F401
from models.Buyer import Buyer  # noqa: F401
from models.vendors import Vendor  # noqa: F401
from models.product import Product  # noqa: F401
from models.quote import Quote  # noqa: F401
from models.category import ProductCategory, CertificationType  # noqa: F401

# Seeders
from database.seeders.seed_vendors import seed_vendors
from database.seeders.seed_products import seed_products
from database.seeders.seed_quotes import seed_quotes
from database.seeders.seed_categories import seed_categories

from database.seeders.seed_orders import seed_orders
from database.seeders.seed_documents import seed_documents
from database.seeders.seed_reviews import seed_reviews
from database.seeders.seed_admin_reports import seed_admin_reports
from database.seeders.seed_buyer_dashboard import seed_buyer_dashboard


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
            await seed_categories(db)
            await seed_vendors(db)
            await seed_products(db)
            await seed_quotes(db)

            # Existing project seeders
            await seed_orders()
            await seed_documents()
            await seed_reviews()
            await seed_admin_reports()

            # Buyer Dashboard
            await seed_buyer_dashboard()

            await db.commit()

            logger.info("🎉 Database Seeding Completed Successfully!")

        except Exception as e:
            await db.rollback()
            logger.error(f"❌ Error during seeding: {e}")
            raise


if __name__ == "__main__":
    asyncio.run(run_seeders())