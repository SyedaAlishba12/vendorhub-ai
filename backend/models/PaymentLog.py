from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.sql import func
import uuid

from database.base import Base

class PaymentLog(Base):
    __tablename__ = "payment_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    provider = Column(String, nullable=False, default="stripe")
    amount = Column(Float, nullable=False)
    currency = Column(String, nullable=False)
    status = Column(String, nullable=False)
    external_reference_id = Column(String, nullable=True) # Stripe PaymentIntent ID
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())