from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select
from fastapi import HTTPException
import uuid

from models.Order import Order
from models.OrderItem import OrderItem
from models.Shipment import Shipment

class OrderController:

    @staticmethod
    async def fetch_all_orders(db: AsyncSession):
        result = await db.execute(
            select(Order).options(selectinload(Order.items), selectinload(Order.shipment))
        )
        orders = result.scalars().all()
        
        response = []
        for order in orders:
            response.append({
                "id": order.id,
                "buyer_id": order.buyer_id,
                "vendor_id": order.vendor_id,
                "total_amount": order.total_amount,
                "status": order.status,
                "payment_status": order.payment_status,
                "created_at": str(order.created_at),
                "items": [
                    {"name": item.product_name, "qty": item.quantity, "price": item.unit_price}
                    for item in (order.items or [])
                ],
                "shipment": {
                    "courier": order.shipment.courier if order.shipment else "DHL Express",
                    "tracking_number": order.shipment.tracking_number if order.shipment else "TRK-000000",
                    "status": order.shipment.status if order.shipment else "In Transit",
                    "estimated_delivery": order.shipment.estimated_delivery if order.shipment else "Pending"
                },
                "timeline": [
                    {"status": "Order Placed", "date": str(order.created_at)[:10], "completed": True},
                    {"status": "Processing", "date": "In Progress", "completed": order.status in ["PROCESSING", "SHIPPED", "DELIVERED"]},
                    {"status": "Shipped", "date": "Pending", "completed": order.status in ["SHIPPED", "DELIVERED"]},
                    {"status": "Delivered", "date": "Pending", "completed": order.status == "DELIVERED"}
                ]
            })
        return response

    @staticmethod
    async def fetch_order_by_id(order_id: str, db: AsyncSession):
        result = await db.execute(
            select(Order)
            .filter(Order.id == order_id)
            .options(selectinload(Order.items), selectinload(Order.shipment))
        )
        order = result.scalars().first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        return {
            "id": order.id,
            "buyer_id": order.buyer_id,
            "vendor_id": order.vendor_id,
            "total_amount": order.total_amount,
            "status": order.status,
            "payment_status": order.payment_status,
            "created_at": str(order.created_at),
            "items": [
                {"name": item.product_name, "qty": item.quantity, "price": item.unit_price}
                for item in (order.items or [])
            ],
            "shipment": {
                "courier": order.shipment.courier if order.shipment else "DHL Express",
                "tracking_number": order.shipment.tracking_number if order.shipment else "TRK-000000",
                "status": order.shipment.status if order.shipment else "In Transit",
                "estimated_delivery": order.shipment.estimated_delivery if order.shipment else "Pending"
            },
            "timeline": [
                {"status": "Order Placed", "date": str(order.created_at)[:10], "completed": True},
                {"status": "Processing", "date": "In Progress", "completed": order.status in ["PROCESSING", "SHIPPED", "DELIVERED"]},
                {"status": "Shipped", "date": "Pending", "completed": order.status in ["SHIPPED", "DELIVERED"]},
                {"status": "Delivered", "date": "Pending", "completed": order.status == "DELIVERED"}
            ]
        }

    @staticmethod
    async def cancel_order_by_id(order_id: str, db: AsyncSession):
        result = await db.execute(select(Order).filter(Order.id == order_id))
        order = result.scalars().first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        order.status = "CANCELLED"
        await db.commit()
        return {"message": f"Order {order_id} cancelled successfully."}

    @staticmethod
    async def create_reorder(order_id: str, db: AsyncSession):
        result = await db.execute(
            select(Order)
            .filter(Order.id == order_id)
            .options(selectinload(Order.items))
        )
        order = result.scalars().first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        new_order_id = f"ORD-{uuid.uuid4().hex[:4].upper()}"
        new_order = Order(
            id=new_order_id,
            buyer_id=order.buyer_id,
            vendor_id=order.vendor_id,
            total_amount=order.total_amount,
            status="PENDING",
            payment_status="UNPAID"
        )
        
        db.add(new_order)
        
        for item in (order.items or []):
            new_item = OrderItem(
                id=f"ITM-{uuid.uuid4().hex[:4].upper()}",
                order_id=new_order_id,
                product_name=item.product_name,
                quantity=item.quantity,
                unit_price=item.unit_price
            )
            db.add(new_item)
            
        await db.commit()
        return {"message": "Reorder placed successfully", "new_order_id": new_order_id}