from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from database.connection import AsyncSessionLocal
from schemas.quote import QuoteCreate, QuoteUpdate, QuoteResponse
from controllers import quote_controller

router = APIRouter(prefix="/quotes", tags=["Quotes"])


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


@router.get("/", response_model=list[QuoteResponse])
async def list_quotes(rfq_reference: str = None, db: AsyncSession = Depends(get_db)):
    return await quote_controller.get_all_quotes(db, rfq_reference)


@router.get("/{quote_id}", response_model=QuoteResponse)
async def get_quote(quote_id: int, db: AsyncSession = Depends(get_db)):
    quote = await quote_controller.get_quote_by_id(db, quote_id)
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    return quote


@router.post("/", response_model=QuoteResponse)
async def create_quote(quote: QuoteCreate, db: AsyncSession = Depends(get_db)):
    return await quote_controller.create_quote(db, quote)


@router.put("/{quote_id}", response_model=QuoteResponse)
async def update_quote(quote_id: int, quote: QuoteUpdate, db: AsyncSession = Depends(get_db)):
    updated = await quote_controller.update_quote(db, quote_id, quote)
    if not updated:
        raise HTTPException(status_code=404, detail="Quote not found")
    return updated


@router.delete("/{quote_id}")
async def delete_quote(quote_id: int, db: AsyncSession = Depends(get_db)):
    deleted = await quote_controller.delete_quote(db, quote_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Quote not found")
    return {"message": "Quote deleted successfully"}