import os

from email.message import EmailMessage

import aiosmtplib

from dotenv import load_dotenv



load_dotenv()


SMTP_HOST = os.getenv(
    "SMTP_HOST",
    "smtp.gmail.com",
)

SMTP_PORT = int(
    os.getenv(
        "SMTP_PORT",
        "587",
    )
)

SMTP_USERNAME = os.getenv(
    "SMTP_USERNAME",
)

SMTP_PASSWORD = os.getenv(
    "SMTP_PASSWORD",
)

SMTP_FROM_EMAIL = os.getenv(
    "SMTP_FROM_EMAIL",
    SMTP_USERNAME,
)

SMTP_FROM_NAME = os.getenv(
    "SMTP_FROM_NAME",
    "VendorHub AI",
)


async def send_verification_email(
    to_email: str,
    verification_token: str,
):
    frontend_url = os.getenv(
        "FRONTEND_URL",
        "http://localhost:3000",
    )

    verification_link = (
        f"{frontend_url}/verify-email"
        f"?token={verification_token}"
    )

    message = EmailMessage()

    message["From"] = (
        f"{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL}>"
    )

    message["To"] = to_email

    message["Subject"] = (
        "Verify your VendorHub AI account"
    )

    message.set_content(
        f"""
Hello,

Welcome to VendorHub AI!

Please verify your email address by opening the link below:

{verification_link}

This verification link will expire after the configured verification period.

If you did not create a VendorHub AI account, you can safely ignore this email.

Regards,
VendorHub AI Team
"""
    )

    await aiosmtplib.send(
        message,
        hostname=SMTP_HOST,
        port=SMTP_PORT,
        start_tls=True,
        username=SMTP_USERNAME,
        password=SMTP_PASSWORD,
    )

    print(
        f"✅ Verification email sent to {to_email}"
    )

async def send_password_reset_email(
    to_email: str,
    reset_token: str,
):
    frontend_url = os.getenv(
        "FRONTEND_URL",
        "http://localhost:3000",
    )

    reset_link = (
        f"{frontend_url}/reset-password"
        f"?token={reset_token}"
    )

    message = EmailMessage()

    message["From"] = (
        f"{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL}>"
    )

    message["To"] = to_email

    message["Subject"] = (
        "Reset your VendorHub AI password"
    )

    message.set_content(
        f"""
Hello,

We received a request to reset your VendorHub AI password.

You can reset your password by opening the link below:

{reset_link}

This password reset link will expire after 30 minutes.

If you did not request a password reset, you can safely ignore this email.

Regards,
VendorHub AI Team
"""
    )

    await aiosmtplib.send(
        message,
        hostname=SMTP_HOST,
        port=SMTP_PORT,
        start_tls=True,
        username=SMTP_USERNAME,
        password=SMTP_PASSWORD,
    )

    print(
        f"✅ Password reset email sent to {to_email}"
    )