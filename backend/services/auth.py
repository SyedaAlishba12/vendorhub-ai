import os
from datetime import datetime, timedelta, timezone

from passlib.context import CryptContext
from jose import jwt, JWTError


SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "vendorhub-dev-secret-change-in-production",
)

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours


# ============================================================
# PASSWORD HASHING
# ============================================================
#
# Argon2 is used for all NEW passwords.
#
# bcrypt is kept only for verifying OLD passwords that were
# already stored using bcrypt.
#
# This means existing users do not need to reset their
# passwords immediately.
# ============================================================

pwd_context = CryptContext(
    schemes=["argon2", "bcrypt"],
    deprecated=["bcrypt"],
)


# ============================================================
# PASSWORD VALIDATION
# ============================================================

def validate_password(password: str) -> None:
    """
    Validate password requirements.

    Current requirement:
    - Minimum 8 characters
    - No maximum length restriction
    """

    if len(password) < 8:
        raise ValueError(
            "Password must be at least 8 characters long."
        )


# ============================================================
# PASSWORD HASHING
# ============================================================

def hash_password(password: str) -> str:
    """
    Hash a password using Argon2.

    Argon2 does not have bcrypt's 72-byte password limitation.
    """

    validate_password(password)

    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Verify a password against an existing hash.

    Supports both:
    - Argon2 hashes
    - Existing bcrypt hashes
    """

    return pwd_context.verify(
        plain_password,
        hashed_password,
    )


# ============================================================
# JWT
# ============================================================

def create_access_token(data: dict) -> str:
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({
        "exp": expire,
    })

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def decode_access_token(token: str):
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        return payload

    except JWTError:
        return None


# ============================================================
# TOKEN HELPERS
# ============================================================

def get_user_id_from_token(token: str):
    """
    Extract the user ID from the JWT.
    Returns None if the token is invalid.
    """

    payload = decode_access_token(token)

    if not payload:
        return None

    user_id = payload.get("sub")

    if not user_id:
        return None

    try:
        return int(user_id)

    except (ValueError, TypeError):
        return None