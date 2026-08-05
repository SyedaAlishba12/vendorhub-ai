import os
import ssl
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

# SSL context required for Neon + pg8000
ssl_context = ssl.create_default_context()

try:
    engine = create_engine(
        DATABASE_URL,
        echo=False,
        connect_args={"ssl_context": ssl_context},
    )
    db_host = engine.url.host
    db_name = engine.url.database
    logger.info(f"✅ Successfully Connected to PostgreSQL Host: [{db_host}] | Database: [{db_name}]")
except Exception as e:
    logger.error(f"❌ Database connection failed: {e}")
    raise e

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)