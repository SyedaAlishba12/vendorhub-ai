from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from database.connection import Base

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String, ForeignKey("orders.id"), nullable=False)
    product_name = Column(String)
    quantity = Column(Integer)
    price = Column(Float)

    order = relationship("Order", back_populates="items")