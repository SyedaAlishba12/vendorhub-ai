from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import SessionLocal
from common.utils.auth import get_current_user

from controllers.ProductController import ProductController

from schemas.ProductSchema import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
)

router = APIRouter(
    prefix="/products",
    tags=["Products"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ------------------------
# Create Product
# ------------------------

@router.post(
    "/",
    response_model=ProductResponse,
)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return ProductController.create_product(
        db,
        product,
        current_user,
    )


# ------------------------
# Get All Products
# ------------------------

@router.get(
    "/",
    response_model=list[ProductResponse],
)
def get_products(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return ProductController.get_products(
        db,
        current_user,
    )


# ------------------------
# Get Single Product
# ------------------------

@router.get(
    "/{product_id}",
    response_model=ProductResponse,
)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return ProductController.get_product(
        db,
        product_id,
        current_user,
    )


# ------------------------
# Update Product
# ------------------------

@router.put(
    "/{product_id}",
    response_model=ProductResponse,
)
def update_product(
    product_id: int,
    product: ProductUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return ProductController.update_product(
        db,
        product_id,
        product,
        current_user,
    )


# ------------------------
# Delete Product
# ------------------------

@router.delete(
    "/{product_id}",
)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return ProductController.delete_product(
        db,
        product_id,
        current_user,
    )