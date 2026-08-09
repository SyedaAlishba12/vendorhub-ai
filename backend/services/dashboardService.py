from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from datetime import datetime, timedelta
from fastapi import HTTPException

from models.Buyer import Buyer, Dashboard
from models.RFQ import RFQ, RFQStatus
from models.Order import Order
from models.SavedVendor import SavedVendor
from models.RecentSearch import RecentSearch
from models.Vendor import Vendor


class DashboardService:

    @staticmethod
    async def get_or_create_dashboard(db: AsyncSession, buyer_id: int) -> Dashboard:
        result = await db.execute(select(Dashboard).where(Dashboard.buyer_id == buyer_id))
        dashboard = result.scalar_one_or_none()
        if not dashboard:
            dashboard = Dashboard(buyer_id=buyer_id)
            db.add(dashboard)
            await db.commit()
            await db.refresh(dashboard)
        return dashboard

    @staticmethod
    async def get_buyer_by_user_id(db: AsyncSession, user_id: int) -> Buyer:
        result = await db.execute(select(Buyer).where(Buyer.user_id == user_id))
        buyer = result.scalar_one_or_none()
        if not buyer:
            raise HTTPException(status_code=404, detail="Buyer not found")
        return buyer

    @staticmethod
    async def update_dashboard_stats(db: AsyncSession, buyer_id: int):
        try:
            dashboard = await DashboardService.get_or_create_dashboard(db, buyer_id)

            # Active RFQs = SENT + QUOTED
            result = await db.execute(
                select(func.count()).select_from(RFQ).where(
                    RFQ.buyer_id == buyer_id,
                    RFQ.status.in_([RFQStatus.SENT, RFQStatus.QUOTED])
                )
            )
            active_rfqs = result.scalar() or 0

            # Pending quotations = QUOTED
            result = await db.execute(
                select(func.count()).select_from(RFQ).where(
                    RFQ.buyer_id == buyer_id, RFQ.status == RFQStatus.QUOTED
                )
            )
            pending_quotations = result.scalar() or 0

            buyer = await db.get(Buyer, buyer_id)
            if not buyer:
                raise HTTPException(status_code=404, detail="Buyer not found")

            user_id_str = str(buyer.user_id)

            # Total orders
            result = await db.execute(
                select(func.count()).select_from(Order).where(Order.buyer_id == user_id_str)
            )
            total_orders = result.scalar() or 0

            # Total spending
            result = await db.execute(
                select(func.coalesce(func.sum(Order.total_amount), 0.0)).where(Order.buyer_id == user_id_str)
            )
            total_spending = result.scalar() or 0.0

            # Monthly spending
            today = datetime.utcnow()
            month_start = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            result = await db.execute(
                select(func.coalesce(func.sum(Order.total_amount), 0.0)).where(
                    Order.buyer_id == user_id_str, Order.created_at >= month_start
                )
            )
            monthly_spending = result.scalar() or 0.0

            # Saved vendors count
            result = await db.execute(
                select(func.count()).select_from(SavedVendor).where(SavedVendor.buyer_id == buyer_id)
            )
            total_vendors = result.scalar() or 0

            dashboard.active_rfqs_count = active_rfqs
            dashboard.pending_quotations_count = pending_quotations
            dashboard.total_orders = total_orders
            dashboard.total_vendors = total_vendors
            dashboard.total_spending = float(total_spending)
            dashboard.monthly_spending = float(monthly_spending)
            dashboard.last_updated = datetime.utcnow()

            await db.commit()
        except Exception as e:
            print(f"Error updating dashboard stats: {e}")
            await db.rollback()
            raise

    @staticmethod
    async def get_buyer_dashboard(db: AsyncSession, user_id: int) -> dict:
        buyer = await DashboardService.get_buyer_by_user_id(db, user_id)
        await DashboardService.update_dashboard_stats(db, buyer.id)
        dashboard = await DashboardService.get_or_create_dashboard(db, buyer.id)

        stats = {
            "active_rfqs": dashboard.active_rfqs_count,
            "pending_quotations": dashboard.pending_quotations_count,
            "total_orders": dashboard.total_orders,
            "total_vendors": dashboard.total_vendors,
            "total_spending": dashboard.total_spending,
            "monthly_spending": dashboard.monthly_spending,
        }

        # Recent RFQs
        result = await db.execute(
            select(RFQ).where(RFQ.buyer_id == buyer.id).order_by(RFQ.created_at.desc()).limit(5)
        )
        rfqs = result.scalars().all()
        recent_rfqs = [{
            "id": rfq.id,
            "rfq_ref": rfq.rfq_ref,
            "product_name": rfq.product_name,
            "category": rfq.category,
            "quantity": rfq.quantity,
            "unit": rfq.unit,
            "status": rfq.status.value,
            "created_at": rfq.created_at,
        } for rfq in rfqs]

        # Active RFQs
        result = await db.execute(
            select(RFQ).where(
                RFQ.buyer_id == buyer.id,
                RFQ.status.in_([RFQStatus.SENT, RFQStatus.QUOTED])
            ).order_by(RFQ.created_at.desc())
        )
        active_rfqs = result.scalars().all()
        active_rfqs_list = [{
            "id": rfq.id,
            "rfq_ref": rfq.rfq_ref,
            "product_name": rfq.product_name,
            "quantity": rfq.quantity,
            "unit": rfq.unit,
            "budget": rfq.budget,
            "status": rfq.status.value,
            "created_at": rfq.created_at,
        } for rfq in active_rfqs]

        # Pending quotations
        pending_quotations = [{
            "id": rfq.id,
            "rfq_ref": rfq.rfq_ref,
            "product_name": rfq.product_name,
            "quantity": rfq.quantity,
            "unit": rfq.unit,
            "status": rfq.status.value,
        } for rfq in active_rfqs if rfq.status == RFQStatus.QUOTED]

        # Orders summary
        user_id_str = str(buyer.user_id)
        result = await db.execute(
            select(Order).where(Order.buyer_id == user_id_str).order_by(Order.created_at.desc()).limit(10)
        )
        orders = result.scalars().all()
        orders_summary = {
            "total": len(orders),
            "in_transit": sum(1 for o in orders if str(o.status).upper() == "SHIPPED"),
            "delivered": sum(1 for o in orders if str(o.status).upper() == "DELIVERED"),
        }

        # Saved vendors
        result = await db.execute(
            select(Vendor).join(SavedVendor, SavedVendor.vendor_id == Vendor.id)
            .where(SavedVendor.buyer_id == buyer.id)
        )
        vendors = result.scalars().all()
        saved_vendors = [{
            "name": v.company_name,
            "rating": v.rating,
            "location": v.country,
            "verified": v.is_verified,
        } for v in vendors]

        # Recent searches
        result = await db.execute(
            select(RecentSearch).where(RecentSearch.buyer_id == buyer.id)
            .order_by(RecentSearch.created_at.desc()).limit(5)
        )
        recent_searches = [s.query for s in result.scalars().all()]

        # Spending
        today = datetime.utcnow()
        month_start = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_month_start = (month_start - timedelta(days=1)).replace(day=1)

        result = await db.execute(
            select(func.coalesce(func.sum(Order.total_amount), 0.0))
            .where(Order.buyer_id == user_id_str, Order.created_at >= month_start)
        )
        monthly_spent = result.scalar() or 0.0

        result = await db.execute(
            select(func.coalesce(func.sum(Order.total_amount), 0.0))
            .where(Order.buyer_id == user_id_str,
                   Order.created_at >= last_month_start,
                   Order.created_at < month_start)
        )
        last_month_spent = result.scalar() or 0.0

        result = await db.execute(
            select(func.coalesce(func.sum(Order.total_amount), 0.0))
            .where(Order.buyer_id == user_id_str)
        )
        total_spent = result.scalar() or 0.0

        spending = {
            "monthly": float(monthly_spent),
            "last_month": float(last_month_spent),
            "total": float(total_spent),
        }

        # Activity
        activity = await DashboardService.get_buyer_activity(db, user_id)

        # Recommendations - empty for now (use /dashboard/recommendations endpoint separately)
        recommendations = []

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
            "recommendations": recommendations,
        }

    @staticmethod
    async def get_buyer_orders(db: AsyncSession, user_id: int):
        buyer = await DashboardService.get_buyer_by_user_id(db, user_id)
        result = await db.execute(
            select(Order).where(Order.buyer_id == str(buyer.user_id)).order_by(Order.created_at.desc())
        )
        return result.scalars().all()

    @staticmethod
    async def get_buyer_activity(db: AsyncSession, user_id: int):
        buyer = await DashboardService.get_buyer_by_user_id(db, user_id)

        rfq_result = await db.execute(
            select(RFQ).where(RFQ.buyer_id == buyer.id).order_by(RFQ.created_at.desc()).limit(5)
        )
        rfqs = rfq_result.scalars().all()

        order_result = await db.execute(
            select(Order).where(Order.buyer_id == str(buyer.user_id)).order_by(Order.created_at.desc()).limit(5)
        )
        orders = order_result.scalars().all()

        activity = []
        for rfq in rfqs:
            activity.append({
                "type": "rfq",
                "title": f"RFQ {rfq.rfq_ref} - {rfq.status.value}",
                "description": f"{rfq.quantity} {rfq.unit} of {rfq.product_name}",
                "time": rfq.created_at.isoformat(),
            })
        for order in orders:
            activity.append({
                "type": "order",
                "title": f"Order {order.id} - {order.status}",
                "description": f"Total: ${float(order.total_amount or 0):.2f}",
                "time": order.created_at.isoformat(),
            })
        activity.sort(key=lambda x: x["time"], reverse=True)
        return activity[:10]