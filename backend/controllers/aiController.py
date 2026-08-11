from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.vendors import Vendor
from services.aiService import (
    ai_rank_vendors,
    get_ai_vendor_insight,
)


async def ai_search_vendors(
    db: AsyncSession,
    query: str,
    filters: dict = {},
):
    stmt = select(Vendor).where(Vendor.is_hidden == False)  # noqa

    if filters.get("country"):
        stmt = stmt.where(
            Vendor.country.ilike(f"%{filters['country']}%")
        )

    if filters.get("certification"):
        stmt = stmt.where(
            Vendor.certification.ilike(
                f"%{filters['certification']}%"
            )
        )

    if filters.get("min_rating"):
        stmt = stmt.where(
            Vendor.rating >= float(filters["min_rating"])
        )

    result = await db.execute(stmt)
    vendors = result.scalars().all()

    ranked = await ai_rank_vendors(query, vendors)

    return [
        {
            "id": v.id,
            "company_name": v.company_name,
            "business_description": v.business_description,
            "country": v.country,
            "industry": v.industry,
            "certification": v.certification,
            "production_capacity": v.production_capacity,
            "contact_email": v.contact_email,
            "languages": v.languages,
            "rating": v.rating,
            "response_time_hours": v.response_time_hours,
            "is_verified": v.is_verified,
            "match_score": getattr(v, "match_score", 0),
        }
        for v in ranked
    ]


async def ai_vendor_insight(
    db: AsyncSession,
    vendor_id: int,
):
    result = await db.execute(
        select(Vendor).where(Vendor.id == vendor_id)
    )

    vendor = result.scalars().first()

    if not vendor:
        return None

    return await get_ai_vendor_insight(vendor)


async def ai_suggestions(
    db: AsyncSession,
    query: str,
):
    from services.aiService import generate_suggestions

    return await generate_suggestions(query)


async def get_quote_recommendation(
    db: AsyncSession,
    quotes: list,
):
    from services.aiService import quote_recommendation

    return await quote_recommendation(quotes)