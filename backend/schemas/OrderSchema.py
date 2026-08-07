from pydantic import BaseModel
from typing import Optional


class OrderCreate(BaseModel):
    product_id: int
    quantity: int


class OrderUpdate(BaseModel):
    status: Optional[str] = None


class OrderResponse(BaseModel):
    id: int
    vendor_id: int
    product_id: int
    quantity: int
    total_price: float
    status: str

    model_config = {
        "from_attributes": True
    }