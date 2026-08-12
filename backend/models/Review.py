from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database.base import Base

# Relationship string validation fix ke liye
import models.Rating 
import models.ReviewReport

class ReviewDB(Base):
    __tablename__ = "reviews"

    id = Column(String, primary_key=True)  # primary_base removed
    vendor_id = Column(String, nullable=False)
    buyer_id = Column(String, nullable=False)
    buyer_name = Column(String, nullable=False)
    product_id = Column(String, nullable=True)
    comment = Column(Text, nullable=False)
    helpful_votes = Column(Integer, default=0)
    is_reported = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)  

    # Relationships
    ratings = relationship("RatingDB", back_populates="review", uselist=False, cascade="all, delete-orphan")
    reports = relationship("ReviewReportDB", back_populates="review", cascade="all, delete-orphan")