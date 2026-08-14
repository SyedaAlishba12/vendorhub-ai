from sqlalchemy import (
    Column,
    Integer,
    ForeignKey,
    DateTime,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from datetime import datetime

from database.base import Base


class RFQVendor(Base):
    __tablename__ = "rfq_vendors"

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

    vendor_id = Column(
        Integer,
        ForeignKey("vendors.id", ondelete="CASCADE"),
        nullable=False
    )

    status = Column(
        String(50),
        default="SENT",
        nullable=False
    )

    sent_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    responded_at = Column(
        DateTime,
        nullable=True
    )

    # RFQ relationship
    rfq = relationship(
        "RFQ",
        back_populates="vendor_assignments"
    )

    # Vendor relationship
    vendor = relationship(
        "Vendor",
        back_populates="rfq_assignments"
    )

    __table_args__ = (
        UniqueConstraint(
            "rfq_id",
            "vendor_id",
            name="uq_rfq_vendor"
        ),
    )