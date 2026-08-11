from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from models.base import Base


class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)

    # Links this vendor listing to a User account.
    # Nullable because demo/seeded vendors aren't tied
    # to a real registered account yet.
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    company_name = Column(String, nullable=False)
    business_description = Column(String, nullable=True)
    country = Column(String, nullable=False)
    industry = Column(String, nullable=True)

    certification = Column(String, nullable=True)
    production_capacity = Column(String, nullable=True)
    export_countries = Column(String, nullable=True)

    contact_email = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    languages = Column(String, nullable=True)

    rating = Column(Float, default=0.0)
    response_time_hours = Column(Integer, nullable=True)
    is_verified = Column(Boolean, default=False)

    # Admin moderation & featured
    is_hidden = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        onupdate=func.now()
    )

    # Buyer module relationship:
    # allows Vendor -> SavedVendor records
    saved_by_buyers = relationship(
        "SavedVendor",
        back_populates="vendor"
    )