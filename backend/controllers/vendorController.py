from fastapi import HTTPException

from services.vendorService import VendorService


class VendorController:
    """
    Controller Layer for Vendor Management
    """

    @staticmethod
    def create_vendor(db, vendor_data, current_user):
        try:
            return VendorService.create_vendor(
                db,
                vendor_data,
                current_user,
            )
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=str(e),
            )

    @staticmethod
    def get_vendor(db, current_user):
        try:
            return VendorService.get_vendor(
                db,
                current_user,
            )
        except Exception as e:
            raise HTTPException(
                status_code=404,
                detail=str(e),
            )

    @staticmethod
    def update_vendor(db, vendor_data, current_user):
        try:
            return VendorService.update_vendor(
                db,
                vendor_data,
                current_user,
            )
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=str(e),
            )

    @staticmethod
    def delete_vendor(db, current_user):
        try:
            return VendorService.delete_vendor(
                db,
                current_user,
            )
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=str(e),
            )