from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class RecentRFQResponse(BaseModel):
    id: int
    rfq_ref: str
    product_name: str
    category: str
    quantity: int
    unit: str
    status: str
    ai_score: Optional[float] = None
    target_region: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class DashboardStatsResponse(BaseModel):
    active_rfqs: int
    pending_quotations: int
    total_orders: int
    total_vendors: int
    total_spending: float
    monthly_spending: float

class DashboardResponse(BaseModel):
    stats: DashboardStatsResponse
    recent_rfqs: List[RecentRFQResponse]

    class Config:
        from_attributes = True