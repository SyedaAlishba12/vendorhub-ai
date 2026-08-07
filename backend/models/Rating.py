from sqlalchemy import Column, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from database.connection import Base

class RatingDB(Base):
    __tablename__ = "ratings"

    id = Column(String, primary_key=True)
    review_id = Column(String, ForeignKey("reviews.id", ondelete="CASCADE"), nullable=False)
    overall_rating = Column(Float, nullable=False)
    product_rating = Column(Float, nullable=False)
    communication_rating = Column(Float, nullable=False)
    delivery_rating = Column(Float, nullable=False)
    quality_rating = Column(Float, nullable=False)
    service_rating = Column(Float, nullable=False)

    review = relationship("ReviewDB", back_populates="ratings")