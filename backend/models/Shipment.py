from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from database.base import Base

class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(String, primary_key=True, index=True)
    order_id = Column(String, ForeignKey("orders.id"))
    courier = Column(String, default="DHL Express")
    tracking_number = Column(String, nullable=False)
    status = Column(String, default="In Transit")
    estimated_delivery = Column(String, nullable=False)

    order = relationship("Order", back_populates="shipment")