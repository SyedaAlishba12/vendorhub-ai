import os
import ssl
import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

if DATABASE_URL and "sslmode=" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.split("?sslmode=")[0].split("&sslmode=")[0]

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("DatabaseLogger")

ssl_context = ssl.create_default_context()

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    connect_args={"ssl": ssl_context},
)

db_host = engine.url.host
db_name = engine.url.database
logger.info(f"✅ Successfully Connected to PostgreSQL Host: [{db_host}] | Database: [{db_name}]")

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session