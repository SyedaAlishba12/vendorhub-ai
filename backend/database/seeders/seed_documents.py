import os
import uuid
import logging
from datetime import datetime
from database.connection import AsyncSessionLocal
from models.Document import DocumentDB

logger = logging.getLogger("Seeder")


UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")

def ensure_physical_files_exist(files_data):
    """
    Ensure physical dummy files exist in the uploads directory
    so that downloads never fail with a 404 error.
    """
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    for file_info in files_data:

        file_name = os.path.basename(file_info["file_url"])
        file_path = os.path.join(UPLOAD_DIR, file_name)
        

        if not os.path.exists(file_path):
            with open(file_path, "w", encoding="utf-8") as f:
                content = (
                    f"==================================================\n"
                    f"DOCUMENT TITLE: {file_info['title']}\n"
                    f"CATEGORY: {file_info['category']}\n"
                    f"UPLOADED BY: {file_info['uploaded_by']}\n"
                    f"==================================================\n\n"
                    f"OCR TEXT:\n{file_info['ocr_text']}\n\n"
                    f"SUMMARY:\n{file_info['ai_summary']}\n"
                )
                f.write(content)
            logger.info(f"📁 Created physical dummy file at: {file_path}")

async def seed_documents():
    async with AsyncSessionLocal() as db:
        try:
            logger.info("📄 Seeding Initial Documents...")

            raw_docs = [
                {
                    "title": "Vendor_ISO_9001_Certificate.pdf",
                    "category": "Certifications",
                    "file_type": "pdf",
                    "file_size_kb": 154.20,
                    "file_url": "/uploads/Vendor_ISO_9001_Certificate.pdf",
                    "uploaded_by": "usr_zainab",
                    "ocr_text": "Verified ISO 9001 quality audit compliance certificate.",
                    "ai_summary": "AI Summary: Verified ISO quality audit compliance valid through 2027."
                },
                {
                    "title": "Steel_Supply_Contract_2026.pdf",
                    "category": "Contracts",
                    "file_type": "pdf",
                    "file_size_kb": 340.50,
                    "file_url": "/uploads/Steel_Supply_Contract_2026.pdf",
                    "uploaded_by": "usr_zainab",
                    "ocr_text": "Master Service Agreement between VendorHub and Global Metals.",
                    "ai_summary": "AI Summary: Key terms include quality standards, 2-year warranty, and vendor delivery milestones."
                },
                {
                    "title": "Invoice_ORD_101.pdf",
                    "category": "Invoices",
                    "file_type": "pdf",
                    "file_size_kb": 88.10,
                    "file_url": "/uploads/Invoice_ORD_101.pdf",
                    "uploaded_by": "usr_zainab",
                    "ocr_text": "Invoice #101 total amount $4,500 paid via wire transfer.",
                    "ai_summary": "AI Summary: Payment confirmation for bulk raw materials shipment."
                }
            ]


            ensure_physical_files_exist(raw_docs)


            sample_documents = [
                DocumentDB(
                    id=f"DOC-{uuid.uuid4().hex[:8].upper()}",
                    title=doc["title"],
                    category=doc["category"],
                    file_type=doc["file_type"],
                    file_size_kb=doc["file_size_kb"],
                    file_url=doc["file_url"],
                    uploaded_by=doc["uploaded_by"],
                    uploaded_at=datetime.utcnow(),
                    ocr_text=doc["ocr_text"],
                    ai_summary=doc["ai_summary"]
                )
                for doc in raw_docs
            ]

            db.add_all(sample_documents)
            await db.commit()
            logger.info("✅ Documents Seeded Successfully!")
        except Exception as e:
            await db.rollback()
            logger.error(f"❌ Error seeding documents: {e}")
            raise e