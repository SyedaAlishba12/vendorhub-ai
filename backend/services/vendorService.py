from sqlalchemy.orm import Session

from models.Vendor import Vendor


class VendorService:
    """
    Business Logic for Vendor Management
    """

    @staticmethod
    def create_vendor(db: Session, vendor_data, current_user):

        existing = (
            db.query(Vendor)
            .filter(Vendor.user_id == current_user.id)
            .first()
        )

        if existing:
            raise Exception("Vendor profile already exists.")

        vendor = Vendor(
            user_id=current_user.id,
            business_name=vendor_data.business_name,
            business_email=vendor_data.business_email,
            phone=vendor_data.phone,
            address=vendor_data.address,
            city=vendor_data.city,
            state=vendor_data.state,
            country=vendor_data.country,
            postal_code=vendor_data.postal_code,
            business_type=vendor_data.business_type,
            website=vendor_data.website,
            description=vendor_data.description,
            logo=vendor_data.logo,
        )

        db.add(vendor)
        db.commit()
        db.refresh(vendor)

        return vendor

    @staticmethod
    def get_vendor(db: Session, current_user):

        vendor = (
            db.query(Vendor)
            .filter(Vendor.user_id == current_user.id)
            .first()
        )

        if not vendor:
            raise Exception("Vendor profile not found.")

        return vendor

    @staticmethod
    def update_vendor(db: Session, vendor_data, current_user):

        vendor = (
            db.query(Vendor)
            .filter(Vendor.user_id == current_user.id)
            .first()
        )

        if not vendor:
            raise Exception("Vendor profile not found.")

        update_data = vendor_data.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(vendor, key, value)

        db.commit()
        db.refresh(vendor)

        return vendor

    @staticmethod
    def delete_vendor(db: Session, current_user):

        vendor = (
            db.query(Vendor)
            .filter(Vendor.user_id == current_user.id)
            .first()
        )

        if not vendor:
            raise Exception("Vendor profile not found.")

        db.delete(vendor)
        db.commit()

        return {
            "message": "Vendor profile deleted successfully."
        }