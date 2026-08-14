import os

from dotenv import load_dotenv
import stripe
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from models.PaymentLog import PaymentLog


# Load backend/.env
load_dotenv()

# Configure Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

if not stripe.api_key:
    raise RuntimeError(
        "STRIPE_SECRET_KEY is not configured. "
        "Please add STRIPE_SECRET_KEY to backend/.env"
    )


class PaymentController:

    @staticmethod
    async def create_stripe_payment(
        db: AsyncSession,
        amount: float,
        currency: str,
        description: str,
    ):
        try:
            # Convert amount to smallest currency unit.
            # Example: $10 -> 1000 cents
            amount_in_cents = int(round(amount * 100))

            # Create Stripe PaymentIntent
            payment_intent = stripe.PaymentIntent.create(
                amount=amount_in_cents,
                currency=currency.lower(),
                description=description,
                automatic_payment_methods={
                    "enabled": True,
                },
            )

            # Save payment attempt in database
            payment_log = PaymentLog(
                provider="stripe",
                amount=amount,
                currency=currency.upper(),
                status=payment_intent.status,
                external_reference_id=payment_intent.id,
                description=description,
            )

            db.add(payment_log)

            await db.commit()
            await db.refresh(payment_log)

            # IMPORTANT:
            # Return ONLY the payment data.
            # The route will add {"success": True, "data": ...}
            return {
                "id": payment_intent.id,
                "client_secret": payment_intent.client_secret,
                "status": payment_intent.status,
            }

        except stripe.error.StripeError as e:
            await db.rollback()

            raise HTTPException(
                status_code=400,
                detail=f"Stripe error: {str(e)}",
            )

        except HTTPException:
            await db.rollback()
            raise

        except Exception as e:
            await db.rollback()

            raise HTTPException(
                status_code=500,
                detail=f"Payment creation failed: {str(e)}",
            )