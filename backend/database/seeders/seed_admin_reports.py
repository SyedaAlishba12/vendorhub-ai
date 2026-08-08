import logging
from sqlalchemy import text
from sqlalchemy.future import select
from database.connection import AsyncSessionLocal
from models.ReviewReport import ReviewReportDB
from models.Review import ReviewDB
from models.Order import Order

logger = logging.getLogger("Seeder")

async def seed_admin_reports():
    async with AsyncSessionLocal() as db:
        try:
            logger.info("🌱 Seeding Admin Review Reports & Disputes...")

            # 0. Ensure schema columns exist safely
            await db.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS has_dispute BOOLEAN DEFAULT FALSE;"))
            await db.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancellation_reason VARCHAR;"))
            await db.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS dispute_reason VARCHAR;"))
            await db.commit()

            # 1. Seed Review Reports
            stmt = select(ReviewDB)
            res = await db.execute(stmt)
            reviews = res.scalars().all()

            if reviews:
                review_1_id = reviews[0].id
                review_2_id = reviews[1].id if len(reviews) > 1 else reviews[0].id

                reports = [
                    ReviewReportDB(
                        id="REP-101",
                        review_id=review_1_id,
                        reported_by="buyer_user_99",
                        reason="Contains inappropriate language and misleading information.",
                        status="PENDING"
                    ),
                    ReviewReportDB(
                        id="REP-102",
                        review_id=review_2_id,
                        reported_by="vendor_user_42",
                        reason="Competitor spam review attempt.",
                        status="PENDING"
                    ),
                    ReviewReportDB(
                        id="REP-100",
                        review_id=review_1_id,
                        reported_by="system_auto_flag",
                        reason="Auto-flagged due to negative sentiment score.",
                        status="RESOLVED_APPROVED"
                    )
                ]

                for rep in reports:
                    existing = await db.execute(select(ReviewReportDB).where(ReviewReportDB.id == rep.id))
                    if not existing.scalar_one_or_none():
                        db.add(rep)

            # 2. Sync Disputed Order Statuses cleanly
            stmt_orders = select(Order)
            res_orders = await db.execute(stmt_orders)
            orders = res_orders.scalars().all()

            if orders:
                for order in orders:
                    # Sync dispute flag only for CANCELLED orders
                    if order.status == "CANCELLED":
                        order.has_dispute = True
                        if not order.cancellation_reason:
                            order.cancellation_reason = "Order Cancellation Requested"
                    else:
                        order.has_dispute = False

            await db.commit()
            logger.info("✅ Admin Reports & Disputes Seeded Successfully!")
        except Exception as e:
            await db.rollback()
            logger.error(f"❌ Error seeding admin reports: {e}")