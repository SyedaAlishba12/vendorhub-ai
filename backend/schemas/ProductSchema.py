from pydantic import BaseModel
from typing import Optional


class ProductCreate(BaseModel):
    name: str
    sku: str
    category: Optional[str] = None
    description: Optional[str] = None
    price: float
    quantity: int = 0
    image: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
    image: Optional[str] = None


class ProductResponse(BaseModel):
    id: int
    vendor_id: int
    name: str
    sku: str
    category: Optional[str]
    description: Optional[str]
    price: float
    quantity: int
    image: Optional[str]

    model_config = {
        "from_attributes": True
    }