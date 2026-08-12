import asyncio

from database.connection import engine
from database.base import Base

# Import models so SQLAlchemy registers their tables

from models.user import User
from models.Buyer import Buyer, Dashboard
from models.vendors import Vendor
from models.quote import Quote
from models.RFQ import RFQ, RFQAttachment
from models.SavedVendor import SavedVendor
from models.RecentSearch import RecentSearch
from models.PricingPlan import PricingPlan
from models.PaymentLog import PaymentLog


async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    print("✅ All database tables created successfully.")


if __name__ == "__main__":
    asyncio.run(create_tables())