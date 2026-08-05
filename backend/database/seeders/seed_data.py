import logging
from database.connection import SessionLocal, engine
from models.base import Base
from database.seeders.seed_vendors import seed_vendors
from database.seeders.seed_products import seed_products

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Seeder")


def run_seeders():
    # Create tables if they don't exist yet
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        logger.info("🌱 Starting Database Seeding Process...")

        seed_vendors(db)
        seed_products(db)

        logger.info("🎉 Database Seeding Completed Successfully!")
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error during seeding: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    run_seeders()