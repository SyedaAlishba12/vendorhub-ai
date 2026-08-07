from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import SessionLocal
from common.utils.auth import get_current_user

from controllers.vendorController import VendorController

from schemas.vendorSchema import (
    VendorCreate,
    VendorUpdate,
    VendorResponse,
)

router = APIRouter(
    prefix="/vendor",
    tags=["Vendor"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ----------------------------
# Create Vendor Profile
# ----------------------------
@router.post(
    "/",
    response_model=VendorResponse,
)
def create_vendor(
    vendor: VendorCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return VendorController.create_vendor(
        db,
        vendor,
        current_user,
    )


# ----------------------------
# Get Vendor Profile
# ----------------------------
@router.get(
    "/",
    response_model=VendorResponse,
)
def get_vendor(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return VendorController.get_vendor(
        db,
        current_user,
    )


# ----------------------------
# Update Vendor Profile
# ----------------------------
@router.put(
    "/",
    response_model=VendorResponse,
)
def update_vendor(
    vendor: VendorUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return VendorController.update_vendor(
        db,
        vendor,
        current_user,
    )


# ----------------------------
# Delete Vendor Profile
# ----------------------------
@router.delete("/")
def delete_vendor(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return VendorController.delete_vendor(
        db,
        current_user,
    )