from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database.connection import Base

class SavedVendor(Base):
    __tablename__ = "saved_vendors"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("buyers.id"), nullable=False)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    saved_at = Column(DateTime, default=datetime.utcnow)

    buyer = relationship("Buyer", back_populates="saved_vendors")
    vendor = relationship("Vendor", back_populates="saved_by_buyers")