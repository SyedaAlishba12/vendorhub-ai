from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database.connection import Base

class RecentSearch(Base):
    __tablename__ = "recent_searches"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("buyers.id"), nullable=False)
    query = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    buyer = relationship("Buyer", back_populates="recent_searches")