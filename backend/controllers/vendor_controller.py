from sqlalchemy.orm import Session
from models.vendors import Vendor
from schemas.vendor import VendorCreate, VendorUpdate


def get_all_vendors(db: Session, country: str = None, industry: str = None):
    query = db.query(Vendor)
    if country:
        query = query.filter(Vendor.country == country)
    if industry:
        query = query.filter(Vendor.industry == industry)
    return query.all()


def get_vendor_by_id(db: Session, vendor_id: int):
    return db.query(Vendor).filter(Vendor.id == vendor_id).first()


def create_vendor(db: Session, vendor_data: VendorCreate):
    new_vendor = Vendor(**vendor_data.dict())
    db.add(new_vendor)
    db.commit()
    db.refresh(new_vendor)
    return new_vendor


def update_vendor(db: Session, vendor_id: int, vendor_data: VendorUpdate):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        return None
    for key, value in vendor_data.dict(exclude_unset=True).items():
        setattr(vendor, key, value)
    db.commit()
    db.refresh(vendor)
    return vendor


def delete_vendor(db: Session, vendor_id: int):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        return None
    db.delete(vendor)
    db.commit()
    return vendor