import os
import ssl
import logging
<<<<<<< HEAD

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
=======
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from dotenv import load_dotenv
>>>>>>> origin/feature/vendor-product-modules

from database.base import Base

from models.User import User
from models.Vendor import Vendor


# Load .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("DatabaseLogger")

<<<<<<< HEAD

try:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        echo=False,
    )

=======
# SSL context required for Neon + asyncpg
ssl_context = ssl.create_default_context()

try:
    engine = create_async_engine(
        DATABASE_URL,
        echo=False,
        connect_args={"ssl": ssl_context},
    )
>>>>>>> origin/feature/vendor-product-modules
    db_host = engine.url.host
    db_name = engine.url.database

    logger.info(
        f"✅ Successfully Connected to PostgreSQL "
        f"Host: [{db_host}] | Database: [{db_name}]"
    )

except Exception as e:
    logger.error(f"❌ Database connection failed: {e}")
    raise e

<<<<<<< HEAD

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# Create tables
Base.metadata.create_all(bind=engine)
=======
AsyncSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
>>>>>>> origin/feature/vendor-product-modules
