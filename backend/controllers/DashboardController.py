from fastapi import HTTPException

from services.DashboardService import DashboardService


class DashboardController:

    @staticmethod
    def get_dashboard(db):

        try:
            return DashboardService.get_dashboard(db)

        except Exception as e:

            raise HTTPException(
                status_code=400,
                detail=str(e),
            )