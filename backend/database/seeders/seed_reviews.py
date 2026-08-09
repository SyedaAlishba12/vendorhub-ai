import logging
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from models.Review import ReviewDB
from models.Rating import RatingDB

logger = logging.getLogger("Seeder")

async def seed_reviews():
    from database.connection import AsyncSessionLocal

    async with AsyncSessionLocal() as db:
        try:
            logger.info("🌱 Seeding Reviews & Ratings...")

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

            await db.commit()
            logger.info("✅ Reviews & Ratings seeded successfully!")

        except Exception as e:
            await db.rollback()
            logger.error(f"❌ Error seeding reviews: {e}")
            raise e