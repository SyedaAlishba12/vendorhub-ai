from sqlalchemy import Column, String, Float, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database.connection import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True, index=True)
    buyer_id = Column(String, nullable=False)
    vendor_id = Column(String, nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String, default="PROCESSING")
    payment_status = Column(String, default="PAID")
    created_at = Column(DateTime, default=datetime.utcnow)  # <--- Clean fix: Offset-naive UTC for PostgreSQL
    
    items = relationship("OrderItem", back_populates="order")
    shipment = relationship("Shipment", back_populates="order", uselist=False)
    
    has_dispute = Column(Boolean, default=False)
    cancellation_reason = Column(String, nullable=True)
    dispute_reason = Column(String, nullable=True)