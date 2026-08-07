from pydantic import BaseModel


class DashboardResponse(BaseModel):
    total_products: int
    total_orders: int
    total_revenue: float
    total_inventory: int
    pending_orders: int
    completed_orders: int