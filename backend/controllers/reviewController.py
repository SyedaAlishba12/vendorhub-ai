import uuid
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException
from models.Review import ReviewDB
from models.Rating import RatingDB
from models.ReviewReport import ReviewReportDB

class ReviewController:

    @staticmethod
    async def get_reviews(db: AsyncSession, vendor_id: str = None, search: str = None):
        stmt = select(ReviewDB).options(selectinload(ReviewDB.ratings))
        if vendor_id:
            stmt = stmt.where(ReviewDB.vendor_id == vendor_id)
            
        result = await db.execute(stmt)
        reviews = result.scalars().all()

        if search:
            s = search.lower()
            reviews = [r for r in reviews if s in r.comment.lower() or s in r.buyer_name.lower()]

        return reviews

    @staticmethod
    async def create_review(db: AsyncSession, payload: dict):
        review_id = f"REV-{uuid.uuid4().hex[:8].upper()}"
        rating_id = f"RAT-{uuid.uuid4().hex[:8].upper()}"

        overall = round(
            (float(payload.get('product_rating', 5)) + float(payload.get('communication_rating', 5)) + 
             float(payload.get('delivery_rating', 5)) + float(payload.get('quality_rating', 5)) + float(payload.get('service_rating', 5))) / 5.0, 1
        )

        new_review = ReviewDB(
            id=review_id,
            vendor_id=payload.get('vendor_id', 'VEN-001'),
            buyer_id=payload.get('buyer_id', 'BUY-001'),
            buyer_name=payload.get('buyer_name', 'Zainab Bibi'),
            product_id=payload.get('product_id', 'PROD-101'),
            comment=payload.get('comment', ''),
            helpful_votes=0
        )

        new_rating = RatingDB(
            id=rating_id,
            review_id=review_id,
            overall_rating=overall,
            product_rating=float(payload.get('product_rating', 5)),
            communication_rating=float(payload.get('communication_rating', 5)),
            delivery_rating=float(payload.get('delivery_rating', 5)),
            quality_rating=float(payload.get('quality_rating', 5)),
            service_rating=float(payload.get('service_rating', 5))
        )

        db.add(new_review)
        db.add(new_rating)
        await db.commit()
        await db.refresh(new_review)
        return new_review

    @staticmethod
    async def update_review(db: AsyncSession, review_id: str, payload: dict):
        stmt = select(ReviewDB).options(selectinload(ReviewDB.ratings)).where(ReviewDB.id == review_id)
        result = await db.execute(stmt)
        review = result.scalar_one_or_none()

        if not review:
            raise HTTPException(status_code=404, detail="Review not found")

        if 'comment' in payload:
            review.comment = payload['comment']

        if review.ratings:
            if 'product_rating' in payload: review.ratings.product_rating = float(payload['product_rating'])
            if 'communication_rating' in payload: review.ratings.communication_rating = float(payload['communication_rating'])
            if 'delivery_rating' in payload: review.ratings.delivery_rating = float(payload['delivery_rating'])
            if 'quality_rating' in payload: review.ratings.quality_rating = float(payload['quality_rating'])
            if 'service_rating' in payload: review.ratings.service_rating = float(payload['service_rating'])
            
            review.ratings.overall_rating = round(
                (review.ratings.product_rating + review.ratings.communication_rating + 
                 review.ratings.delivery_rating + review.ratings.quality_rating + review.ratings.service_rating) / 5.0, 1
            )

        await db.commit()
        await db.refresh(review)
        return review

    @staticmethod
    async def toggle_helpful(db: AsyncSession, review_id: str):
        stmt = select(ReviewDB).where(ReviewDB.id == review_id)
        result = await db.execute(stmt)
        review = result.scalar_one_or_none()
        
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")
            
        current_count = getattr(review, 'helpful_votes', 0) or 0
        review.helpful_votes = current_count + 1
        
        await db.commit()
        await db.refresh(review)
        return {"message": "Helpful count updated", "helpful_votes": review.helpful_votes}

    @staticmethod
    async def delete_review(db: AsyncSession, review_id: str):
        result = await db.execute(select(ReviewDB).where(ReviewDB.id == review_id))
        review = result.scalar_one_or_none()
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")

        await db.delete(review)
        await db.commit()
        return {"message": "Review deleted successfully"}

    @staticmethod
    async def get_statistics(db: AsyncSession, vendor_id: str = None):
        stmt = select(ReviewDB).options(selectinload(ReviewDB.ratings))
        if vendor_id:
            stmt = stmt.where(ReviewDB.vendor_id == vendor_id)
            
        result = await db.execute(stmt)
        reviews = result.scalars().all()

        total_reviews = len(reviews)
        if total_reviews == 0:
            return {
                "total_reviews": 0, "average_overall": 0.0,
                "breakdown": {"product": 0, "communication": 0, "delivery": 0, "quality": 0, "service": 0}
            }

        avg_overall = sum(r.ratings.overall_rating for r in reviews if r.ratings) / total_reviews
        avg_prod = sum(r.ratings.product_rating for r in reviews if r.ratings) / total_reviews
        avg_comm = sum(r.ratings.communication_rating for r in reviews if r.ratings) / total_reviews
        avg_del = sum(r.ratings.delivery_rating for r in reviews if r.ratings) / total_reviews
        avg_qual = sum(r.ratings.quality_rating for r in reviews if r.ratings) / total_reviews
        avg_serv = sum(r.ratings.service_rating for r in reviews if r.ratings) / total_reviews

        return {
            "total_reviews": total_reviews,
            "average_overall": round(avg_overall, 1),
            "breakdown": {
                "product": round(avg_prod, 1),
                "communication": round(avg_comm, 1),
                "delivery": round(avg_del, 1),
                "quality": round(avg_qual, 1),
                "service": round(avg_serv, 1)
            }
        }

    @staticmethod
    async def report_review(db: AsyncSession, review_id: str, reported_by: str, reason: str):
        result = await db.execute(select(ReviewDB).where(ReviewDB.id == review_id))
        review = result.scalar_one_or_none()
        if not review:
            raise HTTPException(status_code=404, detail="Review not found")

        review.is_reported = True
        report_id = f"REP-{uuid.uuid4().hex[:8].upper()}"
        report = ReviewReportDB(id=report_id, review_id=review_id, reported_by=reported_by, reason=reason)

        db.add(report)
        await db.commit()
        return {"message": "Review reported successfully", "report_id": report_id}