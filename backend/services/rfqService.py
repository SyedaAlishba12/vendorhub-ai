import re
import uuid
import asyncio
import json
import os

from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, Response
from datetime import datetime, timedelta
from typing import Optional

from models.RFQ import RFQ, RFQStatus
from models.Buyer import Buyer
from schemas.rfqSchemas import RFQCreate, RFQUpdate
from services.pdfService import PDFService

from models.RFQVendor import RFQVendor
from models.vendors import Vendor


class RFQService:

    @staticmethod
    async def create_rfq(
        db: AsyncSession,
        user_id: int,
        rfq_data: RFQCreate
    ) -> RFQ:

        result = await db.execute(
            select(Buyer).where(
                Buyer.user_id == user_id
            )
        )

        buyer = result.scalar_one_or_none()

        if not buyer:
            raise HTTPException(
                status_code=404,
                detail="Buyer not found"
            )

        rfq_ref = f"RFQ-{uuid.uuid4().hex[:4].upper()}"

        data = rfq_data.dict()

        if data.get("delivery_date") is not None:

            delivery_date = data["delivery_date"]

            if isinstance(delivery_date, datetime):

                if delivery_date.tzinfo is not None:
                    data["delivery_date"] = delivery_date.replace(
                        tzinfo=None
                    )

            elif isinstance(delivery_date, str):

                try:
                    parsed_date = datetime.fromisoformat(
                        delivery_date.replace("Z", "+00:00")
                    )

                    if parsed_date.tzinfo is not None:
                        parsed_date = parsed_date.replace(
                            tzinfo=None
                        )

                    data["delivery_date"] = parsed_date

                except ValueError:
                    raise HTTPException(
                        status_code=422,
                        detail="Invalid delivery date format"
                    )

        rfq = RFQ(
            buyer_id=buyer.id,
            rfq_ref=rfq_ref,
            **data
        )

        db.add(rfq)

        await db.commit()
        await db.refresh(rfq)

        return rfq

    @staticmethod
    async def get_rfqs(
        db: AsyncSession,
        user_id: int,
        status: Optional[str] = None
    ) -> list[RFQ]:

        result = await db.execute(
            select(Buyer).where(
                Buyer.user_id == user_id
            )
        )

        buyer = result.scalar_one_or_none()

        if not buyer:
            raise HTTPException(
                status_code=404,
                detail="Buyer not found"
            )

        query = (
            select(RFQ)
            .where(
                RFQ.buyer_id == buyer.id
            )
            .order_by(
                RFQ.created_at.desc()
            )
        )

        if status:
            query = query.where(
                RFQ.status == status
            )

        result = await db.execute(query)

        return result.scalars().all()

    @staticmethod
    async def get_rfq_by_id(
        db: AsyncSession,
        user_id: int,
        rfq_id: int
    ) -> RFQ:

        result = await db.execute(
            select(Buyer).where(
                Buyer.user_id == user_id
            )
        )

        buyer = result.scalar_one_or_none()

        if not buyer:
            raise HTTPException(
                status_code=404,
                detail="Buyer not found"
            )

        result = await db.execute(
            select(RFQ).where(
                RFQ.id == rfq_id,
                RFQ.buyer_id == buyer.id
            )
        )

        rfq = result.scalar_one_or_none()

        if not rfq:
            raise HTTPException(
                status_code=404,
                detail="RFQ not found"
            )

        return rfq

    @staticmethod
    async def update_rfq(
        db: AsyncSession,
        user_id: int,
        rfq_id: int,
        rfq_data: RFQUpdate
    ) -> RFQ:

        rfq = await RFQService.get_rfq_by_id(
            db,
            user_id,
            rfq_id
        )

        if rfq.status != RFQStatus.DRAFT:
            raise HTTPException(
                status_code=400,
                detail="Only draft RFQs can be edited"
            )

        data = rfq_data.dict(
            exclude_unset=True
        )

        if data.get("delivery_date") is not None:

            delivery_date = data["delivery_date"]

            if isinstance(
                delivery_date,
                datetime
            ):

                if delivery_date.tzinfo is not None:
                    data["delivery_date"] = delivery_date.replace(
                        tzinfo=None
                    )

            elif isinstance(
                delivery_date,
                str
            ):

                try:
                    parsed_date = datetime.fromisoformat(
                        delivery_date.replace(
                            "Z",
                            "+00:00"
                        )
                    )

                    if parsed_date.tzinfo is not None:
                        parsed_date = parsed_date.replace(
                            tzinfo=None
                        )

                    data["delivery_date"] = parsed_date

                except ValueError:
                    raise HTTPException(
                        status_code=422,
                        detail="Invalid delivery date format"
                    )

        for key, value in data.items():
            setattr(
                rfq,
                key,
                value
            )

        rfq.updated_at = datetime.utcnow()

        await db.commit()
        await db.refresh(rfq)

        return rfq

    @staticmethod
    async def delete_rfq(
        db: AsyncSession,
        user_id: int,
        rfq_id: int
    ):

        rfq = await RFQService.get_rfq_by_id(
            db,
            user_id,
            rfq_id
        )

        await db.delete(rfq)
        await db.commit()

        return {
            "message": "RFQ deleted successfully"
        }

    # =========================================================
    # SEND RFQ TO VENDOR
    # =========================================================

    @staticmethod
    async def send_rfq(
        db: AsyncSession,
        user_id: int,
        rfq_id: int,
        vendor_id: int
    ):

        # Find buyer associated with logged-in user
        buyer_result = await db.execute(
            select(Buyer).where(
                Buyer.user_id == user_id
            )
        )

        buyer = buyer_result.scalar_one_or_none()

        if not buyer:
            raise HTTPException(
                status_code=404,
                detail="Buyer not found"
            )

        # Find RFQ belonging to this buyer
        rfq_result = await db.execute(
            select(RFQ).where(
                RFQ.id == rfq_id,
                RFQ.buyer_id == buyer.id
            )
        )

        rfq = rfq_result.scalar_one_or_none()

        if not rfq:
            raise HTTPException(
                status_code=404,
                detail="RFQ not found or you do not have permission"
            )

        # Check vendor
        vendor_result = await db.execute(
            select(Vendor).where(
                Vendor.id == vendor_id
            )
        )

        vendor = vendor_result.scalar_one_or_none()

        if not vendor:
            raise HTTPException(
                status_code=404,
                detail="Vendor not found"
            )

        # Check existing assignment
        existing_result = await db.execute(
            select(RFQVendor).where(
                RFQVendor.rfq_id == rfq_id,
                RFQVendor.vendor_id == vendor_id
            )
        )

        existing_assignment = (
            existing_result.scalar_one_or_none()
        )

        if existing_assignment:
            raise HTTPException(
                status_code=400,
                detail="RFQ has already been sent to this vendor"
            )

        # Create assignment
        rfq_vendor = RFQVendor(
            rfq_id=rfq_id,
            vendor_id=vendor_id,
            status="SENT"
        )

        db.add(rfq_vendor)

        # Update RFQ
        rfq.status = RFQStatus.SENT
        rfq.sent_at = datetime.utcnow()

        await db.commit()

        await db.refresh(rfq_vendor)

        return {
            "message": "RFQ sent successfully",
            "rfq_id": rfq_id,
            "vendor_id": vendor_id,
            "status": rfq_vendor.status
        }

    # =========================================================
    # GET RFQs ASSIGNED TO LOGGED-IN VENDOR
    # =========================================================

    @staticmethod
    async def get_vendor_rfqs(
        db: AsyncSession,
        user_id: int
    ):

        # ---------------------------------------------------------
        # 1. Find the vendor belonging to the logged-in user
        # ---------------------------------------------------------

        vendor_result = await db.execute(
            select(Vendor).where(
                Vendor.user_id == user_id
            )
        )

        vendor = vendor_result.scalar_one_or_none()

        print("====================================")
        print("CURRENT USER ID:", user_id)
        print("VENDOR FOUND:", vendor)
        print(
            "VENDOR ID:",
            vendor.id if vendor else None
        )
        print("====================================")

        if not vendor:
            raise HTTPException(
                status_code=404,
                detail="Vendor not found"
            )

        # ---------------------------------------------------------
        # 2. Get RFQ assignments for this vendor
        #
        # selectinload(RFQVendor.rfq) is important because
        # AsyncSession cannot lazy-load the relationship here.
        # ---------------------------------------------------------

        result = await db.execute(
            select(RFQVendor)
            .options(
                selectinload(RFQVendor.rfq)
            )
            .where(
                RFQVendor.vendor_id == vendor.id
            )
        )

        assignments = result.scalars().all()

        print(
            "ASSIGNMENTS FOUND:",
            len(assignments)
        )

        for assignment in assignments:

            print(
                "RFQ:",
                assignment.rfq_id,
                "VENDOR:",
                assignment.vendor_id,
                "STATUS:",
                assignment.status
            )

        # ---------------------------------------------------------
        # 3. Return RFQ information
        # ---------------------------------------------------------

        return [
            {
                "assignment_id": assignment.id,
                "rfq_id": assignment.rfq_id,
                "rfq_ref": assignment.rfq.rfq_ref,
                "product_name": assignment.rfq.product_name,
                "category": assignment.rfq.category,
                "quantity": assignment.rfq.quantity,
                "unit": assignment.rfq.unit,
                "material": assignment.rfq.material,
                "budget": assignment.rfq.budget,
                "delivery_date": assignment.rfq.delivery_date,
                "payment_terms": assignment.rfq.payment_terms,
                "shipping_method": assignment.rfq.shipping_method,
                "description": assignment.rfq.description,
                "rfq_status": assignment.rfq.status,
                "vendor_status": assignment.status,
                "sent_at": assignment.sent_at,
                "responded_at": assignment.responded_at
            }
            for assignment in assignments
        ]

    # =========================================================
    # EXPORT RFQ PDF
    # =========================================================

    @staticmethod
    async def export_rfq_pdf(
        db: AsyncSession,
        user_id: int,
        rfq_id: int
    ):

        rfq = await RFQService.get_rfq_by_id(
            db,
            user_id,
            rfq_id
        )

        delivery_date = (
            rfq.delivery_date.date()
            if rfq.delivery_date
            else "N/A"
        )

        content = [
            f"RFQ Reference: {rfq.rfq_ref}",
            f"Product: {rfq.product_name}",
            f"Category: {rfq.category}",
            f"Quantity: {rfq.quantity} {rfq.unit}",
            f"Material: {rfq.material or 'N/A'}",
            f"Budget: ${rfq.budget or 0}",
            f"Delivery Date: {delivery_date}",
            f"Payment Terms: {rfq.payment_terms}",
            f"Shipping Method: {rfq.shipping_method}",
            f"Description: {rfq.description or ''}",
        ]

        pdf_bytes = PDFService.generate_pdf(
            f"RFQ {rfq.rfq_ref}",
            content
        )

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition":
                    f"attachment; filename={rfq.rfq_ref}.pdf"
            }
        )

    # =========================================================
    # AI RFQ GENERATION
    # =========================================================

    @staticmethod
    async def generate_ai_rfq(
        db: AsyncSession,
        user_id: int,
        description: str
    ):

        try:

            from openai import AsyncOpenAI

            api_key = os.getenv(
                "OPENAI_API_KEY"
            )

            if not api_key:

                return RFQService._fallback_extract(
                    description
                )

            client = AsyncOpenAI(
                api_key=api_key
            )

            prompt = f"""
You are assisting a procurement professional to create an RFQ.

Extract the following fields from the description:

- product_name (text)
- category (one of: Apparel, Electronics, Metals, Chemicals, Machinery, Agriculture, Other)
- quantity (integer)
- unit (pcs, kg, meters, liters, boxes, rolls, sets)
- material (text, if mentioned)
- budget (number, if mentioned)
- payment_terms (choose from: Net 30, Net 60, Net 90, L/C, T/T 50/50, T/T 100%)
- shipping_method (choose from: Sea Freight, Air Freight, Land Transport, Express)
- delivery_date (ISO date YYYY-MM-DD, if mentioned, else today+30 days)

Description: "{description}"

Return JSON ONLY, no extra text:

{{
    "product_name": "...",
    "category": "...",
    "quantity": 0,
    "unit": "...",
    "material": "...",
    "budget": 0,
    "payment_terms": "...",
    "shipping_method": "...",
    "delivery_date": "YYYY-MM-DD"
}}
"""

            async with asyncio.timeout(10):

                response = await client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    temperature=0.3,
                    max_tokens=200
                )

                content = (
                    response
                    .choices[0]
                    .message
                    .content
                    .strip()
                )

                return json.loads(content)

        except Exception as e:

            print(
                f"AI RFQ error: {e}"
            )

            return RFQService._fallback_extract(
                description
            )

    # =========================================================
    # FALLBACK AI EXTRACTION
    # =========================================================

    @staticmethod
    def _fallback_extract(
        description: str
    ) -> dict:

        data = {
            "product_name": "",
            "category": "Other",
            "quantity": 1,
            "unit": "pcs",
            "material": "",
            "budget": 0,
            "payment_terms": "Net 30",
            "shipping_method": "Sea Freight",
            "delivery_date": (
                datetime.utcnow()
                + timedelta(days=30)
            ).strftime("%Y-%m-%d"),
        }

        # Product name
        match = re.search(
            r"(?:need|buy|purchase)\s+([\w\s\-]+)",
            description,
            re.I
        )

        if match:

            data["product_name"] = (
                match.group(1)
                .strip()
                .title()
            )

        # Quantity and unit
        match = re.search(
            r"(\d+)\s*"
            r"(pcs|kg|m|l|meters|liters|boxes|rolls|sets)",
            description,
            re.I
        )

        if match:

            data["quantity"] = int(
                match.group(1)
            )

            data["unit"] = (
                match.group(2)
                .lower()
            )

        # Material
        match = re.search(
            r"(?:made of|material)\s+([\w\s\-]+)",
            description,
            re.I
        )

        if match:

            data["material"] = (
                match.group(1)
                .strip()
                .title()
            )

        # Budget
        match = re.search(
            r"(?:\$|usd)\s*(\d+)",
            description,
            re.I
        )

        if match:

            data["budget"] = int(
                match.group(1)
            )

        # Category
        categories = [
            "apparel",
            "electronics",
            "metals",
            "chemicals",
            "machinery",
            "agriculture"
        ]

        for cat in categories:

            if cat in description.lower():

                data["category"] = (
                    cat.title()
                )

                break

        return data

    # =========================================================
    # UPLOAD ATTACHMENT
    # =========================================================

    @staticmethod
    async def upload_attachment(
        db: AsyncSession,
        user_id: int,
        rfq_id: int,
        file
    ):

        rfq = await RFQService.get_rfq_by_id(
            db,
            user_id,
            rfq_id
        )

        upload_dir = os.path.join(
            os.getcwd(),
            "uploads"
        )

        os.makedirs(
            upload_dir,
            exist_ok=True
        )

        file_ext = (
            file.filename.split(".")[-1]
            if file.filename
            and "." in file.filename
            else ""
        )

        if file_ext:

            filename = (
                f"{rfq.rfq_ref}_"
                f"{uuid.uuid4().hex[:8]}."
                f"{file_ext}"
            )

        else:

            filename = (
                f"{rfq.rfq_ref}_"
                f"{uuid.uuid4().hex[:8]}"
            )

        file_path = os.path.join(
            upload_dir,
            filename
        )

        contents = await file.read()

        with open(
            file_path,
            "wb"
        ) as f:

            f.write(contents)

        from models.RFQ import RFQAttachment

        attachment = RFQAttachment(
            rfq_id=rfq.id,
            file_name=file.filename,
            file_type=file_ext,
            file_url=file_path,
            file_size_kb=round(
                len(contents) / 1024,
                2
            ),
        )

        db.add(attachment)

        await db.commit()

        await db.refresh(
            attachment
        )

        return {
            "message": "Attachment uploaded",
            "attachment_id": attachment.id
        }