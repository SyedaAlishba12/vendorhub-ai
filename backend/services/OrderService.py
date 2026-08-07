from fastapi import HTTPException
from sqlalchemy.orm import Session

from models.Order import Order
from models.Product import Product
from models.Vendor import Vendor


class OrderService:

    @staticmethod
    def create_order(db: Session, data, current_user):

        # Get Vendor
        vendor = (
            db.query(Vendor)
            .filter(Vendor.user_id == current_user.id)
            .first()
        )

        if not vendor:
            raise HTTPException(
                status_code=404,
                detail="Vendor not found."
            )

        # Check Product belongs to Vendor
        product = (
            db.query(Product)
            .filter(
                Product.id == data.product_id,
                Product.vendor_id == vendor.id,
            )
            .first()
        )

        if not product:
            raise HTTPException(
                status_code=404,
                detail="Product not found."
            )

        # Check Stock
        if product.quantity < data.quantity:
            raise HTTPException(
                status_code=400,
                detail="Insufficient stock."
            )

        total = product.price * data.quantity

        order = Order(
            vendor_id=vendor.id,
            product_id=data.product_id,
            quantity=data.quantity,
            total_price=total,
        )

        # Reduce Product Stock
        product.quantity -= data.quantity

        db.add(order)
        db.commit()
        db.refresh(order)

        return order

    @staticmethod
    def get_orders(db: Session, current_user):

        vendor = (
            db.query(Vendor)
            .filter(Vendor.user_id == current_user.id)
            .first()
        )

        if not vendor:
            raise HTTPException(
                status_code=404,
                detail="Vendor not found."
            )

        return (
            db.query(Order)
            .filter(Order.vendor_id == vendor.id)
            .all()
        )

    @staticmethod
    def update_order(db: Session, order_id: int, data, current_user):

        vendor = (
            db.query(Vendor)
            .filter(Vendor.user_id == current_user.id)
            .first()
        )

        if not vendor:
            raise HTTPException(
                status_code=404,
                detail="Vendor not found."
            )

        order = (
            db.query(Order)
            .filter(
                Order.id == order_id,
                Order.vendor_id == vendor.id,
            )
            .first()
        )

        if not order:
            raise HTTPException(
                status_code=404,
                detail="Order not found."
            )

        update_data = data.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(order, key, value)

        db.commit()
        db.refresh(order)

        return order

    @staticmethod
    def delete_order(db: Session, order_id: int, current_user):

        vendor = (
            db.query(Vendor)
            .filter(Vendor.user_id == current_user.id)
            .first()
        )

        if not vendor:
            raise HTTPException(
                status_code=404,
                detail="Vendor not found."
            )

        order = (
            db.query(Order)
            .filter(
                Order.id == order_id,
                Order.vendor_id == vendor.id,
            )
            .first()
        )

        if not order:
            raise HTTPException(
                status_code=404,
                detail="Order not found."
            )

        db.delete(order)
        db.commit()

        return {
            "message": "Order deleted successfully."
        }