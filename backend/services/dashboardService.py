from datetime import datetime
from dateutil.relativedelta import relativedelta

from fastapi import HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.Buyer import Buyer, Dashboard
from models.RFQ import RFQ, RFQStatus
from models.Order import Order
from models.SavedVendor import SavedVendor
from models.RecentSearch import RecentSearch
from models.vendors import Vendor


class DashboardService:

    # =========================================================
    # GET OR CREATE DASHBOARD
    # =========================================================

    @staticmethod
    async def get_or_create_dashboard(
        db: AsyncSession,
        buyer_id: int
    ) -> Dashboard:

        result = await db.execute(
            select(Dashboard).where(
                Dashboard.buyer_id == buyer_id
            )
        )

        dashboard = result.scalar_one_or_none()

        if not dashboard:
            dashboard = Dashboard(
                buyer_id=buyer_id
            )

            db.add(dashboard)
            await db.commit()
            await db.refresh(dashboard)

        return dashboard

    # =========================================================
    # GET BUYER BY USER ID
    # =========================================================

    @staticmethod
    async def get_buyer_by_user_id(
        db: AsyncSession,
        user_id: int
    ) -> Buyer:

        result = await db.execute(
            select(Buyer).where(
                Buyer.user_id == user_id
            )
        )

        buyer = result.scalar_one_or_none()

        if not buyer:
            raise HTTPException(
                status_code=404,
                detail="Buyer not found"
            )

        return buyer

    # =========================================================
    # UPDATE DASHBOARD STATISTICS
    # =========================================================

    @staticmethod
    async def update_dashboard_stats(
        db: AsyncSession,
        buyer_id: int
    ):

        try:

            dashboard = await DashboardService.get_or_create_dashboard(
                db,
                buyer_id
            )

            # -------------------------------------------------
            # Active RFQs
            # SENT + QUOTED
            # -------------------------------------------------

            result = await db.execute(
                select(func.count())
                .select_from(RFQ)
                .where(
                    RFQ.buyer_id == buyer_id,
                    RFQ.status.in_([
                        RFQStatus.SENT,
                        RFQStatus.QUOTED
                    ])
                )
            )

            active_rfqs = result.scalar() or 0

            # -------------------------------------------------
            # Pending Quotations
            # QUOTED
            # -------------------------------------------------

            result = await db.execute(
                select(func.count())
                .select_from(RFQ)
                .where(
                    RFQ.buyer_id == buyer_id,
                    RFQ.status == RFQStatus.QUOTED
                )
            )

            pending_quotations = result.scalar() or 0

            # -------------------------------------------------
            # Get Buyer
            # -------------------------------------------------

            buyer = await db.get(
                Buyer,
                buyer_id
            )

            if not buyer:
                raise HTTPException(
                    status_code=404,
                    detail="Buyer not found"
                )

            user_id_str = str(buyer.user_id)

            # -------------------------------------------------
            # Total Orders
            # -------------------------------------------------

            result = await db.execute(
                select(func.count())
                .select_from(Order)
                .where(
                    Order.buyer_id == user_id_str
                )
            )

            total_orders = result.scalar() or 0

            # -------------------------------------------------
            # Total Spending
            # -------------------------------------------------

            result = await db.execute(
                select(
                    func.coalesce(
                        func.sum(Order.total_amount),
                        0.0
                    )
                )
                .where(
                    Order.buyer_id == user_id_str
                )
            )

            total_spending = result.scalar() or 0.0

            # -------------------------------------------------
            # Current Month Spending
            # -------------------------------------------------

            today = datetime.utcnow()

            month_start = today.replace(
                day=1,
                hour=0,
                minute=0,
                second=0,
                microsecond=0
            )

            result = await db.execute(
                select(
                    func.coalesce(
                        func.sum(Order.total_amount),
                        0.0
                    )
                )
                .where(
                    Order.buyer_id == user_id_str,
                    Order.created_at >= month_start
                )
            )

            monthly_spending = result.scalar() or 0.0

            # -------------------------------------------------
            # Saved Vendors
            # -------------------------------------------------

            result = await db.execute(
                select(func.count())
                .select_from(SavedVendor)
                .where(
                    SavedVendor.buyer_id == buyer_id
                )
            )

            total_vendors = result.scalar() or 0

            # -------------------------------------------------
            # Update Dashboard
            # -------------------------------------------------

            dashboard.active_rfqs_count = active_rfqs
            dashboard.pending_quotations_count = pending_quotations
            dashboard.total_orders = total_orders
            dashboard.total_vendors = total_vendors
            dashboard.total_spending = float(total_spending)
            dashboard.monthly_spending = float(monthly_spending)
            dashboard.last_updated = datetime.utcnow()

            await db.commit()
            await db.refresh(dashboard)

            return dashboard

        except HTTPException:
            raise

        except Exception:
            await db.rollback()
            raise

    # =========================================================
    # MONTHLY SPENDING TREND
    # =========================================================

    @staticmethod
    async def get_monthly_spending_trend(
        db: AsyncSession,
        user_id_str: str
    ):

        """
        Returns spending for the current month
        and previous 5 months.
        """

        today = datetime.utcnow()

        first_day_current_month = today.replace(
            day=1,
            hour=0,
            minute=0,
            second=0,
            microsecond=0
        )

        months = []

        # Start from 5 months ago and move forward
        # until the current month.
        for i in range(5, -1, -1):

            month_start = (
                first_day_current_month
                - relativedelta(months=i)
            )

            next_month = (
                month_start
                + relativedelta(months=1)
            )

            result = await db.execute(
                select(
                    func.coalesce(
                        func.sum(Order.total_amount),
                        0.0
                    )
                )
                .where(
                    Order.buyer_id == user_id_str,
                    Order.created_at >= month_start,
                    Order.created_at < next_month
                )
            )

            amount = result.scalar() or 0.0

            months.append({
                "month": month_start.strftime("%b"),
                "amount": float(amount)
            })

        return months

    # =========================================================
    # GET BUYER DASHBOARD
    # =========================================================

    @staticmethod
    async def get_buyer_dashboard(
        db: AsyncSession,
        user_id: int
    ) -> dict:

        buyer = await DashboardService.get_buyer_by_user_id(
            db,
            user_id
        )

        # Update stored dashboard statistics
        await DashboardService.update_dashboard_stats(
            db,
            buyer.id
        )

        dashboard = await DashboardService.get_or_create_dashboard(
            db,
            buyer.id
        )

        # -------------------------------------------------
        # Stats
        # -------------------------------------------------

        stats = {
            "active_rfqs": dashboard.active_rfqs_count,
            "pending_quotations": dashboard.pending_quotations_count,
            "total_orders": dashboard.total_orders,
            "total_vendors": dashboard.total_vendors,
            "total_spending": float(
                dashboard.total_spending or 0
            ),
            "monthly_spending": float(
                dashboard.monthly_spending or 0
            )
        }

        # -------------------------------------------------
        # Recent RFQs
        # -------------------------------------------------

        result = await db.execute(
            select(RFQ)
            .where(
                RFQ.buyer_id == buyer.id
            )
            .order_by(
                RFQ.created_at.desc()
            )
            .limit(5)
        )

        rfqs = result.scalars().all()

        recent_rfqs = [
            {
                "id": rfq.id,
                "rfq_ref": rfq.rfq_ref,
                "product_name": rfq.product_name,
                "category": rfq.category,
                "quantity": rfq.quantity,
                "unit": rfq.unit,
                "status": rfq.status.value,
                "created_at": rfq.created_at
            }
            for rfq in rfqs
        ]

        # -------------------------------------------------
        # Active RFQs
        # -------------------------------------------------

        result = await db.execute(
            select(RFQ)
            .where(
                RFQ.buyer_id == buyer.id,
                RFQ.status.in_([
                    RFQStatus.SENT,
                    RFQStatus.QUOTED
                ])
            )
            .order_by(
                RFQ.created_at.desc()
            )
        )

        active_rfqs = result.scalars().all()

        active_rfqs_list = [
            {
                "id": rfq.id,
                "rfq_ref": rfq.rfq_ref,
                "product_name": rfq.product_name,
                "quantity": rfq.quantity,
                "unit": rfq.unit,
                "budget": rfq.budget,
                "status": rfq.status.value,
                "created_at": rfq.created_at
            }
            for rfq in active_rfqs
        ]

        # -------------------------------------------------
        # Pending Quotations
        # -------------------------------------------------

        pending_quotations = [
            {
                "id": rfq.id,
                "rfq_ref": rfq.rfq_ref,
                "product_name": rfq.product_name,
                "quantity": rfq.quantity,
                "unit": rfq.unit,
                "status": rfq.status.value
            }
            for rfq in active_rfqs
            if rfq.status == RFQStatus.QUOTED
        ]

        # -------------------------------------------------
        # Orders
        # -------------------------------------------------

        user_id_str = str(buyer.user_id)

        result = await db.execute(
            select(Order)
            .where(
                Order.buyer_id == user_id_str
            )
            .order_by(
                Order.created_at.desc()
            )
            .limit(10)
        )

        orders = result.scalars().all()

        orders_summary = {
            "total": len(orders),
            "in_transit": sum(
                1
                for order in orders
                if str(order.status).upper() == "SHIPPED"
            ),
            "delivered": sum(
                1
                for order in orders
                if str(order.status).upper() == "DELIVERED"
            )
        }

        # -------------------------------------------------
        # Saved Vendors
        # -------------------------------------------------

        result = await db.execute(
            select(Vendor)
            .join(
                SavedVendor,
                SavedVendor.vendor_id == Vendor.id
            )
            .where(
                SavedVendor.buyer_id == buyer.id
            )
        )

        vendors = result.scalars().all()

        saved_vendors = [
            {
                "name": vendor.company_name,
                "rating": vendor.rating,
                "location": vendor.country,
                "verified": vendor.is_verified
            }
            for vendor in vendors
        ]

        # -------------------------------------------------
        # Recent Searches
        # -------------------------------------------------

        result = await db.execute(
            select(RecentSearch)
            .where(
                RecentSearch.buyer_id == buyer.id
            )
            .order_by(
                RecentSearch.created_at.desc()
            )
            .limit(5)
        )

        recent_searches = [
            search.query
            for search in result.scalars().all()
        ]

        # -------------------------------------------------
        # Spending
        # -------------------------------------------------

        today = datetime.utcnow()

        month_start = today.replace(
            day=1,
            hour=0,
            minute=0,
            second=0,
            microsecond=0
        )

        last_month_start = (
            month_start - relativedelta(months=1)
        )

        # Current month

        result = await db.execute(
            select(
                func.coalesce(
                    func.sum(Order.total_amount),
                    0.0
                )
            )
            .where(
                Order.buyer_id == user_id_str,
                Order.created_at >= month_start
            )
        )

        monthly_spent = result.scalar() or 0.0

        # Previous month

        result = await db.execute(
            select(
                func.coalesce(
                    func.sum(Order.total_amount),
                    0.0
                )
            )
            .where(
                Order.buyer_id == user_id_str,
                Order.created_at >= last_month_start,
                Order.created_at < month_start
            )
        )

        last_month_spent = result.scalar() or 0.0

        # Total

        result = await db.execute(
            select(
                func.coalesce(
                    func.sum(Order.total_amount),
                    0.0
                )
            )
            .where(
                Order.buyer_id == user_id_str
            )
        )

        total_spent = result.scalar() or 0.0

        spending = {
            "monthly": float(monthly_spent),
            "last_month": float(last_month_spent),
            "total": float(total_spent)
        }

        # -------------------------------------------------
        # Activity
        # -------------------------------------------------

        activity = await DashboardService.get_buyer_activity(
            db,
            user_id
        )

        # -------------------------------------------------
        # Recommendations
        # -------------------------------------------------

        recommendations = []

        # -------------------------------------------------
        # Final Response
        # -------------------------------------------------

        return {
            "stats": stats,
            "recent_rfqs": recent_rfqs,
            "active_rfqs": active_rfqs_list,
            "pending_quotations": pending_quotations,
            "orders_summary": orders_summary,
            "saved_vendors": saved_vendors,
            "recent_searches": recent_searches,
            "spending": spending,
            "activity": activity,
            "recommendations": recommendations
        }

    # =========================================================
    # GET BUYER ORDERS
    # =========================================================

    @staticmethod
    async def get_buyer_orders(
        db: AsyncSession,
        user_id: int
    ):

        buyer = await DashboardService.get_buyer_by_user_id(
            db,
            user_id
        )

        result = await db.execute(
            select(Order)
            .where(
                Order.buyer_id == str(buyer.user_id)
            )
            .order_by(
                Order.created_at.desc()
            )
        )

        return result.scalars().all()

    # =========================================================
    # GET BUYER ACTIVITY
    # =========================================================

    @staticmethod
    async def get_buyer_activity(
        db: AsyncSession,
        user_id: int
    ):

        buyer = await DashboardService.get_buyer_by_user_id(
            db,
            user_id
        )

        # -------------------------------------------------
        # Recent RFQs
        # -------------------------------------------------

        rfq_result = await db.execute(
            select(RFQ)
            .where(
                RFQ.buyer_id == buyer.id
            )
            .order_by(
                RFQ.created_at.desc()
            )
            .limit(5)
        )

        rfqs = rfq_result.scalars().all()

        # -------------------------------------------------
        # Recent Orders
        # -------------------------------------------------

        order_result = await db.execute(
            select(Order)
            .where(
                Order.buyer_id == str(buyer.user_id)
            )
            .order_by(
                Order.created_at.desc()
            )
            .limit(5)
        )

        orders = order_result.scalars().all()

        activity = []

        # -------------------------------------------------
        # RFQ Activity
        # -------------------------------------------------

        for rfq in rfqs:

            activity.append({
                "type": "rfq",
                "title": (
                    f"RFQ {rfq.rfq_ref} - "
                    f"{rfq.status.value}"
                ),
                "description": (
                    f"{rfq.quantity} "
                    f"{rfq.unit} of "
                    f"{rfq.product_name}"
                ),
                "time": rfq.created_at.isoformat()
            })

        # -------------------------------------------------
        # Order Activity
        # -------------------------------------------------

        for order in orders:

            activity.append({
                "type": "order",
                "title": (
                    f"Order {order.id} - "
                    f"{order.status}"
                ),
                "description": (
                    f"Total: "
                    f"${float(order.total_amount or 0):.2f}"
                ),
                "time": order.created_at.isoformat()
            })

        # -------------------------------------------------
        # Sort Activity
        # -------------------------------------------------

        activity.sort(
            key=lambda item: item["time"],
            reverse=True
        )

        return activity[:10]