from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from models.product import Product
from schemas.product import ProductCreate, ProductUpdate
from models.vendors import Vendor
from fastapi import HTTPException

def _attach_vendor_name(product):
    product.vendor_name = product.vendor.company_name if product.vendor else None
    return product

async def get_all_products(
    db: AsyncSession,
    category: str = None,
    min_price: float = None,
    max_price: float = None,
    max_moq: int = None,
    include_hidden: bool = False,
    vendor_id: int = None,
):
    query = select(Product).options(selectinload(Product.vendor))

    if not include_hidden:
        query = query.where(Product.is_hidden == False)  # noqa: E712

    if vendor_id is not None:
        query = query.where(Product.vendor_id == vendor_id)

    if category:
        query = query.where(Product.category.ilike(f"%{category}%"))

    if min_price is not None:
        query = query.where(Product.price_max >= min_price)

    if max_price is not None:
        query = query.where(Product.price_min <= max_price)

    if max_moq is not None:
        query = query.where(Product.moq <= max_moq)

    result = await db.execute(query)
    products = result.scalars().all()

    return [_attach_vendor_name(p) for p in products]


async def get_product_by_id(db: AsyncSession, product_id: int):
    query = select(Product).options(selectinload(Product.vendor)).where(Product.id == product_id)
    result = await db.execute(query)
    product = result.scalars().first()
    if product:
        _attach_vendor_name(product)
    return product


async def create_product(
    db: AsyncSession,
    product_data: ProductCreate,
    user_id: int
):
    # Find vendor profile belonging to logged-in user
    result = await db.execute(
        select(Vendor).where(Vendor.user_id == user_id)
    )

    vendor = result.scalars().first()

    if not vendor:
        raise HTTPException(
            status_code=404,
            detail="Vendor profile not found for this user."
        )

    # Create product with the vendor automatically assigned
    product_data_dict = product_data.dict()

    new_product = Product(
        **product_data_dict,
        vendor_id=vendor.id
    )

    db.add(new_product)

    await db.commit()

    await db.refresh(
        new_product,
        attribute_names=["vendor"]
    )

    return _attach_vendor_name(new_product)
async def update_product(
    db: AsyncSession,
    product_id: int,
    product_data: ProductUpdate,
    user_id: int
):
    # Find the product and its vendor
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.vendor))
        .join(Vendor, Product.vendor_id == Vendor.id)
        .where(
            Product.id == product_id,
            Vendor.user_id == user_id
        )
    )

    product = result.scalars().first()

    if not product:
        return None

    # Update only fields provided by the frontend
    for key, value in product_data.dict(exclude_unset=True).items():
        setattr(product, key, value)

    await db.commit()

    await db.refresh(
        product,
        attribute_names=["vendor"]
    )

    return _attach_vendor_name(product)

async def delete_product(
    db: AsyncSession,
    product_id: int,
    user_id: int
):
    result = await db.execute(
        select(Product)
        .join(Vendor, Product.vendor_id == Vendor.id)
        .where(
            Product.id == product_id,
            Vendor.user_id == user_id
        )
    )

    product = result.scalars().first()

    if not product:
        return None

    await db.delete(product)
    await db.commit()

    return product


async def set_product_moderation(db: AsyncSession, product_id: int, is_hidden: bool):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalars().first()
    if not product:
        return None
    product.is_hidden = is_hidden
    await db.commit()
    await db.refresh(product)
    return product


async def set_product_featured(db: AsyncSession, product_id: int, is_featured: bool):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalars().first()
    if not product:
        return None
    product.is_featured = is_featured
    await db.commit()
    await db.refresh(product)
    return product
async def get_vendor_products(
    db: AsyncSession,
    user_id: int
):
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.vendor))
        .join(Vendor, Product.vendor_id == Vendor.id)
        .where(Vendor.user_id == user_id)
    )

    products = result.scalars().all()

    return [
        _attach_vendor_name(product)
        for product in products
    ]