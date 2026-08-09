from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database.connection import Base

class Quotation(Base):
    __tablename__ = "quotations"

    id = Column(Integer, primary_key=True, index=True)
    rfq_id = Column(Integer, ForeignKey("rfqs.id"), nullable=False)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    price = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    delivery_days = Column(Integer)
    moq = Column(Integer)
    validity_days = Column(Integer)
    payment_terms = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)

    rfq = relationship("RFQ", back_populates="quotations")
    vendor = relationship("Vendor", back_populates="quotations")