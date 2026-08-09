from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database.connection import Base

class Buyer(Base):
    __tablename__ = "buyers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    company_name = Column(String(255), nullable=False)
    company_size = Column(String(50))
    industry = Column(String(100))
    country = Column(String(100))
    total_spending = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="buyer_profile")
    dashboard = relationship("Dashboard", back_populates="buyer", uselist=False, cascade="all, delete-orphan")
    rfqs = relationship("RFQ", back_populates="buyer", cascade="all, delete-orphan")
    saved_vendors = relationship("SavedVendor", back_populates="buyer", cascade="all, delete-orphan")
    recent_searches = relationship("RecentSearch", back_populates="buyer", cascade="all, delete-orphan")

class Dashboard(Base):
    __tablename__ = "dashboards"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("buyers.id"), unique=True, nullable=False)
    active_rfqs_count = Column(Integer, default=0)
    pending_quotations_count = Column(Integer, default=0)
    total_orders = Column(Integer, default=0)
    total_vendors = Column(Integer, default=0)
    total_spending = Column(Float, default=0.0)
    monthly_spending = Column(Float, default=0.0)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    buyer = relationship("Buyer", back_populates="dashboard")