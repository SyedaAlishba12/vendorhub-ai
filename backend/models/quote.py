from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from models.base import Base


class Quote(Base):
    __tablename__ = "quotations"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)

    rfq_reference = Column(String, nullable=True)  # e.g. "RFQ-9021" (placeholder until RFQ module exists)
    price = Column(Float, nullable=False)
    moq = Column(Integer, nullable=True)
    delivery_days = Column(Integer, nullable=True)
    payment_terms = Column(String, nullable=True)
    warranty_months = Column(Integer, nullable=True)
    notes = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    vendor = relationship("Vendor", backref="quotations")
    product = relationship("Product", backref="quotations")