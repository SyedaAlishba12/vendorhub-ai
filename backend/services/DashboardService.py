from sqlalchemy.orm import Session
from sqlalchemy import func

from models.product import Product
from models.Order import Order
from models.Inventory import Inventory


class DashboardService:

    @staticmethod
    def get_dashboard(db: Session):

        total_products = db.query(Product).count()

        total_orders = db.query(Order).count()

        total_inventory = db.query(Inventory).count()

        total_revenue = (
            db.query(func.sum(Order.total_price))
            .scalar()
            or 0
        )

        pending_orders = (
            db.query(Order)
            .filter(Order.status == "Pending")
            .count()
        )

        completed_orders = (
            db.query(Order)
            .filter(Order.status == "Completed")
            .count()
        )

        return {
            "total_products": total_products,
            "total_orders": total_orders,
            "total_revenue": float(total_revenue),
            "total_inventory": total_inventory,
            "pending_orders": pending_orders,
            "completed_orders": completed_orders,
        }
