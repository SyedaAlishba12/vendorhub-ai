from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class QuoteBase(BaseModel):
    vendor_id: int
    product_id: Optional[int] = None
    rfq_reference: Optional[str] = None
    price: float
    moq: Optional[int] = None
    delivery_days: Optional[int] = None
    payment_terms: Optional[str] = None
    warranty_months: Optional[int] = None
    notes: Optional[str] = None


class QuoteCreate(QuoteBase):
    pass


class QuoteUpdate(BaseModel):
    price: Optional[float] = None
    moq: Optional[int] = None
    delivery_days: Optional[int] = None
    payment_terms: Optional[str] = None
    warranty_months: Optional[int] = None
    notes: Optional[str] = None


class QuoteResponse(QuoteBase):
    id: int
    created_at: datetime
    vendor_name: Optional[str] = None
    vendor_certification: Optional[str] = None
    product_name: Optional[str] = None

    class Config:
        from_attributes = True
