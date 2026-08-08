from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CategoryBase(BaseModel):
    name: str
    parent_id: Optional[int] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    parent_id: Optional[int] = None


class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class CertificationTypeBase(BaseModel):
    name: str
    description: Optional[str] = None


class CertificationTypeCreate(CertificationTypeBase):
    pass


class CertificationTypeResponse(CertificationTypeBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
