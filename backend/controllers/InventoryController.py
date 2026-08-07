from fastapi import HTTPException

from services.InventoryService import InventoryService


class InventoryController:

    @staticmethod
    def create_inventory(db, data):
        try:
            return InventoryService.create_inventory(db, data)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    def get_inventory(db):
        try:
            return InventoryService.get_inventory(db)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    def update_inventory(db, inventory_id, data):
        try:
            return InventoryService.update_inventory(
                db,
                inventory_id,
                data,
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    def delete_inventory(db, inventory_id):
        try:
            return InventoryService.delete_inventory(
                db,
                inventory_id,
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))