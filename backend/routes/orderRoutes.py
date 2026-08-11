from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database.connection import get_db
from controllers.orderController import OrderController

router = APIRouter(prefix="/api/orders", tags=["Order Management"])

@router.get("")
async def get_orders(db: AsyncSession = Depends(get_db)):
    return await OrderController.fetch_all_orders(db)

@router.get("/{order_id}")
async def get_order_details(order_id: str, db: AsyncSession = Depends(get_db)):
    return await OrderController.fetch_order_by_id(order_id, db)

@router.put("/{order_id}/cancel")
async def cancel_order(order_id: str, db: AsyncSession = Depends(get_db)):
    return await OrderController.cancel_order_by_id(order_id, db)

@router.post("/{order_id}/reorder")
async def reorder_products(order_id: str, db: AsyncSession = Depends(get_db)):
    return await OrderController.create_reorder(order_id, db)