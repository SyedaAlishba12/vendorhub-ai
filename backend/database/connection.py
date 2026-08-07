import os
import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Switch postgresql:// to postgresql+asyncpg:// if needed
if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# Clean existing sslmode from query string to let connect_args handle it cleanly
if DATABASE_URL and "sslmode=" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.split("?sslmode=")[0].split("&sslmode=")[0]

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("DatabaseLogger")

# Neon requires SSL for asyncpg. Adding ssl=True directly to connect_args
engine = create_async_engine(
    DATABASE_URL, 
    echo=False,
    connect_args={"ssl": True}
)

# Async Session Factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session