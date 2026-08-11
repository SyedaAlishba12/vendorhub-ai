from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from database.connection import AsyncSessionLocal
from controllers import aiController as ai_controller  

router = APIRouter(prefix="/api/ai", tags=["AI"])


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


@router.post("/search")
async def ai_search(
    body: dict,
    db: AsyncSession = Depends(get_db),
):
    query = body.get("query", "")
    filters = body.get("filters", {})
    if not query:
        raise HTTPException(status_code=400, detail="Query required")
    return await ai_controller.ai_search_vendors(db, query, filters)


@router.get("/vendors/{vendor_id}/insight")
async def vendor_insight(
    vendor_id: int,
    db: AsyncSession = Depends(get_db),
):
    insight = await ai_controller.ai_vendor_insight(db, vendor_id)
    if not insight:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return insight
@router.post("/suggestions")
async def ai_suggestions(body: dict, db: AsyncSession = Depends(get_db)):
    query = body.get("query", "")
    return await ai_controller.ai_suggestions(db, query)


@router.post("/quote-recommendation")
async def quote_recommendation(body: dict, db: AsyncSession = Depends(get_db)):
    quotes = body.get("quotes", [])
    return await ai_controller.get_quote_recommendation(db, quotes)