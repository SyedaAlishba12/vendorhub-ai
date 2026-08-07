from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import SessionLocal

from common.utils.auth import get_current_user

from controllers.DashboardController import DashboardController

from schemas.DashboardSchema import DashboardResponse

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get(
    "/",
    response_model=DashboardResponse,
)
def dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return DashboardController.get_dashboard(db)