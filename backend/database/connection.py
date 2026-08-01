import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Set up logger for DB connection logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("DatabaseLogger")

try:
    engine = create_engine(DATABASE_URL, echo=False)
    db_host = engine.url.host
    db_name = engine.url.database
    logger.info(f"✅ Successfully Connected to PostgreSQL Host: [{db_host}] | Database: [{db_name}]")
except Exception as e:
    logger.error(f"❌ Database connection failed: {e}")
    raise e

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)