from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from database.connection import Base
import enum

class RFQStatus(str, enum.Enum):
    DRAFT = "draft"
    SENT = "sent"
    QUOTED = "quoted"
    CLOSED = "closed"
    CANCELLED = "cancelled"

class RFQ(Base):
    __tablename__ = "rfqs"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("buyers.id"), nullable=False)
    rfq_ref = Column(String(50), unique=True, nullable=False)
    product_name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit = Column(String(50))
    material = Column(String(255), nullable=True)
    budget = Column(Float, nullable=True)
    delivery_date = Column(DateTime)
    payment_terms = Column(String(100))
    shipping_method = Column(String(100))
    description = Column(Text, nullable=True)
    status = Column(Enum(RFQStatus), default=RFQStatus.DRAFT)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    sent_at = Column(DateTime, nullable=True)

    buyer = relationship("Buyer", back_populates="rfqs")
    quotations = relationship("Quotation", back_populates="rfq", cascade="all, delete-orphan")