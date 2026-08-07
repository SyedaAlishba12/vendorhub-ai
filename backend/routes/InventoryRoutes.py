from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import SessionLocal
from common.utils.auth import get_current_user

from controllers.InventoryController import InventoryController

from schemas.InventorySchema import (
    InventoryCreate,
    InventoryUpdate,
    InventoryResponse,
)

router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------------------------
# Create Inventory
# -------------------------

@router.post(
    "/",
    response_model=InventoryResponse,
)
def create_inventory(
    inventory: InventoryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return InventoryController.create_inventory(
        db,
        inventory,
    )


# -------------------------
# Get Inventory
# -------------------------

@router.get(
    "/",
    response_model=list[InventoryResponse],
)
def get_inventory(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return InventoryController.get_inventory(db)


# -------------------------
# Update Inventory
# -------------------------

@router.put(
    "/{inventory_id}",
    response_model=InventoryResponse,
)
def update_inventory(
    inventory_id: int,
    inventory: InventoryUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return InventoryController.update_inventory(
        db,
        inventory_id,
        inventory,
    )


# -------------------------
# Delete Inventory
# -------------------------

@router.delete("/{inventory_id}")
def delete_inventory(
    inventory_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return InventoryController.delete_inventory(
        db,
        inventory_id,
    )