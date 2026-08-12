from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from database.base import Base


class ProductCategory(Base):
    __tablename__ = "product_categories"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(
        String,
        nullable=False,
        unique=True
    )

    parent_id = Column(
        Integer,
        ForeignKey("product_categories.id"),
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    children = relationship(
        "ProductCategory",
        backref="parent",
        remote_side=[id]
    )


class CertificationType(Base):
    __tablename__ = "certification_types"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(
        String,
        nullable=False,
        unique=True
    )

    description = Column(
        String,
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )