import os
import logging

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database.base import Base

from models.User import User
from models.Vendor import Vendor


# Load .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("DatabaseLogger")


try:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        echo=False,
    )

    db_host = engine.url.host
    db_name = engine.url.database

    logger.info(
        f"✅ Successfully Connected to PostgreSQL "
        f"Host: [{db_host}] | Database: [{db_name}]"
    )

except Exception as e:
    logger.error(f"❌ Database connection failed: {e}")
    raise e


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# Create tables
Base.metadata.create_all(bind=engine)