from fastapi import HTTPException

from services.OrderService import OrderService


class OrderController:

    @staticmethod
    def create_order(db, data, current_user):
        try:
            return OrderService.create_order(
                db,
                data,
                current_user,
            )
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=str(e),
            )

    @staticmethod
    def get_orders(db, current_user):
        try:
            return OrderService.get_orders(
                db,
                current_user,
            )
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=str(e),
            )

    @staticmethod
    def update_order(db, order_id, data, current_user):
        try:
            return OrderService.update_order(
                db,
                order_id,
                data,
                current_user,
            )
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=str(e),
            )

    @staticmethod
    def delete_order(db, order_id, current_user):
        try:
            return OrderService.delete_order(
                db,
                order_id,
                current_user,
            )
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=str(e),
            )