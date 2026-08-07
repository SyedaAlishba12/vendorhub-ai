from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import SessionLocal
from common.utils.auth import get_current_user

from controllers.AIRecommendationController import (
    AIRecommendationController,
)

from schemas.AIRecommendationSchema import (
    AIRecommendationResponse,
)


router = APIRouter(
    prefix="/recommendations",
    tags=["AI Recommendation"],
)


def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ---------------------------------
# Get AI Recommendations
# ---------------------------------

@router.get(
    "/",
    response_model=list[AIRecommendationResponse],
)
def get_recommendations(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    return AIRecommendationController.get_recommendations(
        db,
        current_user,
    )