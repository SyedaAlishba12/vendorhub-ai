from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from models.quote import Quote
from schemas.quote import QuoteCreate, QuoteUpdate


def _attach_names(quote):
    quote.vendor_name = quote.vendor.company_name if quote.vendor else None
    quote.vendor_certification = quote.vendor.certification if quote.vendor else None
    quote.product_name = quote.product.name if quote.product else None
    return quote


async def get_all_quotes(db: AsyncSession, rfq_reference: str = None):
    query = select(Quote).options(selectinload(Quote.vendor), selectinload(Quote.product))
    if rfq_reference:
        query = query.where(Quote.rfq_reference == rfq_reference)
    result = await db.execute(query)
    quotes = result.scalars().all()
    return [_attach_names(q) for q in quotes]


async def get_quote_by_id(db: AsyncSession, quote_id: int):
    query = select(Quote).options(selectinload(Quote.vendor), selectinload(Quote.product)).where(Quote.id == quote_id)
    result = await db.execute(query)
    quote = result.scalars().first()
    if quote:
        _attach_names(quote)
    return quote


async def create_quote(db: AsyncSession, quote_data: QuoteCreate):
    new_quote = Quote(**quote_data.dict())
    db.add(new_quote)
    await db.commit()
    await db.refresh(new_quote, attribute_names=["vendor", "product"])
    return _attach_names(new_quote)


async def update_quote(db: AsyncSession, quote_id: int, quote_data: QuoteUpdate):
    result = await db.execute(select(Quote).where(Quote.id == quote_id))
    quote = result.scalars().first()
    if not quote:
        return None
    for key, value in quote_data.dict(exclude_unset=True).items():
        setattr(quote, key, value)
    await db.commit()
    await db.refresh(quote, attribute_names=["vendor", "product"])
    return _attach_names(quote)


async def delete_quote(db: AsyncSession, quote_id: int):
    result = await db.execute(select(Quote).where(Quote.id == quote_id))
    quote = result.scalars().first()
    if not quote:
        return None
    await db.delete(quote)
    await db.commit()
    return quote
