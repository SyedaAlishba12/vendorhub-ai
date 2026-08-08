from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from sqlalchemy import Column, String, Float, DateTime, Text
from database.connection import Base  # Apne connection path ke hisab se update kar lein

# 1. SQLAlchemy Model (Database Table Structure)
class DocumentDB(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_size_kb = Column(Float, nullable=False)
    file_url = Column(String, nullable=False)
    uploaded_by = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    ocr_text = Column(Text, nullable=True)
    ai_summary = Column(Text, nullable=True)

# 2. Pydantic Schemas (API Data Validation)
class DocumentBase(BaseModel):
    title: str = Field(..., example="Vendor_ISO_Certificate.pdf")
    category: str = Field(..., example="Certifications")
    file_type: str = Field(..., example="pdf")
    file_size_kb: float
    file_url: str
    uploaded_by: str = Field(..., example="usr_123")

class DocumentCreate(DocumentBase):
    pass

class DocumentResponse(DocumentBase):
    id: str
    uploaded_at: datetime
    ocr_text: Optional[str] = None
    ai_summary: Optional[str] = None

    class Config:
        from_attributes = True