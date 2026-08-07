from fastapi import HTTPException

from services.ProductService import ProductService


class ProductController:

    @staticmethod
    def create_product(db, product, current_user):
        try:
            return ProductService.create_product(
                db,
                product,
                current_user,
            )
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=str(e),
            )

    @staticmethod
    def get_products(db, current_user):
        try:
            return ProductService.get_products(
                db,
                current_user,
            )
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=str(e),
            )

    @staticmethod
    def get_product(db, product_id, current_user):
        try:
            return ProductService.get_product(
                db,
                product_id,
                current_user,
            )
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=str(e),
            )

    @staticmethod
    def update_product(db, product_id, product, current_user):
        try:
            return ProductService.update_product(
                db,
                product_id,
                product,
                current_user,
            )
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=str(e),
            )

    @staticmethod
    def delete_product(db, product_id, current_user):
        try:
            return ProductService.delete_product(
                db,
                product_id,
                current_user,
            )
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=str(e),
            )