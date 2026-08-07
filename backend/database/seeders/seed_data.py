import logging
import asyncio
from database.connection import AsyncSessionLocal
from database.seeders.seed_orders import seed_orders
from database.seeders.seed_documents import seed_documents
from database.seeders.seed_reviews import seed_reviews  
from database.seeders.seed_admin_reports import seed_admin_reports 
# =====================================================================
# TEAM SEEDER IMPORTS
# Import individual seeder functions here after creating your module files.
# Example:
# from database.seeders.seed_vendors import seed_vendors
# from database.seeders.seed_orders import seed_orders
# =====================================================================

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Seeder")

async def run_seeders():
    async with AsyncSessionLocal() as db:
        try:
            logger.info("🌱 Starting Database Seeding Process (Async)...")

            # =================================================================
            # TEAM SEEDER EXECUTION
            # Call your module seeder functions sequentially below.
            # Ensure correct relational order (e.g., Users -> Vendors -> Orders).
            # Example:
            # await seed_users()
            # await seed_vendors()
            # =================================================================

            await seed_orders()
            await seed_documents()
            await seed_reviews() 
            await seed_admin_reports()  

            await db.commit()
            logger.info("🎉 Database Seeding Completed Successfully!")
        except Exception as e:
            await db.rollback()
            logger.error(f"❌ Error during seeding: {e}")

if __name__ == "__main__":
    asyncio.run(run_seeders())