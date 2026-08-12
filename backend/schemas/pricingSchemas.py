from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PricingPlanCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    price: float
    annual_price: Optional[float] = None
    max_rfqs: int = -1
    max_saved_vendors: int = -1
    ai_recommendations: bool = False
    priority_support: bool = False
    advanced_analytics: bool = False
    api_access: bool = False
    is_active: bool = True
    order: int = 0

class PricingPlanUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    annual_price: Optional[float] = None
    max_rfqs: Optional[int] = None
    max_saved_vendors: Optional[int] = None
    ai_recommendations: Optional[bool] = None
    priority_support: Optional[bool] = None
    advanced_analytics: Optional[bool] = None
    api_access: Optional[bool] = None
    is_active: Optional[bool] = None
    order: Optional[int] = None

class SubscriptionResponse(BaseModel):
    id: int
    user_id: int
    plan_id: int
    status: str
    start_date: datetime
    end_date: Optional[datetime]
    renewal_date: Optional[datetime]
    is_trial: bool
    trial_ends_at: Optional[datetime]
    plan: Optional[PricingPlanCreate] = None

    class Config:
        from_attributes = True