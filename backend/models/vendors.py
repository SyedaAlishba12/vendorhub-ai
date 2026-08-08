from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.sql import func
from models.base import Base


class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
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

    # Admin moderation & featured (Module 18 Part 3)
    is_hidden = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
