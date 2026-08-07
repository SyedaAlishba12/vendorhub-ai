from fastapi import HTTPException

from services.authService import AuthService


class AuthController:

    @staticmethod
    def register(db, user):
        try:
            return AuthService.register_user(
                db,
                user,
            )
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=str(e),
            )

    @staticmethod
    def login(db, credentials):
        try:
            return AuthService.login_user(
                db,
                credentials,
            )
        except Exception as e:
            raise HTTPException(
                status_code=401,
                detail=str(e),
            )

    @staticmethod
    def forgot_password(db, request):
        try:
            return AuthService.forgot_password(
                db,
                request.email,
            )
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=str(e),
            )

    @staticmethod
    def reset_password(db, request):
        try:
            return AuthService.reset_password(
                db,
                request.token,
                request.new_password,
            )
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=str(e),
            )

    @staticmethod
    def verify_email(db, token):
        try:
            return AuthService.verify_email(
                db,
                token,
            )
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=str(e),
            )

    @staticmethod
    def refresh_token(request):
        try:
            return AuthService.refresh_access_token(
                request.refresh_token,
            )
        except Exception as e:
            raise HTTPException(
                status_code=401,
                detail=str(e),
            )

    @staticmethod
    def current_user(user):
        return user