from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ProductBase(BaseModel):
    name: str
    category: Optional[str] = None
    description: Optional[str] = None
    price_min: Optional[float] = None
    price_max: Optional[float] = None
    moq: Optional[int] = None
    lead_time_days: Optional[int] = None
    stock_available: Optional[int] = None


class ProductCreate(ProductBase):
    vendor_id: int


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    price_min: Optional[float] = None
    price_max: Optional[float] = None
    moq: Optional[int] = None
    lead_time_days: Optional[int] = None
    stock_available: Optional[int] = None


class ProductResponse(ProductBase):
    id: int
    vendor_id: int
    created_at: datetime

    class Config:
        from_attributes = True