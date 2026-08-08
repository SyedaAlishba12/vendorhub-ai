import sys
import os
import asyncio
from sqlalchemy import select, text

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from database.connection import AsyncSessionLocal, engine, Base
from models.Order import Order
from models.OrderItem import OrderItem
from models.Shipment import Shipment

async def seed_orders():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Safe Patch: Missing columns add karein taake SELECT query crash na ho
        await db.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS has_dispute BOOLEAN DEFAULT FALSE;"))
        await db.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancellation_reason VARCHAR;"))
        await db.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS dispute_reason VARCHAR;"))
        await db.commit()

        result = await db.execute(select(Order))
        existing_orders = result.scalars().first()

        if existing_orders:
            print("Orders already seeded. Skipping...")
            return

        order1 = Order(
            id="ORD-101", 
            buyer_id="BUY-001", 
            vendor_id="VEN-002", 
            total_amount=450.00, 
            status="PROCESSING", 
            payment_status="PAID"
        )
        item1 = OrderItem(
            id="ITM-1", 
            order_id="ORD-101", 
            product_name="Industrial Sensors - Type A", 
            quantity=10, 
            unit_price=45.00
        )
        shipment1 = Shipment(
            id="SHP-1", 
            order_id="ORD-101", 
            courier="DHL Express", 
            tracking_number="DHL-8890213", 
            status="In Transit", 
            estimated_delivery="2026-08-12"
        )

        db.add_all([order1, item1, shipment1])
        await db.commit()
        print("✅ Orders Module Data Seeded Successfully (Async)!")

if __name__ == "__main__":
    asyncio.run(seed_orders())