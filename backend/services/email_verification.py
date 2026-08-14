import secrets
from datetime import datetime, timedelta, timezone


VERIFICATION_TOKEN_EXPIRE_MINUTES = 30


def generate_verification_token() -> str:
    return secrets.token_urlsafe(32)


def get_verification_token_expiry() -> datetime:
    return datetime.now(timezone.utc) + timedelta(
        minutes=VERIFICATION_TOKEN_EXPIRE_MINUTES
    )
def generate_password_reset_token():
    return secrets.token_urlsafe(32)


def get_password_reset_token_expiry():
    return datetime.now(timezone.utc) + timedelta(
        minutes=30
    )