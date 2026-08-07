from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    ForeignKey,
    DateTime,
)

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database.base import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)

    vendor_id = Column(
        Integer,
        ForeignKey("vendors.id"),
        nullable=False,
    )

    name = Column(
        String(200),
        nullable=False,
    )

    sku = Column(
        String(100),
        unique=True,
        nullable=False,
    )

    category = Column(String(100))

    description = Column(Text)

    price = Column(Float, nullable=False)

    quantity = Column(Integer, default=0)

    image = Column(String(255))

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    vendor = relationship("Vendor")