from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from database.connection import AsyncSessionLocal
from schemas.category import (
    CategoryCreate, CategoryUpdate, CategoryResponse,
    CertificationTypeCreate, CertificationTypeResponse,
)
from controllers import category_controller

router = APIRouter(prefix="/admin/categories", tags=["Admin - Categories"])
cert_router = APIRouter(prefix="/admin/certification-types", tags=["Admin - Certification Types"])


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


# ---------- Categories ----------

@router.get("/", response_model=list[CategoryResponse])
async def list_categories(db: AsyncSession = Depends(get_db)):
    return await category_controller.get_all_categories(db)


@router.post("/", response_model=CategoryResponse)
async def create_category(category: CategoryCreate, db: AsyncSession = Depends(get_db)):
    try:
        return await category_controller.create_category(db, category)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(category_id: int, category: CategoryUpdate, db: AsyncSession = Depends(get_db)):
    try:
        updated = await category_controller.update_category(db, category_id, category)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not updated:
        raise HTTPException(status_code=404, detail="Category not found")
    return updated


@router.delete("/{category_id}")
async def delete_category(category_id: int, db: AsyncSession = Depends(get_db)):
    deleted = await category_controller.delete_category(db, category_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted successfully"}


# ---------- Certification Types ----------

@cert_router.get("/", response_model=list[CertificationTypeResponse])
async def list_certification_types(db: AsyncSession = Depends(get_db)):
    return await category_controller.get_all_certification_types(db)


@cert_router.post("/", response_model=CertificationTypeResponse)
async def create_certification_type(cert: CertificationTypeCreate, db: AsyncSession = Depends(get_db)):
    try:
        return await category_controller.create_certification_type(db, cert)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@cert_router.delete("/{cert_id}")
async def delete_certification_type(cert_id: int, db: AsyncSession = Depends(get_db)):
    deleted = await category_controller.delete_certification_type(db, cert_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Certification type not found")
    return {"message": "Certification type deleted successfully"}
