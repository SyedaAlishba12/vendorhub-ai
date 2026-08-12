import os
import ssl
import logging

from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncSession,
    async_sessionmaker,
)
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in the environment variables.")

if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgresql://",
        "postgresql+asyncpg://",
        1,
    )

# Remove sslmode because asyncpg uses connect_args for SSL.
if "sslmode=" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.split("?sslmode=")[0]
    DATABASE_URL = DATABASE_URL.split("&sslmode=")[0]

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("DatabaseLogger")

# SSL configuration for PostgreSQL/Neon
ssl_context = ssl.create_default_context()

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    connect_args={
        "ssl": ssl_context,
    },
)

db_host = engine.url.host
db_name = engine.url.database

logger.info(
    f"✅ Successfully Connected to PostgreSQL Host: "
    f"[{db_host}] | Database: [{db_name}]"
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session