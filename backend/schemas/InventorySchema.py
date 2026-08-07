from pydantic import BaseModel
from typing import Optional
from pydantic import BaseModel



class InventoryCreate(BaseModel):
    product_id: int
    quantity: int
    minimum_stock: int = 5
    maximum_stock: int = 100


class InventoryUpdate(BaseModel):
    quantity: Optional[int] = None
    minimum_stock: Optional[int] = None
    maximum_stock: Optional[int] = None


class InventoryResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    minimum_stock: int
    maximum_stock: int

    model_config = {
        "from_attributes": True
    }