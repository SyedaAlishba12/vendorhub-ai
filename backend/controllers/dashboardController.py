from fastapi import HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.RFQ import RFQ, RFQStatus
from models.Order import Order
from services.dashboardService import DashboardService


class DashboardController:

    # =========================================================
    # 🛒 BUYER DASHBOARD
    # =========================================================
    @staticmethod
    async def get_buyer_dashboard(
        db: AsyncSession,
        user_id: int
    ):
        try:
            return await DashboardService.get_buyer_dashboard(
                db,
                user_id
            )
        except HTTPException:
            raise
        except Exception as e:
            print(f"Dashboard error: {e}")
            raise HTTPException(
                status_code=500,
                detail="Failed to fetch dashboard"
            )

    # =========================================================
    # 📊 DASHBOARD STATISTICS
    # =========================================================
    @staticmethod
    async def get_dashboard_statistics(
        db: AsyncSession,
        user_id: int
    ):
        try:
            buyer = await DashboardService.get_buyer_by_user_id(
                db,
                user_id
            )

            # -------------------------------------------------
            # RFQ STATUS DISTRIBUTION
            # -------------------------------------------------
            rfq_dist = {}
            statuses = [
                RFQStatus.DRAFT,
                RFQStatus.SENT,
                RFQStatus.QUOTED,
                RFQStatus.CLOSED,
                RFQStatus.CANCELLED
            ]

            for status in statuses:
                result = await db.execute(
                    select(func.count())
                    .select_from(RFQ)
                    .where(
                        RFQ.buyer_id == buyer.id,
                        RFQ.status == status
                    )
                )
                rfq_dist[status.value] = (result.scalar() or 0)

            # -------------------------------------------------
            # ORDER STATUS DISTRIBUTION
            # -------------------------------------------------
            order_dist = {}
            order_statuses = ["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]
            user_id_str = str(buyer.user_id)

            for status in order_statuses:
                result = await db.execute(
                    select(func.count())
                    .select_from(Order)
                    .where(
                        Order.buyer_id == user_id_str,
                        Order.status == status
                    )
                )
                order_dist[status] = (result.scalar() or 0)

            # -------------------------------------------------
            # MONTHLY SPENDING TREND
            # -------------------------------------------------
            # Note: Ensure DashboardService.get_monthly_spending_trend accepts user_id_str
            monthly_spending_trend = (
                await DashboardService.get_monthly_spending_trend(
                    db,
                    user_id_str
                )
            )

            return {
                "monthly_spending_trend": monthly_spending_trend,
                "rfq_status_distribution": rfq_dist,
                "order_status_distribution": order_dist
            }

        except HTTPException:
            raise
        except Exception as e:
            print(f"Statistics error: {e}")
            raise HTTPException(
                status_code=500,
                detail="Failed to fetch dashboard statistics"
            )

    # =========================================================
    # 🤖 AI RECOMMENDATIONS (FIXED & CONNECTED)
    # =========================================================
    @staticmethod
    async def get_ai_recommendations(
        db: AsyncSession,
        user_id: int
    ):
        """
        🚀 CONNECTED AI RECOMMENDATIONS
        This takes real buyer data from the DB and feeds it into the AI Service.
        """
        try:
            # 1. Get the Buyer object
            buyer = await DashboardService.get_buyer_by_user_id(
                db,
                user_id
            )
            
            # 2. Get the Dashboard stats for the buyer
            dashboard = await DashboardService.get_or_create_dashboard(
                db,
                buyer.id
            )

            # 3. Gather Context Data (to make AI smarter)
            from sqlalchemy import select
            from models.RecentSearch import RecentSearch
            from models.RFQ import RFQ
            
            # Get recent searches (Last 5)
            search_result = await db.execute(
                select(RecentSearch.query)
                .where(RecentSearch.buyer_id == buyer.id)
                .order_by(RecentSearch.created_at.desc())
                .limit(5)
            )
            recent_searches = search_result.scalars().all()

            # Get categories of interest (from RFQs)
            cat_result = await db.execute(
                select(RFQ.category)
                .where(RFQ.buyer_id == buyer.id)
                .distinct()
            )
            categories = cat_result.scalars().all()

            # 🚀 PREPARE DATA FOR AI SERVICE
            # This dictionary is the "Food" for your aiService.py
            buyer_data = {
                "active_rfqs": dashboard.active_rfqs_count,
                "pending_quotations": dashboard.pending_quotations_count,
                "total_spending": dashboard.total_spending,
                "saved_vendors_count": dashboard.total_vendors,
                "recent_searches": recent_searches or [],
                "categories": categories or [],
            }

            # 4. CALL THE AI SERVICE 🤖
            # Import inside the function to prevent a circular import crash!
            from services.aiService import generate_ai_recommendations
            recommendations = await generate_ai_recommendations(buyer_data)

            return {
                "recommendations": recommendations
            }

        except Exception as e:
            print(f"❌ AI recommendation error: {e}")
            # 🚨 ULTIMATE FALLBACK: If everything fails, the UI should STILL NOT be empty.
            from services.aiService import get_rule_based_recommendations
            return {
                "recommendations": get_rule_based_recommendations({"active_rfqs": 0})
            }
    # =========================================================
    # 📦 GET ORDERS
    # =========================================================
    @staticmethod
    async def get_orders(
        db: AsyncSession,
        user_id: int
    ):
        try:
            result = await DashboardService.get_buyer_orders(
                db,
                user_id
            )
            return [
                {
                    "id": order.id,
                    "vendor_id": order.vendor_id,
                    "total_amount": float(order.total_amount or 0),
                    "status": str(order.status),
                    "created_at": order.created_at
                }
                for order in result
            ]
        except HTTPException:
            raise
        except Exception as e:
            print(f"Orders error: {e}")
            raise HTTPException(
                status_code=500,
                detail="Failed to fetch orders"
            )

    # =========================================================
    # 🕒 GET ACTIVITY
    # =========================================================
    @staticmethod
    async def get_activity(
        db: AsyncSession,
        user_id: int
    ):
        try:
            return await DashboardService.get_buyer_activity(
                db,
                user_id
            )
        except HTTPException:
            raise
        except Exception as e:
            print(f"Activity error: {e}")
            raise HTTPException(
                status_code=500,
                detail="Failed to fetch activity"
            )