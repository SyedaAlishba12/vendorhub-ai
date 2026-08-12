from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from controllers.paymentController import create_stripe_payment
from database.session import get_db

router = APIRouter(prefix="/api/payment", tags=["Payment"])

class PaymentRequest(BaseModel):
    amount: float = Field(..., gt=0, description="The payment amount.")
    currency: str = Field(..., min_length=3, max_length=3, description="3-letter currency code (e.g. USD).")
    description: str = Field(..., min_length=1, max_length=500, description="Description of the payment.")

def _ok(data: object, status_code: int = 200) -> JSONResponse:
    """Standard success envelope."""
    return JSONResponse(
        status_code=status_code,
        content={"success": True, "data": data},
    )

@router.post(
    "",
    summary="Create a new payment",
    response_description="Payment intent details and client secret.",
    status_code=200,
)
async def route_create_payment(
    body: PaymentRequest,
    db: AsyncSession = Depends(get_db),
) -> JSONResponse:
    """
    **POST /api/payment**
    
    Creates a Stripe PaymentIntent in test mode and logs it to the database.
    """
    data = await create_stripe_payment(
        db=db,
        amount=body.amount,
        currency=body.currency,
        description=body.description
    )
    return _ok(data)
