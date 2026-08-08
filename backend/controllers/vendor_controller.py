from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models.vendors import Vendor
from schemas.vendor import VendorCreate, VendorUpdate
from services.matching import calculate_match_breakdown


def _attach_score(vendor):
    breakdown = calculate_match_breakdown(vendor)
    vendor.match_score = breakdown["total"]
    vendor.match_breakdown = breakdown
    return vendor


async def get_all_vendors(
    db: AsyncSession,
    country: str = None,
    industry: str = None,
    certification: str = None,
    min_rating: float = None,
    search: str = None,
    include_hidden: bool = False,
):
    query = select(Vendor)

    if not include_hidden:
        query = query.where(Vendor.is_hidden == False)  # noqa: E712
    if country:
        query = query.where(Vendor.country.ilike(f"%{country}%"))
    if industry:
        query = query.where(Vendor.industry.ilike(f"%{industry}%"))
    if certification:
        query = query.where(Vendor.certification.ilike(f"%{certification}%"))
    if min_rating is not None:
        query = query.where(Vendor.rating >= min_rating)
    if search:
        query = query.where(Vendor.company_name.ilike(f"%{search}%"))

    result = await db.execute(query)
    vendors = result.scalars().all()
    return [_attach_score(v) for v in vendors]


async def get_vendor_by_id(db: AsyncSession, vendor_id: int):
    result = await db.execute(select(Vendor).where(Vendor.id == vendor_id))
    vendor = result.scalars().first()
    if vendor:
        _attach_score(vendor)
    return vendor


async def create_vendor(db: AsyncSession, vendor_data: VendorCreate):
    new_vendor = Vendor(**vendor_data.dict())
    db.add(new_vendor)
    await db.commit()
    await db.refresh(new_vendor)
    return _attach_score(new_vendor)


async def update_vendor(db: AsyncSession, vendor_id: int, vendor_data: VendorUpdate):
    result = await db.execute(select(Vendor).where(Vendor.id == vendor_id))
    vendor = result.scalars().first()
    if not vendor:
        return None
    for key, value in vendor_data.dict(exclude_unset=True).items():
        setattr(vendor, key, value)
    await db.commit()
    await db.refresh(vendor)
    return _attach_score(vendor)


async def delete_vendor(db: AsyncSession, vendor_id: int):
    result = await db.execute(select(Vendor).where(Vendor.id == vendor_id))
    vendor = result.scalars().first()
    if not vendor:
        return None
    await db.delete(vendor)
    await db.commit()
    return vendor


async def set_vendor_moderation(db: AsyncSession, vendor_id: int, is_hidden: bool):
    result = await db.execute(select(Vendor).where(Vendor.id == vendor_id))
    vendor = result.scalars().first()
    if not vendor:
        return None
    vendor.is_hidden = is_hidden
    await db.commit()
    await db.refresh(vendor)
    return vendor


async def set_vendor_featured(db: AsyncSession, vendor_id: int, is_featured: bool):
    result = await db.execute(select(Vendor).where(Vendor.id == vendor_id))
    vendor = result.scalars().first()
    if not vendor:
        return None
    vendor.is_featured = is_featured
    await db.commit()
    await db.refresh(vendor)
    return vendor
