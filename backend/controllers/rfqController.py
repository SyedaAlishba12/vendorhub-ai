from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from services.rfqService import RFQService
from schemas.rfqSchemas import RFQCreate, RFQUpdate, RFQResponse


class RFQController:

    @staticmethod
    async def create_rfq(
        db: AsyncSession,
        user_id: int,
        rfq_data: RFQCreate
    ):
        try:
            rfq = await RFQService.create_rfq(
                db,
                user_id,
                rfq_data
            )

            return RFQResponse.from_orm(rfq)

        except HTTPException:
            raise

        except Exception as e:
            print(f"Error creating RFQ: {e}")

            raise HTTPException(
                status_code=500,
                detail="Failed to create RFQ"
            )

    @staticmethod
    async def get_rfqs(
        db: AsyncSession,
        user_id: int,
        status: str = None
    ):
        try:
            rfqs = await RFQService.get_rfqs(
                db,
                user_id,
                status
            )

            return [
                RFQResponse.from_orm(rfq)
                for rfq in rfqs
            ]

        except HTTPException:
            raise

        except Exception as e:
            print(f"Error fetching RFQs: {e}")

            raise HTTPException(
                status_code=500,
                detail="Failed to fetch RFQs"
            )

    @staticmethod
    async def get_rfq(
        db: AsyncSession,
        user_id: int,
        rfq_id: int
    ):
        try:
            rfq = await RFQService.get_rfq_by_id(
                db,
                user_id,
                rfq_id
            )

            return RFQResponse.from_orm(rfq)

        except HTTPException:
            raise

        except Exception as e:
            print(f"Error fetching RFQ: {e}")

            raise HTTPException(
                status_code=500,
                detail="Failed to fetch RFQ"
            )

    @staticmethod
    async def update_rfq(
        db: AsyncSession,
        user_id: int,
        rfq_id: int,
        rfq_data: RFQUpdate
    ):
        try:
            rfq = await RFQService.update_rfq(
                db,
                user_id,
                rfq_id,
                rfq_data
            )

            return RFQResponse.from_orm(rfq)

        except HTTPException:
            raise

        except Exception as e:
            print(f"Error updating RFQ: {e}")

            raise HTTPException(
                status_code=500,
                detail="Failed to update RFQ"
            )

    @staticmethod
    async def delete_rfq(
        db: AsyncSession,
        user_id: int,
        rfq_id: int
    ):
        try:
            return await RFQService.delete_rfq(
                db,
                user_id,
                rfq_id
            )

        except HTTPException:
            raise

        except Exception as e:
            print(f"Error deleting RFQ: {e}")

            raise HTTPException(
                status_code=500,
                detail="Failed to delete RFQ"
            )

    @staticmethod
    async def send_rfq(
        db: AsyncSession,
        user_id: int,
        rfq_id: int,
        vendor_id: int
    ):
        try:
            return await RFQService.send_rfq(
                db,
                user_id,
                rfq_id,
                vendor_id
            )

        except HTTPException:
            raise

        except Exception as e:
            print(f"Error sending RFQ: {e}")

            raise HTTPException(
                status_code=500,
                detail="Failed to send RFQ"
            )

    @staticmethod
    async def export_rfq_pdf(
        db: AsyncSession,
        user_id: int,
        rfq_id: int
    ):
        try:
            return await RFQService.export_rfq_pdf(
                db,
                user_id,
                rfq_id
            )

        except HTTPException:
            raise

        except Exception as e:
            print(f"Error exporting PDF: {e}")

            raise HTTPException(
                status_code=500,
                detail="Failed to export PDF"
            )

    @staticmethod
    async def generate_ai_rfq(
        db: AsyncSession,
        user_id: int,
        description: str
    ):
        try:
            return await RFQService.generate_ai_rfq(
                db,
                user_id,
                description
            )

        except HTTPException:
            raise

        except Exception as e:
            print(f"Error generating AI RFQ: {e}")

            raise HTTPException(
                status_code=500,
                detail=f"AI RFQ generation failed: {str(e)}"
            )

    @staticmethod
    async def upload_attachment(
        db: AsyncSession,
        user_id: int,
        rfq_id: int,
        file
    ):
        try:
            return await RFQService.upload_attachment(
                db,
                user_id,
                rfq_id,
                file
            )

        except HTTPException:
            raise

        except Exception as e:
            print(f"Error uploading attachment: {e}")

            raise HTTPException(
                status_code=500,
                detail="Attachment upload failed"
            )
    @staticmethod
    async def get_vendor_rfqs(
        db: AsyncSession,
        user_id: int
    ):
        try:
            return await RFQService.get_vendor_rfqs(
                db,
                user_id
            )

        except HTTPException:
            raise

        except Exception as e:
            print(f"Error fetching vendor RFQs: {e}")

            raise HTTPException(
                status_code=500,
                detail="Failed to fetch vendor RFQs"
            )