from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    email = Column(
        String,
        nullable=False,
        unique=True,
        index=True
    )
    phone = Column(
    String(30),
    nullable=True
)

    hashed_password = Column(
        String,
        nullable=False
    )

    role = Column(
        String,
        nullable=False,
        default="buyer"
    )

    is_active = Column(
        Boolean,
        default=True
    )
    email_verified = Column(
        Boolean,
        default=False,
        nullable=False
    )

    verification_token = Column(
        String,
        nullable=True,
        unique=True
    )

    verification_token_expires_at = Column(
        DateTime(timezone=True),
        nullable=True
    )
    two_factor_enabled = Column(
    Boolean,
    default=False,
    nullable=False,
    )

    two_factor_code = Column(
    String,
    nullable=True,
)

    two_factor_code_expires_at = Column(
    DateTime(timezone=True),
    nullable=True,
    )
    password_reset_token = Column(
    String,
    nullable=True,
    unique=True,
   )

    password_reset_token_expires_at = Column(
    DateTime(timezone=True),
    nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    buyer_profile = relationship(
    "Buyer",
    back_populates="user",
    uselist=False,
    cascade="all, delete-orphan",
    )

    vendor_profile = relationship(
    "Vendor",
    back_populates="user",
    uselist=False,
    cascade="all, delete-orphan",
    )