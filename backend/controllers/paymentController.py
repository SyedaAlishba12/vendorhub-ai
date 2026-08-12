import os
import stripe
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from models.PaymentLog import PaymentLog



async def create_stripe_payment(
    db: AsyncSession,
    amount: float,
    currency: str,
    description: str
) -> dict:

    api_key = os.getenv("STRIPE_SECRET_KEY")


    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Stripe API key is not configured."
        )

    stripe.api_key = api_key

    try:
        amount_in_cents = int(amount * 100)

        intent = stripe.PaymentIntent.create(
            amount=amount_in_cents,
            currency=currency.lower(),
            description=description,
            automatic_payment_methods={
                "enabled": True
            }
        )

        payment_log = PaymentLog(
            provider="stripe",
            amount=amount,
            currency=currency,
            status=intent.status,
            external_reference_id=intent.id,
            description=description
        )

        db.add(payment_log)
        await db.flush()
        await db.refresh(payment_log)

        return {
            "id": intent.id,
            "client_secret": intent.client_secret,
            "status": intent.status
        }

    except stripe.error.StripeError as e:
        print(
            f"[paymentController] Stripe API error: "
            f"{e.user_message or str(e)}"
        )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=e.user_message or "Payment processing failed via Stripe."
        )

    except Exception as e:
        print(f"[paymentController] General error: {str(e)}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while processing the payment."
        )