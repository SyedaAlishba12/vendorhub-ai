from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database.base import Base

class BillingHistory(Base):
    __tablename__ = "billing_history"

    id = Column(Integer, primary_key=True, index=True)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    status = Column(String, default="success")
    payment_method = Column(String)
    billing_date = Column(DateTime, default=datetime.utcnow)
    description = Column(String, nullable=True)

    subscription = relationship("Subscription", back_populates="billing_history")