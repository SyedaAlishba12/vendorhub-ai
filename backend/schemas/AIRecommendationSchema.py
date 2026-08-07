from pydantic import BaseModel


class AIRecommendationResponse(BaseModel):
    product_id: int
    product_name: str
    category: str
    price: float
    score: float

    model_config = {
        "from_attributes": True
    }