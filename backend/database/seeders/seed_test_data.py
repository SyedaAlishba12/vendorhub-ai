import asyncio
import bcrypt
from datetime import datetime, timedelta
from database.connection import AsyncSessionLocal
from models.User import User, UserRole
from models.Buyer import Buyer, Dashboard
from models.Vendor import Vendor
from models.RFQ import RFQ, RFQStatus
from models.Order import Order
from models.OrderItem import OrderItem
from models.Shipment import Shipment
from models.SavedVendor import SavedVendor
from models.RecentSearch import RecentSearch

async def seed_all():
    async with AsyncSessionLocal() as db:
        # Check if already seeded
        existing_user = await db.get(User, 1)
        if existing_user:
            print("⚠️  Data already exists, skipping.")
            return

        password_hash = bcrypt.hashpw(b"password123", bcrypt.gensalt()).decode()

        # ---------- Buyer ----------
        buyer_user = User(
            id=1,
            email="buyer@demo.com",
            username="demobuyer",
            password_hash=password_hash,
            full_name="Demo Buyer",
            role=UserRole.BUYER,
            is_verified=True,
            is_active=True
        )
        db.add(buyer_user)
        await db.flush()

        buyer = Buyer(
            user_id=buyer_user.id,
            company_name="Demo Company",
            company_size="medium",
            industry="Electronics",
            country="Pakistan"
        )
        db.add(buyer)
        await db.flush()

        dashboard = Dashboard(buyer_id=buyer.id)
        db.add(dashboard)

        # ---------- Vendor ----------
        vendor_user = User(
            id=2,
            email="vendor@demo.com",
            username="demovendor",
            password_hash=password_hash,
            full_name="Demo Vendor",
            role=UserRole.VENDOR,
            is_verified=True,
            is_active=True
        )
        db.add(vendor_user)
        await db.flush()

        vendor = Vendor(
            user_id=vendor_user.id,
            company_name="Vendor Supply Co.",
            country="Turkey",
            is_verified=True
        )
        db.add(vendor)
        await db.flush()

        # ---------- RFQs ----------
        rfqs = [
            RFQ(
                buyer_id=buyer.id,
                rfq_ref="RFQ-1000",
                product_name="Test Product 1",
                category="Electronics",
                quantity=100,
                unit="pcs",
                delivery_date=datetime.utcnow() + timedelta(days=30),
                payment_terms="Net 30",
                shipping_method="Sea Freight",
                status=RFQStatus.QUOTED,
            ),
            RFQ(
                buyer_id=buyer.id,
                rfq_ref="RFQ-1001",
                product_name="Test Product 2",
                category="Electronics",
                quantity=200,
                unit="pcs",
                delivery_date=datetime.utcnow() + timedelta(days=20),
                payment_terms="L/C",
                shipping_method="Air Freight",
                status=RFQStatus.QUOTED,
            ),
            RFQ(
                buyer_id=buyer.id,
                rfq_ref="RFQ-1002",
                product_name="Test Product 3",
                category="Electronics",
                quantity=50,
                unit="pcs",
                delivery_date=datetime.utcnow() + timedelta(days=15),
                payment_terms="T/T 50/50",
                shipping_method="Express",
                status=RFQStatus.DRAFT,
            ),
        ]
        db.add_all(rfqs)
        await db.flush()

        # ---------- Order ----------
        order = Order(
            id="ORD-2024-001",
            buyer_id=str(buyer_user.id),
            vendor_id=str(vendor_user.id),
            total_amount=15000.00,
            status="PROCESSING",
            payment_status="PAID"
        )
        db.add(order)
        await db.flush()

        db.add(OrderItem(order_id=order.id, product_name="Test Product 1", quantity=100, price=150.00))
        db.add(Shipment(order_id=order.id, carrier="DHL", tracking_number="DHL123456789"))

        # ---------- Saved Vendor ----------
        db.add(SavedVendor(buyer_id=buyer.id, vendor_id=vendor.id))

        # ---------- Recent Searches ----------
        db.add_all([
            RecentSearch(buyer_id=buyer.id, query="ISO certified steel pipes"),
            RecentSearch(buyer_id=buyer.id, query="10k cotton t-shirts"),
            RecentSearch(buyer_id=buyer.id, query="Solar inverters 500kW"),
        ])

        await db.commit()
        print("✅ Test data seeded successfully.")
        print("   Buyer: buyer@demo.com / password123")
        print("   Vendor: vendor@demo.com / password123")
        print("   RFQs, Orders, Saved Vendor, Recent Searches created.")

if __name__ == "__main__":
    asyncio.run(seed_all())