from sqlalchemy import Column, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from database.connection import Base

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(String, primary_key=True, index=True)
    order_id = Column(String, ForeignKey("orders.id"))
    product_name = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")