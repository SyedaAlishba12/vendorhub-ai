from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime


class VendorBase(BaseModel):
    company_name: str
    business_description: Optional[str] = None
    country: str
    industry: Optional[str] = None
    certification: Optional[str] = None
    production_capacity: Optional[str] = None
    export_countries: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    languages: Optional[str] = None


class VendorCreate(VendorBase):
    user_id: Optional[int] = None


class VendorUpdate(BaseModel):
    company_name: Optional[str] = None
    business_description: Optional[str] = None
    country: Optional[str] = None
    industry: Optional[str] = None
    certification: Optional[str] = None
    production_capacity: Optional[str] = None
    export_countries: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    languages: Optional[str] = None
    is_verified: Optional[bool] = None
    user_id: Optional[int] = None


class VendorResponse(VendorBase):
    id: int
    user_id: Optional[int] = None
    rating: float
    response_time_hours: Optional[int] = None
    is_verified: bool
    created_at: datetime
    match_score: Optional[float] = None
    match_breakdown: Optional[Dict[str, float]] = None
    is_hidden: bool = False
    is_featured: bool = False

    class Config:
        from_attributes = True
