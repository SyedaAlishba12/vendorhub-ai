from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from database.connection import AsyncSessionLocal
from schemas.product import ProductCreate, ProductUpdate, ProductResponse
from controllers import product_controller

router = APIRouter(prefix="/products", tags=["Products"])


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


@router.get("/", response_model=list[ProductResponse])
async def list_products(
    category: str = None,
    min_price: float = None,
    max_price: float = None,
    max_moq: int = None,
    db: AsyncSession = Depends(get_db),
):
    return await product_controller.get_all_products(db, category, min_price, max_price, max_moq)


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    product = await product_controller.get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/", response_model=ProductResponse)
async def create_product(product: ProductCreate, db: AsyncSession = Depends(get_db)):
    return await product_controller.create_product(db, product)


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(product_id: int, product: ProductUpdate, db: AsyncSession = Depends(get_db)):
    updated = await product_controller.update_product(db, product_id, product)
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated


@router.delete("/{product_id}")
async def delete_product(product_id: int, db: AsyncSession = Depends(get_db)):
    deleted = await product_controller.delete_product(db, product_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}


@router.put("/{product_id}/moderate")
async def moderate_product(product_id: int, is_hidden: bool, db: AsyncSession = Depends(get_db)):
    updated = await product_controller.set_product_moderation(db, product_id, is_hidden)
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product moderation updated", "is_hidden": updated.is_hidden}


@router.put("/{product_id}/feature")
async def feature_product(product_id: int, is_featured: bool, db: AsyncSession = Depends(get_db)):
    updated = await product_controller.set_product_featured(db, product_id, is_featured)
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product featured status updated", "is_featured": updated.is_featured}
