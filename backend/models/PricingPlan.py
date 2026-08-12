from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from models.base import Base

class PricingPlan(Base):
    __tablename__ = "pricing_plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(50), unique=True, nullable=False)
    description = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    annual_price = Column(Float, nullable=True)
    max_rfqs = Column(Integer, default=-1)  # -1 = unlimited
    max_saved_vendors = Column(Integer, default=-1)
    ai_recommendations = Column(Boolean, default=False)
    priority_support = Column(Boolean, default=False)
    advanced_analytics = Column(Boolean, default=False)
    api_access = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    subscriptions = relationship("Subscription", back_populates="plan")