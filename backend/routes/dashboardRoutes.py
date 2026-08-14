from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from database.connection import get_db
from controllers.dashboardController import DashboardController
from services.dashboardService import DashboardService
from common.middleware.authMiddleware import get_current_user
from models.RecentSearch import RecentSearch
from models.user import User

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)


@router.get("/buyer")
async def get_buyer_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return await DashboardController.get_buyer_dashboard(
            db,
            current_user.id
        )

    except HTTPException:
        raise

    except Exception as e:
        print(f"Dashboard route error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch buyer dashboard"
        )
    
@router.get("/statistics")
async def get_statistics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await DashboardController.get_dashboard_statistics(
        db,
        current_user.id
    )


@router.get("/recommendations")
async def get_recommendations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await DashboardController.get_ai_recommendations(
        db,
        current_user.id
    )


@router.get("/orders")
async def get_orders(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await DashboardController.get_orders(
        db,
        current_user.id
    )


@router.get("/activity")
async def get_activity(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await DashboardController.get_activity(
        db,
        current_user.id
    )

@router.post("/searches")
async def add_search(
    query: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        buyer = await DashboardService.get_buyer_by_user_id(
            db,
            current_user.id
        )

        search = RecentSearch(
            buyer_id=buyer.id,
            query=query
        )

        db.add(search)
        await db.commit()
        await db.refresh(search)

        return {
            "message": "Search saved"
        }

    except HTTPException:
        raise

    except Exception as e:
        await db.rollback()

        print(f"Search save error: {e}")

        raise HTTPException(
            status_code=500,
            detail="Failed to save search"
        )