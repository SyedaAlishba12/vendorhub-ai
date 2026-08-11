from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from models.category import ProductCategory, CertificationType
from schemas.category import CategoryCreate, CategoryUpdate, CertificationTypeCreate


# ---------- Categories ----------

async def get_all_categories(db: AsyncSession):
    result = await db.execute(select(ProductCategory))
    return result.scalars().all()


async def create_category(db: AsyncSession, data: CategoryCreate):
    new_cat = ProductCategory(**data.dict())
    db.add(new_cat)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise ValueError(f"A category named '{data.name}' already exists.")
    await db.refresh(new_cat)
    return new_cat


async def update_category(db: AsyncSession, category_id: int, data: CategoryUpdate):
    result = await db.execute(select(ProductCategory).where(ProductCategory.id == category_id))
    cat = result.scalars().first()
    if not cat:
        return None
    for key, value in data.dict(exclude_unset=True).items():
        setattr(cat, key, value)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise ValueError("A category with that name already exists.")
    await db.refresh(cat)
    return cat


async def delete_category(db: AsyncSession, category_id: int):
    result = await db.execute(select(ProductCategory).where(ProductCategory.id == category_id))
    cat = result.scalars().first()
    if not cat:
        return None
    await db.delete(cat)
    await db.commit()
    return cat


# ---------- Certification Types ----------

async def get_all_certification_types(db: AsyncSession):
    result = await db.execute(select(CertificationType))
    return result.scalars().all()


async def create_certification_type(db: AsyncSession, data: CertificationTypeCreate):
    new_cert = CertificationType(**data.dict())
    db.add(new_cert)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise ValueError(f"A certification type named '{data.name}' already exists.")
    await db.refresh(new_cert)
    return new_cert


async def delete_certification_type(db: AsyncSession, cert_id: int):
    result = await db.execute(select(CertificationType).where(CertificationType.id == cert_id))
    cert = result.scalars().first()
    if not cert:
        return None
    await db.delete(cert)
    await db.commit()
    return cert
