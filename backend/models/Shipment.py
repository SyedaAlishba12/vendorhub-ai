from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database.connection import Base

class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String, ForeignKey("orders.id"), nullable=False)
    carrier = Column(String)
    tracking_number = Column(String)

    order = relationship("Order", back_populates="shipment")