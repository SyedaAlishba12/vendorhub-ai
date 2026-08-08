from sqlalchemy import Column, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database.connection import Base

class ReviewReportDB(Base):
    __tablename__ = "review_reports"

    id = Column(String, primary_key=True)
    review_id = Column(String, ForeignKey("reviews.id", ondelete="CASCADE"), nullable=False)
    reported_by = Column(String, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String, default="PENDING")  # PENDING, RESOLVED, DISMISSED
    created_at = Column(DateTime, default=datetime.utcnow)  

    review = relationship("ReviewDB", back_populates="reports")