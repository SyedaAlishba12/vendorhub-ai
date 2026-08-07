from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from database.connection import AsyncSessionLocal
from schemas.vendor import VendorCreate, VendorUpdate, VendorResponse
from controllers import vendor_controller

router = APIRouter(prefix="/vendors", tags=["Vendors"])


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


@router.get("/", response_model=list[VendorResponse])
async def list_vendors(
    country: str = None,
    industry: str = None,
    certification: str = None,
    min_rating: float = None,
    search: str = None,
    db: AsyncSession = Depends(get_db),
):
    return await vendor_controller.get_all_vendors(db, country, industry, certification, min_rating, search)


@router.get("/{vendor_id}", response_model=VendorResponse)
async def get_vendor(vendor_id: int, db: AsyncSession = Depends(get_db)):
    vendor = await vendor_controller.get_vendor_by_id(db, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor


@router.post("/", response_model=VendorResponse)
async def create_vendor(vendor: VendorCreate, db: AsyncSession = Depends(get_db)):
    return await vendor_controller.create_vendor(db, vendor)


@router.put("/{vendor_id}", response_model=VendorResponse)
async def update_vendor(vendor_id: int, vendor: VendorUpdate, db: AsyncSession = Depends(get_db)):
    updated = await vendor_controller.update_vendor(db, vendor_id, vendor)
    if not updated:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return updated


@router.delete("/{vendor_id}")
async def delete_vendor(vendor_id: int, db: AsyncSession = Depends(get_db)):
    deleted = await vendor_controller.delete_vendor(db, vendor_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return {"message": "Vendor deleted successfully"}