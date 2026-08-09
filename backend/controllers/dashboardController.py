from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from models.RFQ import RFQ
from models.Order import Order
from models.SavedVendor import SavedVendor
from models.RecentSearch import RecentSearch
from services.dashboardService import DashboardService
from services.aiService import generate_ai_recommendations

class DashboardController:

    @staticmethod
    async def get_buyer_dashboard(db: AsyncSession, user_id: int):
        try:
            return await DashboardService.get_buyer_dashboard(db, user_id)
        except HTTPException:
            raise
        except Exception as e:
            print(f"Dashboard error: {e}")
            raise HTTPException(status_code=500, detail=f"Dashboard error: {str(e)}")

    @staticmethod
    async def get_dashboard_statistics(db: AsyncSession, user_id: int):
        try:
            buyer = await DashboardService.get_buyer_by_user_id(db, user_id)
            user_id_str = str(buyer.user_id)

            # RFQ status distribution
            statuses = ["draft", "sent", "quoted", "closed", "cancelled"]
            rfq_dist = {}
            for status in statuses:
                result = await db.execute(
                    select(func.count()).select_from(RFQ).where(
                        RFQ.buyer_id == buyer.id,
                        RFQ.status == status
                    )
                )
                rfq_dist[status] = result.scalar() or 0

            # Order status distribution
            order_statuses = ["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]
            order_dist = {}
            for status in order_statuses:
                result = await db.execute(
                    select(func.count()).select_from(Order).where(
                        Order.buyer_id == user_id_str,
                        Order.status == status
                    )
                )
                order_dist[status] = result.scalar() or 0

            # Monthly spending trend (simplified – just current month)
            dashboard = await DashboardService.get_or_create_dashboard(db, buyer.id)
            monthly_spending_trend = [
                {"month": "Jan", "amount": 0},
                {"month": "Feb", "amount": 0},
                {"month": "Mar", "amount": 0},
                {"month": "Apr", "amount": 0},
                {"month": "May", "amount": 0},
                {"month": "Jun", "amount": float(dashboard.monthly_spending)},
            ]

            return {
                "monthly_spending_trend": monthly_spending_trend,
                "rfq_status_distribution": rfq_dist,
                "order_status_distribution": order_dist,
            }
        except HTTPException:
            raise
        except Exception as e:
            print(f"Statistics error: {e}")
            raise HTTPException(status_code=500, detail=f"Statistics error: {str(e)}")

    @staticmethod
    async def get_ai_recommendations(db: AsyncSession, user_id: int):
        try:
            buyer = await DashboardService.get_buyer_by_user_id(db, user_id)
            dashboard = await DashboardService.get_or_create_dashboard(db, buyer.id)

            # Gather data
            active_rfqs = dashboard.active_rfqs_count
            pending = dashboard.pending_quotations_count
            total_spending = dashboard.total_spending

            # saved vendors count
            result = await db.execute(
                select(func.count()).select_from(SavedVendor).where(SavedVendor.buyer_id == buyer.id)
            )
            saved_count = result.scalar() or 0

            # recent searches
            result = await db.execute(
                select(RecentSearch).where(RecentSearch.buyer_id == buyer.id).order_by(RecentSearch.created_at.desc()).limit(5)
            )
            recent_searches = [s.query for s in result.scalars().all()]

            # categories
            result = await db.execute(
                select(RFQ.category).where(RFQ.buyer_id == buyer.id).distinct()
            )
            categories = list(result.scalars().all())

            buyer_data = {
                "active_rfqs": active_rfqs,
                "pending_quotations": pending,
                "total_spending": total_spending,
                "saved_vendors_count": saved_count,
                "recent_searches": recent_searches,
                "categories": categories,
            }

            recommendations = await generate_ai_recommendations(buyer_data)
            return {"recommendations": recommendations}
        except HTTPException:
            raise
        except Exception as e:
            print(f"AI recommendation error: {e}")
            raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")

    @staticmethod
    async def get_orders(db: AsyncSession, user_id: int):
        try:
            result = await DashboardService.get_buyer_orders(db, user_id)
            return [
                {
                    "id": o.id,
                    "vendor_id": o.vendor_id,
                    "total_amount": o.total_amount,
                    "status": o.status,
                    "created_at": o.created_at,
                }
                for o in result
            ]
        except HTTPException:
            raise
        except Exception as e:
            print(f"Orders error: {e}")
            raise HTTPException(status_code=500, detail=f"Orders error: {str(e)}")

    @staticmethod
    async def get_activity(db: AsyncSession, user_id: int):
        try:
            result = await DashboardService.get_buyer_activity(db, user_id)
            return result
        except HTTPException:
            raise
        except Exception as e:
            print(f"Activity error: {e}")
            raise HTTPException(status_code=500, detail=f"Activity error: {str(e)}")