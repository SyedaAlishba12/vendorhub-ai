import asyncio
from database.connection import AsyncSessionLocal
from models.Buyer import Buyer
from sqlalchemy import select

async def check():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Buyer))
        buyers = result.scalars().all()
        print("Buyers:", buyers)
        if not buyers:
            print("❌ No buyers found in database")
        else:
            print(f"✅ Found {len(buyers)} buyer(s)")

asyncio.run(check())