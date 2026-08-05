from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.connection import SessionLocal
from schemas.vendor import VendorCreate, VendorUpdate, VendorResponse
from controllers import vendor_controller

router = APIRouter(prefix="/vendors", tags=["Vendors"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[VendorResponse])
def list_vendors(country: str = None, industry: str = None, db: Session = Depends(get_db)):
    return vendor_controller.get_all_vendors(db, country, industry)


@router.get("/{vendor_id}", response_model=VendorResponse)
def get_vendor(vendor_id: int, db: Session = Depends(get_db)):
    vendor = vendor_controller.get_vendor_by_id(db, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor


@router.post("/", response_model=VendorResponse)
def create_vendor(vendor: VendorCreate, db: Session = Depends(get_db)):
    return vendor_controller.create_vendor(db, vendor)


@router.put("/{vendor_id}", response_model=VendorResponse)
def update_vendor(vendor_id: int, vendor: VendorUpdate, db: Session = Depends(get_db)):
    updated = vendor_controller.update_vendor(db, vendor_id, vendor)
    if not updated:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return updated


@router.delete("/{vendor_id}")
def delete_vendor(vendor_id: int, db: Session = Depends(get_db)):
    deleted = vendor_controller.delete_vendor(db, vendor_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return {"message": "Vendor deleted successfully"}