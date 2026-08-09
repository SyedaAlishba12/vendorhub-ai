from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from database.connection import get_db
from controllers.documentController import DocumentController

# Standard Prefix aligned with Frontend Base URL
router = APIRouter(prefix="/api/documents", tags=["Documents"])

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    category: str = Form(...),
    uploaded_by: str = Form(...),
    db: AsyncSession = Depends(get_db)
):
    return await DocumentController.upload_document(db, file, category, uploaded_by)

@router.get("/")
async def get_documents(
    category: str = None, 
    search: str = None, 
    db: AsyncSession = Depends(get_db)
):
    return await DocumentController.get_documents(db, category, search)

@router.get("/{doc_id}")
async def get_document_by_id(doc_id: str, db: AsyncSession = Depends(get_db)):
    return await DocumentController.get_document_by_id(db, doc_id)

@router.get("/{doc_id}/download")
async def download_document(doc_id: str, db: AsyncSession = Depends(get_db)):
    return await DocumentController.download_document(db, doc_id)

@router.delete("/{doc_id}")
async def delete_document(doc_id: str, db: AsyncSession = Depends(get_db)):
    return await DocumentController.delete_document(db, doc_id)

@router.post("/{doc_id}/ocr")
async def process_ocr(doc_id: str, db: AsyncSession = Depends(get_db)):
    return await DocumentController.process_ocr(db, doc_id)

@router.post("/{doc_id}/summarize")
async def summarize_document(doc_id: str, db: AsyncSession = Depends(get_db)):
    return await DocumentController.summarize_document(db, doc_id)