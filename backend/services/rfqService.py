import io
import re
import uuid
import asyncio
import json
import os

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, Response
from datetime import datetime, timedelta
from typing import Optional

from models.RFQ import RFQ, RFQStatus
from models.Buyer import Buyer
from schemas.rfqSchemas import RFQCreate, RFQUpdate
from services.pdfService import PDFService


class RFQService:

    @staticmethod
    async def create_rfq(
        db: AsyncSession,
        user_id: int,
        rfq_data: RFQCreate
    ) -> RFQ:

        result = await db.execute(
            select(Buyer).where(Buyer.user_id == user_id)
        )

        buyer = result.scalar_one_or_none()

        if not buyer:
            raise HTTPException(
                status_code=404,
                detail="Buyer not found"
            )

        rfq_ref = f"RFQ-{uuid.uuid4().hex[:4].upper()}"

        data = rfq_data.dict()

        # Normalize delivery_date for PostgreSQL
        # Your model uses DateTime without timezone.
        if data.get("delivery_date") is not None:

            delivery_date = data["delivery_date"]

            # If Pydantic gives us a timezone-aware datetime,
            # remove the timezone information before saving.
            if isinstance(delivery_date, datetime):

                if delivery_date.tzinfo is not None:
                    data["delivery_date"] = delivery_date.replace(
                        tzinfo=None
                    )

            # Handle ISO date strings as well
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
            select(Buyer).where(Buyer.user_id == user_id)
        )

        buyer = result.scalar_one_or_none()

        if not buyer:
            raise HTTPException(
                status_code=404,
                detail="Buyer not found"
            )

        query = (
            select(RFQ)
            .where(RFQ.buyer_id == buyer.id)
            .order_by(RFQ.created_at.desc())
        )

        if status:
            query = query.where(RFQ.status == status)

        result = await db.execute(query)

        return result.scalars().all()

    @staticmethod
    async def get_rfq_by_id(
        db: AsyncSession,
        user_id: int,
        rfq_id: int
    ) -> RFQ:

        result = await db.execute(
            select(Buyer).where(Buyer.user_id == user_id)
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

        data = rfq_data.dict(exclude_unset=True)

        # Normalize delivery_date before updating
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

        for key, value in data.items():
            setattr(rfq, key, value)

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

    @staticmethod
    async def send_rfq(
        db: AsyncSession,
        user_id: int,
        rfq_id: int
    ):

        rfq = await RFQService.get_rfq_by_id(
            db,
            user_id,
            rfq_id
        )

        if rfq.status != RFQStatus.DRAFT:
            raise HTTPException(
                status_code=400,
                detail="Only draft RFQs can be sent"
            )

        rfq.status = RFQStatus.SENT
        rfq.sent_at = datetime.utcnow()

        await db.commit()
        await db.refresh(rfq)

        return {
            "message": "RFQ sent successfully",
            "rfq_ref": rfq.rfq_ref
        }

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

        content = [
            f"RFQ Reference: {rfq.rfq_ref}",
            f"Product: {rfq.product_name}",
            f"Category: {rfq.category}",
            f"Quantity: {rfq.quantity} {rfq.unit}",
            f"Material: {rfq.material or 'N/A'}",
            f"Budget: ${rfq.budget or 0}",
            (
                f"Delivery Date: "
                f"{rfq.delivery_date.date() if rfq.delivery_date else 'N/A'}"
            ),
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

    @staticmethod
    async def generate_ai_rfq(
        db: AsyncSession,
        user_id: int,
        description: str
    ):

        try:
            from openai import AsyncOpenAI

            api_key = os.getenv("OPENAI_API_KEY")

            # If OpenAI key is not configured,
            # use the fallback extraction.
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
                    response.choices[0]
                    .message.content
                    .strip()
                )

                return json.loads(content)

        except Exception as e:

            print(
                f"AI RFQ error: {e}"
            )

            # If OpenAI fails because of quota,
            # timeout, invalid JSON, or any other issue,
            # use the local fallback.
            return RFQService._fallback_extract(
                description
            )

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

        # Extract product name
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

        # Extract quantity and unit
        match = re.search(
            r"(\d+)\s*(pcs|kg|m|l|meters|liters|boxes|rolls|sets)",
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

        # Extract material
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

        # Extract budget
        match = re.search(
            r"(?:\$|usd)\s*(\d+)",
            description,
            re.I
        )

        if match:
            data["budget"] = int(
                match.group(1)
            )

        # Extract category
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

    @staticmethod
    async def upload_attachment(
        db: AsyncSession,
        user_id: int,
        rfq_id: int,
        file
    ):

        # Verify that this RFQ belongs to the current buyer
        rfq = await RFQService.get_rfq_by_id(
            db,
            user_id,
            rfq_id
        )

        # Create uploads directory if it does not exist
        upload_dir = os.path.join(
            os.getcwd(),
            "uploads"
        )

        os.makedirs(
            upload_dir,
            exist_ok=True
        )

        # Generate unique filename
        file_ext = (
            file.filename.split(".")[-1]
            if file.filename and "." in file.filename
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

        # Read uploaded file
        contents = await file.read()

        # Save file
        with open(
            file_path,
            "wb"
        ) as f:

            f.write(contents)

        # Import attachment model
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
        await db.refresh(attachment)

        return {
            "message": "Attachment uploaded",
            "attachment_id": attachment.id
        }

