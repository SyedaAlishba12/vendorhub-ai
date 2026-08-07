from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models.product import Product
from schemas.product import ProductCreate, ProductUpdate


async def get_all_products(db: AsyncSession, category: str = None, min_price: float = None, max_price: float = None):
    query = select(Product)
    if category:
        query = query.where(Product.category == category)
    if min_price is not None:
        query = query.where(Product.price_max >= min_price)
    if max_price is not None:
        query = query.where(Product.price_min <= max_price)
    result = await db.execute(query)
    return result.scalars().all()


async def get_product_by_id(db: AsyncSession, product_id: int):
    result = await db.execute(select(Product).where(Product.id == product_id))
    return result.scalars().first()


async def create_product(db: AsyncSession, product_data: ProductCreate):
    new_product = Product(**product_data.dict())
    db.add(new_product)
    await db.commit()
    await db.refresh(new_product)
    return new_product


async def update_product(db: AsyncSession, product_id: int, product_data: ProductUpdate):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalars().first()
    if not product:
        return None
    for key, value in product_data.dict(exclude_unset=True).items():
        setattr(product, key, value)
    await db.commit()
    await db.refresh(product)
    return product


async def delete_product(db: AsyncSession, product_id: int):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalars().first()
    if not product:
        return None
    await db.delete(product)
    await db.commit()
    return product
