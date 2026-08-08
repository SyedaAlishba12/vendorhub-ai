import os
import uuid
import pypdf
from datetime import datetime, timezone
from fastapi import HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from models.Document import DocumentDB

# Main upload directory
UPLOAD_DIR = os.path.join(os.getcwd(), "uploaded_documents")
os.makedirs(UPLOAD_DIR, exist_ok=True)

class DocumentController:

    @staticmethod
    def _resolve_file_path(file_url: str) -> str:
        """
        Helper method to resolve absolute paths for both manual uploads
        and seed document entries.
        """
        if not file_url:
            return ""

        # If absolute path already exists
        if os.path.isabs(file_url) and os.path.exists(file_url):
            return file_url

        # Check in primary UPLOAD_DIR (uploaded_documents)
        filename = os.path.basename(file_url)
        path1 = os.path.join(UPLOAD_DIR, filename)
        if os.path.exists(path1):
            return path1

        # Check in fallback uploads directory (for seed files)
        path2 = os.path.join(os.getcwd(), "uploads", filename)
        if os.path.exists(path2):
            return path2

        # Return default expected path if none existing yet
        return path1

    @staticmethod
    def _extract_real_text(file_path: str) -> str:
        resolved_path = DocumentController._resolve_file_path(file_path)
        if not os.path.exists(resolved_path):
            return ""
        
        ext = os.path.splitext(resolved_path)[1].lower()
        extracted_text = ""

        try:
            if ext == ".pdf":
                reader = pypdf.PdfReader(resolved_path)
                for page in reader.pages:
                    text = page.extract_text()
                    if text:
                        extracted_text += text + "\n"
            else:
                with open(resolved_path, "r", encoding="utf-8", errors="ignore") as f:
                    extracted_text = f.read()
        except Exception as e:
            print(f"Extraction error: {e}")
            return ""

        return extracted_text.strip()

    @staticmethod
    async def upload_document(db: AsyncSession, file, category: str, uploaded_by: str):
        allowed_extensions = ["pdf", "png", "jpg", "jpeg", "docx", "txt"]
        ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
        
        if ext not in allowed_extensions:
            raise HTTPException(status_code=400, detail="Invalid file type. Only PDF, PNG, JPG, DOCX, TXT allowed.")

        doc_id = f"DOC-{uuid.uuid4().hex[:8].upper()}"
        file_path = os.path.join(UPLOAD_DIR, f"{doc_id}_{file.filename}")

        # Save uploaded binary stream to local disk
        contents = await file.read()
        file_size_kb = round(len(contents) / 1024, 2)

        with open(file_path, "wb") as f:
            f.write(contents)

        new_doc = DocumentDB(
            id=doc_id,
            title=file.filename,
            category=category,
            file_type=ext,
            file_size_kb=file_size_kb,
            file_url=file_path,
            uploaded_by=uploaded_by,
            uploaded_at=datetime.utcnow(),
            ocr_text=None,
            ai_summary=None
        )
        
        db.add(new_doc)
        await db.commit()
        await db.refresh(new_doc)
        return {"message": "Document uploaded successfully", "document": new_doc}

    @staticmethod
    async def get_documents(db: AsyncSession, category: str = None, search: str = None):
        stmt = select(DocumentDB)
        
        if category and category.upper() != "ALL":
            stmt = stmt.where(DocumentDB.category.ilike(category))
            
        result = await db.execute(stmt)
        docs = result.scalars().all()
        
        if search:
            s = search.lower()
            docs = [
                d for d in docs 
                if s in d.title.lower() or (d.ocr_text and s in d.ocr_text.lower())
            ]
            
        return docs

    @staticmethod
    async def get_document_by_id(db: AsyncSession, doc_id: str):
        result = await db.execute(select(DocumentDB).where(DocumentDB.id == doc_id))
        doc = result.scalar_one_or_none()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        return doc

    @staticmethod
    async def download_document(db: AsyncSession, doc_id: str):
        doc = await DocumentController.get_document_by_id(db, doc_id)
        resolved_path = DocumentController._resolve_file_path(doc.file_url)
        
        # Self-healing fallback: If physical file is still missing (e.g., initial seed run)
        if not os.path.exists(resolved_path):
            os.makedirs(os.path.dirname(resolved_path), exist_ok=True)
            with open(resolved_path, "w", encoding="utf-8") as f:
                content = (
                    f"Document Title: {doc.title}\n"
                    f"Category: {doc.category}\n"
                    f"Uploaded By: {doc.uploaded_by}\n\n"
                    f"OCR Text:\n{doc.ocr_text or 'No OCR performed yet.'}\n\n"
                    f"AI Summary:\n{doc.ai_summary or 'No summary available.'}\n"
                )
                f.write(content)

        return FileResponse(path=resolved_path, filename=doc.title)

    @staticmethod
    async def delete_document(db: AsyncSession, doc_id: str):
        doc = await DocumentController.get_document_by_id(db, doc_id)
        resolved_path = DocumentController._resolve_file_path(doc.file_url)
        
        if os.path.exists(resolved_path):
            os.remove(resolved_path)
        
        await db.delete(doc)
        await db.commit()
        return {"message": f"Document {doc_id} deleted successfully"}

    @staticmethod
    async def process_ocr(db: AsyncSession, doc_id: str):
        doc = await DocumentController.get_document_by_id(db, doc_id)
        resolved_path = DocumentController._resolve_file_path(doc.file_url)
        extracted_text = DocumentController._extract_real_text(resolved_path)
        
        if not extracted_text:
            extracted_text = f"Content preview for {doc.title} (Image/Binary file uploaded)."

        doc.ocr_text = extracted_text
        await db.commit()
        await db.refresh(doc)
        
        return {"document_id": doc.id, "ocr_text": doc.ocr_text}

    @staticmethod
    async def summarize_document(db: AsyncSession, doc_id: str):
        doc = await DocumentController.get_document_by_id(db, doc_id)
        resolved_path = DocumentController._resolve_file_path(doc.file_url)
        text = doc.ocr_text or DocumentController._extract_real_text(resolved_path)
        
        if text and len(text.strip()) > 20:
            words = text.split()
            word_count = len(words)
            snippet = " ".join(words[:40]) + ("..." if word_count > 40 else "")
            summary = f"Summary of {doc.title} ({doc.category}): Contains approx {word_count} words. Content snippet: '{snippet}'"
        else:
            summary = f"Summary for {doc.category} document '{doc.title}': Uploaded successfully on {doc.uploaded_at.strftime('%Y-%m-%d')}."

        doc.ai_summary = summary
        await db.commit()
        await db.refresh(doc)
        
        return {"document_id": doc.id, "ai_summary": doc.ai_summary}