from pydantic import BaseModel
from typing import Optional
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
    pass


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


class VendorResponse(VendorBase):
    id: int
    rating: float
    response_time_hours: Optional[int] = None
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True