from sqlalchemy.orm import Session

from models.User import User

from common.utils.security import (
    hash_password,
    verify_password,
)

from common.utils.jwt import (
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
    create_reset_token,
    verify_reset_token,
    create_email_verification_token,
    verify_email_token,
)


class AuthService:
    """
    Business Logic for Authentication
    """

    @staticmethod
    def register_user(db: Session, user_data):

        existing_user = (
            db.query(User)
            .filter(User.email == user_data.email)
            .first()
        )

        if existing_user:
            raise Exception("Email already registered.")

        new_user = User(
            full_name=user_data.full_name,
            email=user_data.email,
            password_hash=hash_password(user_data.password),
            role=user_data.role,
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        verification_token = create_email_verification_token(
            new_user.email
        )

        print("\nVerification Token:")
        print(verification_token)
        print()

        return new_user

    @staticmethod
    def login_user(db: Session, login_data):

        user = (
            db.query(User)
            .filter(User.email == login_data.email)
            .first()
        )

        if not user:
            raise Exception("Invalid email or password.")

        if not verify_password(
            login_data.password,
            user.password_hash,
        ):
            raise Exception("Invalid email or password.")

        payload = {
            "user_id": user.id,
            "email": user.email,
            "role": user.role,
        }

        access_token = create_access_token(payload)

        refresh_token = create_refresh_token(payload)

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "Bearer",
            "user": user,
        }

    @staticmethod
    def get_user_by_email(
        db: Session,
        email: str,
    ):
        return (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

    @staticmethod
    def get_user_by_id(
        db: Session,
        user_id: int,
    ):
        return (
            db.query(User)
            .filter(User.id == user_id)
            .first()
        )

    # -----------------------------
    # Forgot Password
    # -----------------------------

    @staticmethod
    def forgot_password(
        db: Session,
        email: str,
    ):

        user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if not user:
            raise Exception("User not found.")

        reset_token = create_reset_token(
            user.email
        )

        return {
            "message": "Password reset token generated.",
            "reset_token": reset_token,
        }

    # -----------------------------
    # Reset Password
    # -----------------------------

    @staticmethod
    def reset_password(
        db: Session,
        token: str,
        new_password: str,
    ):

        raise Exception(
            "Reset Password API not implemented yet."
        )

    # -----------------------------
    # Verify Email
    # -----------------------------

    @staticmethod
    def verify_email(
        db: Session,
        token: str,
    ):

        payload = verify_email_token(token)

        email = payload["email"]

        user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if not user:
            raise Exception("User not found.")

        user.is_verified = True

        db.commit()

        return {
            "message": "Email verified successfully."
        }

    # -----------------------------
    # Refresh Token
    # -----------------------------

    @staticmethod
    def refresh_access_token(
        refresh_token: str,
    ):

        payload = verify_refresh_token(
            refresh_token
        )

        access_token = create_access_token(
            {
                "user_id": payload["user_id"],
                "email": payload["email"],
                "role": payload["role"],
            }
        )

        return {
            "access_token": access_token,
            "token_type": "Bearer",
        }