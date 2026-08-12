from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    ForeignKey,
    DateTime,
    Text,
    Enum
)
from sqlalchemy.orm import relationship
from datetime import datetime
from models.base import Base
import enum


class RFQStatus(str, enum.Enum):
    DRAFT = "draft"
    SENT = "sent"
    QUOTED = "quoted"
    CLOSED = "closed"
    CANCELLED = "cancelled"


class RFQ(Base):
    __tablename__ = "rfqs"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    buyer_id = Column(
        Integer,
        ForeignKey("buyers.id"),
        nullable=False
    )

    rfq_ref = Column(
        String(50),
        unique=True,
        nullable=False
    )

    product_name = Column(
        String(255),
        nullable=False
    )

    category = Column(
        String(100),
        nullable=False
    )

    quantity = Column(
        Integer,
        nullable=False
    )

    unit = Column(
        String(50),
        nullable=True
    )

    material = Column(
        String(255),
        nullable=True
    )

    budget = Column(
        Float,
        nullable=True
    )

    delivery_date = Column(
        DateTime,
        nullable=True
    )

    payment_terms = Column(
        String(100),
        nullable=True
    )

    shipping_method = Column(
        String(100),
        nullable=True
    )

    description = Column(
        Text,
        nullable=True
    )

    status = Column(
        Enum(RFQStatus),
        default=RFQStatus.DRAFT
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    sent_at = Column(
        DateTime,
        nullable=True
    )

    # Relationship with Buyer
    buyer = relationship(
        "Buyer",
        back_populates="rfqs"
    )

    # Relationship with RFQ Attachments
    attachments = relationship(
        "RFQAttachment",
        back_populates="rfq",
        cascade="all, delete-orphan"
    )


class RFQAttachment(Base):
    __tablename__ = "rfq_attachments"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    rfq_id = Column(
        Integer,
        ForeignKey("rfqs.id", ondelete="CASCADE"),
        nullable=False
    )

    file_name = Column(
        String(255),
        nullable=False
    )

    file_type = Column(
        String(50),
        nullable=True
    )

    file_url = Column(
        String(500),
        nullable=False
    )

    file_size_kb = Column(
        Float,
        nullable=True
    )

    # Relationship with RFQ
    rfq = relationship(
        "RFQ",
        back_populates="attachments"
    )

