
import logging
from sqlalchemy.future import select
from models.Review import ReviewDB
from models.Rating import RatingDB
from models.ReviewReport import ReviewReportDB

logger = logging.getLogger("Seeder")


async def seed_reviews():
    from database.connection import AsyncSessionLocal

    async with AsyncSessionLocal() as db:
        try:
            logger.info("🌱 Seeding Reviews, Ratings & Reports...")

            # Check if reviews already exist
            result = await db.execute(select(ReviewDB))
            existing_reviews = result.scalars().all()

            if existing_reviews:
                logger.info("ℹ️ Reviews already seeded. Skipping...")
                return

            reviews_data = [
                {
                    "id": "REV-001",
                    "vendor_id": "VEN-002",
                    "buyer_id": "BUY-001",
                    "buyer_name": "Zainab Bibi",
                    "product_id": "PROD-001",
                    "comment": "Outstanding raw material quality and rapid response rate. Delivery arrived 2 days earlier than scheduled!",
                    "ratings": {
                        "id": "RAT-001",
                        "overall_rating": 4.9,
                        "product_rating": 5.0,
                        "communication_rating": 4.8,
                        "delivery_rating": 5.0,
                        "quality_rating": 5.0,
                        "service_rating": 4.8
                    }
                },
                {
                    "id": "REV-002",
                    "vendor_id": "VEN-002",
                    "buyer_id": "BUY-002",
                    "buyer_name": "Syeda",
                    "product_id": "PROD-002",
                    "comment": "Good material quality overall, but communication during dispatch tracking could be slightly improved.",
                    "ratings": {
                        "id": "RAT-002",
                        "overall_rating": 4.0,
                        "product_rating": 4.0,
                        "communication_rating": 3.5,
                        "delivery_rating": 4.5,
                        "quality_rating": 4.0,
                        "service_rating": 4.0
                    }
                },
                {
                    "id": "REV-003",
                    "vendor_id": "VEN-001",
                    "buyer_id": "BUY-001",
                    "buyer_name": "Fatima",
                    "product_id": "PROD-003",
                    "comment": "Excellent customer support and transparent invoicing. Will definitely reorder for next month's batch.",
                    "ratings": {
                        "id": "RAT-003",
                        "overall_rating": 4.7,
                        "product_rating": 4.5,
                        "communication_rating": 5.0,
                        "delivery_rating": 4.5,
                        "quality_rating": 4.8,
                        "service_rating": 4.8
                    }
                }
            ]

            # -----------------------------------
            # Create Reviews & Ratings
            # -----------------------------------

            for item in reviews_data:
                r_info = item["ratings"]

                review = ReviewDB(
                    id=item["id"],
                    vendor_id=item["vendor_id"],
                    buyer_id=item["buyer_id"],
                    buyer_name=item["buyer_name"],
                    product_id=item["product_id"],
                    comment=item["comment"]
                )

                rating = RatingDB(
                    id=r_info["id"],
                    review_id=item["id"],
                    overall_rating=r_info["overall_rating"],
                    product_rating=r_info["product_rating"],
                    communication_rating=r_info["communication_rating"],
                    delivery_rating=r_info["delivery_rating"],
                    quality_rating=r_info["quality_rating"],
                    service_rating=r_info["service_rating"]
                )

                db.add(review)
                db.add(rating)

            await db.flush()

            # -----------------------------------
            # Create Review Reports
            # -----------------------------------

            reports_data = [
                {
                    "id": "RPT-001",
                    "review_id": "REV-001",
                    "reported_by": "BUY-002",
                    "reason": "The review contains misleading information.",
                    "status": "PENDING"
                },
                {
                    "id": "RPT-002",
                    "review_id": "REV-002",
                    "reported_by": "BUY-001",
                    "reason": "The review may contain inappropriate content.",
                    "status": "PENDING"
                }
            ]

            for report_data in reports_data:
                report = ReviewReportDB(
                    id=report_data["id"],
                    review_id=report_data["review_id"],
                    reported_by=report_data["reported_by"],
                    reason=report_data["reason"],
                    status=report_data["status"]
                )

                db.add(report)

            # Mark reported reviews
            review_1 = await db.get(ReviewDB, "REV-001")
            review_2 = await db.get(ReviewDB, "REV-002")

            if review_1:
                review_1.is_reported = True

            if review_2:
                review_2.is_reported = True

            await db.commit()

            logger.info("✅ Reviews, Ratings & Reports seeded successfully!")
            logger.info("📋 Added 3 reviews")
            logger.info("⭐ Added 3 ratings")
            logger.info("🚩 Added 2 pending reports")

        except Exception as e:
            await db.rollback()
            logger.error(f"❌ Error seeding reviews: {e}")
            raise

