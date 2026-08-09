from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class RFQBase(BaseModel):
    product_name: str
    category: str
    quantity: int
    unit: str = "pcs"
    material: Optional[str] = None
    budget: Optional[float] = None
    delivery_date: Optional[datetime] = None
    payment_terms: Optional[str] = None
    shipping_method: Optional[str] = None
    description: Optional[str] = None

class RFQCreate(RFQBase):
    pass

class RFQUpdate(RFQBase):
    status: Optional[str] = None

class RFQResponse(RFQBase):
    id: int
    buyer_id: int
    rfq_ref: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # or orm_mode = True for older Pydantic