from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database.connection import Base

class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
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
    is_hidden = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="vendor_profile")
    quotations = relationship("Quotation", back_populates="vendor")
    saved_by_buyers = relationship("SavedVendor", back_populates="vendor")