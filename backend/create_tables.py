import asyncio
from database.connection import engine, Base
import models  # runs models/__init__.py → all models registered

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Tables are ready.")

asyncio.run(create_tables())