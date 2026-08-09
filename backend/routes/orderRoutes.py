from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database.connection import get_db
from models.Order import Order
from common.middleware.authMiddleware import get_current_user

router = APIRouter(prefix="/api/orders", tags=["Orders"])

@router.get("/")
async def get_orders(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    """Get all orders for the current user (buyer/vendor)"""
    try:
        # We'll just return all orders for now; later can filter by buyer_id = user_id
        result = await db.execute(select(Order).order_by(Order.created_at.desc()))
        orders = result.scalars().all()
        return [
            {
                "id": o.id,
                "buyer_id": o.buyer_id,
                "vendor_id": o.vendor_id,
                "total_amount": o.total_amount,
                "status": o.status,
                "payment_status": o.payment_status,
                "created_at": o.created_at,
                "has_dispute": o.has_dispute,
            }
            for o in orders
        ]
    except Exception as e:
        print(f"Error fetching orders: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch orders")

@router.get("/{order_id}")
async def get_order(
    order_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    try:
        order = await db.get(Order, order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return order
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching order: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch order")