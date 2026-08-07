from fastapi import HTTPException
from sqlalchemy.orm import Session

from models.Inventory import Inventory
from models.Product import Product


class InventoryService:

    @staticmethod
    def create_inventory(db: Session, data):

        # Check product exists
        product = (
            db.query(Product)
            .filter(Product.id == data.product_id)
            .first()
        )

        if not product:
            raise HTTPException(
                status_code=404,
                detail="Product not found."
            )

        # Prevent duplicate inventory for the same product
        existing = (
            db.query(Inventory)
            .filter(Inventory.product_id == data.product_id)
            .first()
        )

        if existing:
            raise HTTPException(
                status_code=400,
                detail="Inventory already exists for this product."
            )

        inventory = Inventory(
            product_id=data.product_id,
            quantity=data.quantity,
            minimum_stock=data.minimum_stock,
            maximum_stock=data.maximum_stock,
        )

        db.add(inventory)
        db.commit()
        db.refresh(inventory)

        return inventory

    @staticmethod
    def get_inventory(db: Session):
        return db.query(Inventory).all()

    @staticmethod
    def update_inventory(db: Session, inventory_id: int, data):

        inventory = (
            db.query(Inventory)
            .filter(Inventory.id == inventory_id)
            .first()
        )

        if not inventory:
            raise HTTPException(
                status_code=404,
                detail="Inventory not found."
            )

        # Update only provided fields
        update_data = data.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(inventory, key, value)

        db.commit()
        db.refresh(inventory)

        return inventory

    @staticmethod
    def delete_inventory(db: Session, inventory_id: int):

        inventory = (
            db.query(Inventory)
            .filter(Inventory.id == inventory_id)
            .first()
        )

        if not inventory:
            raise HTTPException(
                status_code=404,
                detail="Inventory not found."
            )

        db.delete(inventory)
        db.commit()

        return {
            "message": "Inventory deleted successfully."
        }