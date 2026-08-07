from pydantic import BaseModel, EmailStr
from typing import Optional


class VendorCreate(BaseModel):
    business_name: str
    business_email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    business_type: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    logo: Optional[str] = None


class VendorUpdate(BaseModel):
    business_name: Optional[str] = None
    business_email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    business_type: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    logo: Optional[str] = None


class VendorResponse(BaseModel):
    id: int
    user_id: int
    business_name: str
    business_email: EmailStr
    phone: Optional[str]
    address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    country: Optional[str]
    postal_code: Optional[str]
    business_type: Optional[str]
    website: Optional[str]
    description: Optional[str]
    logo: Optional[str]

    model_config = {
        "from_attributes": True
    }