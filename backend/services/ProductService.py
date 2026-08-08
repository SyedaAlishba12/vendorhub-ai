from fastapi import HTTPException
from sqlalchemy.orm import Session

from models.product import Product
from models.Vendor import Vendor


class ProductService:

    @staticmethod
    def create_product(db: Session, product_data, current_user):

        vendor = (
            db.query(Vendor)
            .filter(Vendor.user_id == current_user.id)
            .first()
        )

        if not vendor:
            raise HTTPException(
                status_code=404,
                detail="Vendor profile not found."
            )

        existing = (
            db.query(Product)
            .filter(Product.sku == product_data.sku)
            .first()
        )

        if existing:
            raise HTTPException(
                status_code=400,
                detail="SKU already exists."
            )

        product = Product(
            vendor_id=vendor.id,
            name=product_data.name,
            sku=product_data.sku,
            category=product_data.category,
            description=product_data.description,
            price=product_data.price,
            quantity=product_data.quantity,
            image=product_data.image,
        )

        db.add(product)
        db.commit()
        db.refresh(product)

        return product

    @staticmethod
    def get_products(db: Session, current_user):

        vendor = (
            db.query(Vendor)
            .filter(Vendor.user_id == current_user.id)
            .first()
        )

        if not vendor:
            raise HTTPException(
                status_code=404,
                detail="Vendor profile not found."
            )

        return (
            db.query(Product)
            .filter(Product.vendor_id == vendor.id)
            .all()
        )

    @staticmethod
    def get_product(db: Session, product_id: int, current_user):

        vendor = (
            db.query(Vendor)
            .filter(Vendor.user_id == current_user.id)
            .first()
        )

        if not vendor:
            raise HTTPException(
                status_code=404,
                detail="Vendor profile not found."
            )

        product = (
            db.query(Product)
            .filter(
                Product.id == product_id,
                Product.vendor_id == vendor.id,
            )
            .first()
        )

        if not product:
            raise HTTPException(
                status_code=404,
                detail="Product not found."
            )

        return product

    @staticmethod
    def update_product(db: Session, product_id: int, product_data, current_user):

        product = ProductService.get_product(
            db,
            product_id,
            current_user,
        )

        update_data = product_data.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(product, key, value)

        db.commit()
        db.refresh(product)

        return product

    @staticmethod
    def delete_product(db: Session, product_id: int, current_user):

        product = ProductService.get_product(
            db,
            product_id,
            current_user,
        )

        db.delete(product)
        db.commit()

        return {
            "message": "Product deleted successfully."
        }
