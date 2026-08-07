from fastapi import HTTPException

from services.AIRecommendationService import AIRecommendationService


class AIRecommendationController:

    @staticmethod
    def get_recommendations(db):

        try:
            return AIRecommendationService.get_recommendations(db)

        except HTTPException:
            raise

        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=str(e),
            )