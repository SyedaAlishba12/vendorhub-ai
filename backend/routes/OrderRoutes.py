from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import SessionLocal
from common.utils.auth import get_current_user

from controllers.OrderController import OrderController

from schemas.OrderSchema import (
    OrderCreate,
    OrderUpdate,
    OrderResponse,
)

router = APIRouter(
    prefix="/orders",
    tags=["Orders"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ------------------------
# Create Order
# ------------------------
@router.post(
    "/",
    response_model=OrderResponse,
)
def create_order(
    order: OrderCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return OrderController.create_order(
        db,
        order,
        current_user,
    )


# ------------------------
# Get All Orders
# ------------------------
@router.get(
    "/",
    response_model=list[OrderResponse],
)
def get_orders(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return OrderController.get_orders(
        db,
        current_user,
    )


# ------------------------
# Update Order
# ------------------------
@router.put(
    "/{order_id}",
    response_model=OrderResponse,
)
def update_order(
    order_id: int,
    order: OrderUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return OrderController.update_order(
        db,
        order_id,
        order,
        current_user,
    )


# ------------------------
# Delete Order
# ------------------------
@router.delete("/{order_id}")
def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return OrderController.delete_order(
        db,
        order_id,
        current_user,
    )