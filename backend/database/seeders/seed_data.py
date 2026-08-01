import logging
from database.connection import SessionLocal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Seeder")

def run_seeders():
    db = SessionLocal()
    try:
        logger.info("🌱 Starting Database Seeding Process...")

        
        db.commit()
        logger.info("🎉 Database Seeding Completed Successfully!")
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error during seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    run_seeders()