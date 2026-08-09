"""
models/RiskReport.py — SQLAlchemy ORM model for AI-generated vendor risk reports.

Score convention (documented here and enforced throughout):
    HIGHER score = SAFER / LOWER RISK.
    score of 100 = completely safe.
    score of 0   = maximum risk.

This aligns with how procurement teams read credit/trust scores: a vendor
with a 90 is safer than a vendor with a 30.  The AI recommendation text
is generated based on this convention and should reflect it.
"""

import enum

from sqlalchemy import Column, DateTime, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import ARRAY, JSON, UUID
from sqlalchemy.sql import func

from database.base import Base


# ---------------------------------------------------------------------------
# CertificationStatus enum
# ---------------------------------------------------------------------------

class CertificationStatus(str, enum.Enum):
    """
    Certification state of the vendor's credentials.

    - verified:   All certifications are current and confirmed.
    - pending:    Certifications submitted but not yet validated.
    - expired:    Certifications were valid but have lapsed.
    - unverified: No certifications on file.
    """
    verified   = "verified"
    pending    = "pending"
    expired    = "expired"
    unverified = "unverified"


# ---------------------------------------------------------------------------
# RiskReport model
# ---------------------------------------------------------------------------

class RiskReport(Base):
    """
    A single AI-generated risk assessment snapshot for a vendor.

    A new row is created each time POST /api/risk/analyze is called for the
    same vendor — reports are immutable history entries, never overwritten.
    Use GET /api/risk/{vendorId} for the most-recent report, or
    GET /api/risk/history?vendorId= for the full audit trail.
    """

    __tablename__ = "risk_reports"

    # ------------------------------------------------------------------
    # Primary key
    # ------------------------------------------------------------------
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
        nullable=False,
    )

    # ------------------------------------------------------------------
    # Vendor reference
    # A FK to a vendors table will be added when that module is built.
    # For v1 the vendor_id is accepted from the request body.
    # ------------------------------------------------------------------
    vendor_id = Column(
        UUID(as_uuid=True),
        nullable=False,
        index=True,
        comment="UUID of the vendor being assessed.",
    )

    # ------------------------------------------------------------------
    # Individual risk scores  (0-100, HIGHER = SAFER — see module docstring)
    # ------------------------------------------------------------------
    financial_risk_score = Column(
        Integer,
        nullable=False,
        comment=(
            "Financial health score 0-100. "
            "100 = no financial risk. "
            "Computed from business age, transaction history proxies, etc."
        ),
    )

    delivery_risk_score = Column(
        Integer,
        nullable=False,
        comment=(
            "Delivery reliability score 0-100. "
            "100 = perfectly reliable. "
            "Computed from certification status and fulfillment history proxies."
        ),
    )

    # ------------------------------------------------------------------
    # Fraud indicators — PostgreSQL ARRAY of short flag strings
    # e.g. ["business_age_under_6_months", "no_certifications_on_file"]
    # ------------------------------------------------------------------
    fraud_indicators = Column(
        ARRAY(Text),
        nullable=False,
        server_default=text("'{}'::text[]"),
        comment=(
            "Rule-based fraud / red-flag strings detected during scoring. "
            "Empty array means no flags raised."
        ),
    )

    # ------------------------------------------------------------------
    # Certification status
    # ------------------------------------------------------------------
    certification_status = Column(
        String(20),
        nullable=False,
        default=CertificationStatus.unverified.value,
        server_default="unverified",
        comment="Vendor certification state at time of assessment.",
    )

    # ------------------------------------------------------------------
    # Business age
    # ------------------------------------------------------------------
    business_age_years = Column(
        Integer,
        nullable=True,
        comment="How long the vendor has been in business. NULL = unknown.",
    )

    # ------------------------------------------------------------------
    # Composite score
    # Weighted combination: 50% financial, 50% delivery (v1 weights).
    # Weights are applied in riskController.compute_scores().
    # ------------------------------------------------------------------
    overall_risk_score = Column(
        Integer,
        nullable=False,
        comment=(
            "Composite risk score 0-100. "
            "100 = lowest risk (safest vendor). "
            "Computed as weighted average of financial + delivery scores."
        ),
    )

    # ------------------------------------------------------------------
    # AI-generated recommendation text
    # ------------------------------------------------------------------
    ai_recommendation = Column(
        Text,
        nullable=False,
        default="",
        server_default="''",
        comment=(
            "Human-readable risk summary generated by the AI model. "
            "Falls back to a rule-based string if the AI API call fails."
        ),
    )

    # ------------------------------------------------------------------
    # Timestamps
    # ------------------------------------------------------------------
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,  # supports ORDER BY created_at DESC for history queries
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
