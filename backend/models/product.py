from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    ForeignKey,
    DateTime
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from models.base import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    vendor_id = Column(
        Integer,
        ForeignKey("vendors.id"),
        nullable=False
    )

    category_id = Column(
        Integer,
        ForeignKey("product_categories.id"),
        nullable=True
    )

    name = Column(
        String,
        nullable=False
    )

    # Legacy free-text category
    category = Column(
        String,
        nullable=True
    )

    description = Column(
        String,
        nullable=True
    )

    price_min = Column(
        Float,
        nullable=True
    )

    price_max = Column(
        Float,
        nullable=True
    )

    moq = Column(
        Integer,
        nullable=True
    )

    lead_time_days = Column(
        Integer,
        nullable=True
    )

    stock_available = Column(
        Integer,
        nullable=True
    )

    # Admin moderation & featured
    is_hidden = Column(
        Boolean,
        default=False
    )

    is_featured = Column(
        Boolean,
        default=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        onupdate=func.now()
    )

    vendor = relationship(
        "Vendor",
        backref="products"
    )

    category_obj = relationship(
        "ProductCategory",
        backref="products"
    )