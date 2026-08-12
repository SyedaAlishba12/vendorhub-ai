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
    """
    Creates a real PaymentIntent in test mode, persists a PaymentLog row,
    returns the PaymentIntent's client_secret + status + id.
    """
    api_key = os.getenv("STRIPE_SECRET_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Stripe API key is not configured."
        )

    stripe.api_key = api_key

    # Stripe expects amount in cents for most currencies like USD
    try:
        # For simplicity, multiply by 100 to convert to cents assuming it's a standard currency
        amount_in_cents = int(amount * 100)
        
        # Call stripe API (stripe SDK is synchronous, but fast enough for this simple call)
        # Note: could use asyncio.to_thread if we wanted it strictly non-blocking
        intent = stripe.PaymentIntent.create(
            amount=amount_in_cents,
            currency=currency.lower(),
            description=description,
        )
        
        # Persist to DB
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
        print(f"[paymentController] Stripe API error: {e.user_message or str(e)}")
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
