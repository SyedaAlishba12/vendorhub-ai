from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from datetime import datetime
from database.base import Base

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(String, primary_key=True, index=True)
    order_id = Column(String, ForeignKey("orders.id"))
    invoice_number = Column(String, unique=True, nullable=False)
    total_amount = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)