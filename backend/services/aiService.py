import asyncio
import os
import json

from openai import AsyncOpenAI

from services.matching import calculate_match_breakdown


# ==============================================================================
# OPENAI CLIENT
# ==============================================================================

client = (
    AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    if os.getenv("OPENAI_API_KEY")
    else None
)


# ==============================================================================
# AI VENDOR SEARCH / RANKING
# ==============================================================================

def fallback_ranking(query: str, vendors: list) -> list:
    """
    Strict keyword-based relevance ranking (0-100).
    Used when OpenAI is unavailable.
    """

    query_lower = query.lower()
    words = [w for w in query_lower.split() if len(w) > 2]

    scored = []

    for vendor in vendors:
        text = (
            f"{vendor.company_name} "
            f"{vendor.country} "
            f"{vendor.industry or ''} "
            f"{vendor.certification or ''}"
        ).lower()

        # Count matching words
        match_count = sum(1 for word in words if word in text)

        # Exact phrase in company name gets a boost
        if query_lower in vendor.company_name.lower():
            match_count += 2

        # Country mention in query
        if vendor.country and vendor.country.lower() in query_lower:
            match_count += 1

        # Industry mention in query
        if vendor.industry and vendor.industry.lower() in query_lower:
            match_count += 1

        if match_count == 0:
            score = 0
        else:
            # Base score from match coverage
            base = min(
                (match_count / max(len(words), 1)) * 100,
                100,
            )

            # Small quality bonus
            quality = (
                (vendor.rating / 5) * 10
                if vendor.rating
                else 0
            )

            if vendor.is_verified:
                quality += 2

            if vendor.certification:
                quality += 2

            score = min(base + quality, 100)

        scored.append((score, vendor))

    scored.sort(key=lambda item: -item[0])

    return scored


async def ai_rank_vendors(query: str, vendors: list) -> list:
    """
    Rank vendors using OpenAI when available.
    Falls back to keyword-based ranking otherwise.
    """

    # No API key -> fallback
    if not client:
        scored = fallback_ranking(query, vendors)

        for score, vendor in scored:
            vendor.match_score = round(score)

        return [vendor for _, vendor in scored]

    vendor_data = [
        {
            "id": vendor.id,
            "name": vendor.company_name,
            "country": vendor.country,
            "industry": vendor.industry or "",
            "certification": vendor.certification or "",
            "rating": vendor.rating,
            "response_time": vendor.response_time_hours,
            "verified": vendor.is_verified,
        }
        for vendor in vendors
    ]

    prompt = f"""
User query: "{query}"

Vendors:
{json.dumps(vendor_data)}

Rank these vendors by relevance to the query from most to least relevant.

Output a JSON array of objects, each with:

- "id"
- "score" (0-100)

Example:
[
    {{"id": 3, "score": 90}},
    {{"id": 1, "score": 40}}
]
"""

    try:
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            max_tokens=200,
        )

        content = response.choices[0].message.content.strip()

        if content.startswith("```json"):
            content = (
                content
                .replace("```json", "")
                .replace("```", "")
                .strip()
            )

        items = json.loads(content)

        # Map vendors by ID
        id_map = {
            vendor.id: vendor
            for vendor in vendors
        }

        score_map = {
            item["id"]: item["score"]
            for item in items
        }

        ranked = []

        for item in items:
            if item["id"] in id_map:
                vendor = id_map[item["id"]]

                vendor.match_score = max(
                    0,
                    min(100, int(item["score"])),
                )

                ranked.append(vendor)

        # Add vendors not returned by AI
        for vendor in vendors:
            if vendor.id not in score_map:
                vendor.match_score = 0
                ranked.append(vendor)

        return ranked

    except Exception as e:
        print(
            f"AI vendor ranking unavailable, "
            f"using fallback: {e}"
        )

        scored = fallback_ranking(query, vendors)

        for score, vendor in scored:
            vendor.match_score = round(score)

        return [vendor for _, vendor in scored]


# ==============================================================================
# AI VENDOR INSIGHT
# ==============================================================================

async def get_ai_vendor_insight(vendor) -> dict:
    """
    Generate an AI insight for a vendor.
    """

    # No OpenAI -> local fallback
    if not client:
        breakdown = calculate_match_breakdown(vendor)

        reasons = []

        if vendor.is_verified:
            reasons.append("verified supplier")

        if vendor.certification:
            reasons.append(
                f"{vendor.certification} certified"
            )

        if vendor.rating and vendor.rating >= 4.5:
            reasons.append("highly rated")

        if (
            vendor.response_time_hours
            and vendor.response_time_hours <= 4
        ):
            reasons.append("quick response time")

        if reasons:
            explanation = (
                "This supplier looks strong. "
                + " + ".join(reasons)
            )
        else:
            explanation = "No special attributes."

        return {
            "score": breakdown["total"],
            "explanation": explanation,
        }

    vendor_data = {
        "name": vendor.company_name,
        "country": vendor.country,
        "industry": vendor.industry or "Unknown",
        "certification": vendor.certification or "None",
        "rating": vendor.rating,
        "response_time": vendor.response_time_hours,
        "verified": vendor.is_verified,
    }

    prompt = f"""
Given this vendor:

{json.dumps(vendor_data)}

Provide a 2-sentence insight and a match score from 0-100.

Return JSON like:
{{"score": 80, "explanation": "..."}}
"""

    try:
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            max_tokens=150,
        )

        content = response.choices[0].message.content.strip()

        if content.startswith("```json"):
            content = (
                content
                .replace("```json", "")
                .replace("```", "")
                .strip()
            )

        return json.loads(content)

    except Exception as e:
        print(
            f"AI vendor insight unavailable: {e}"
        )

        # Local fallback if OpenAI fails
        breakdown = calculate_match_breakdown(vendor)

        return {
            "score": breakdown["total"],
            "explanation": (
                "AI explanation unavailable. "
                "Showing vendor information based on "
                "available data."
            ),
        }


# ==============================================================================
# AI SEARCH SUGGESTIONS
# ==============================================================================

async def generate_suggestions(query: str) -> list[str]:
    """
    Generate AI-powered search suggestions.
    """

    if client and query.strip():
        prompt = f"""
Given the user's B2B supplier search query:

"{query}"

Suggest 4 smart search keywords or phrases to refine the search.

Return a JSON array of strings only.
"""

        try:
            response = await client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                max_tokens=100,
            )

            content = response.choices[0].message.content.strip()

            if content.startswith("```json"):
                content = (
                    content
                    .replace("```json", "")
                    .replace("```", "")
                    .strip()
                )

            suggestions = json.loads(content)

            if isinstance(suggestions, list):
                return [
                    str(item)
                    for item in suggestions[:4]
                ]

        except Exception as e:
            print(
                f"AI suggestions unavailable, "
                f"using fallback: {e}"
            )

    # Fallback suggestions
    words = [
        word
        for word in query.split()
        if len(word) > 2
    ]

    if not words:
        return [
            "ISO certified manufacturer",
            "steel supplier",
            "cotton apparel",
            "electronics factory",
        ]

    return [
        f"{word} manufacturer"
        for word in words[:3]
    ] + ["ISO certified"]


# ==============================================================================
# AI QUOTE RECOMMENDATION
# ==============================================================================

async def quote_recommendation(quotes: list) -> dict:
    """
    Recommend the best quote using AI or
    lowest-price fallback.
    """

    if not quotes:
        return {
            "best_vendor": None,
            "reason": "No quotes to recommend.",
        }

    # Try OpenAI if available
    if client:
        quote_data = [
            {
                "vendor": quote.get("vendor_name"),
                "price": quote.get("price"),
                "moq": quote.get("moq"),
                "delivery_days": quote.get(
                    "delivery_days"
                ),
                "warranty_months": quote.get(
                    "warranty_months"
                ),
                "certification": quote.get(
                    "vendor_certification"
                ),
            }
            for quote in quotes
        ]

        prompt = f"""
Given these vendor quotes:

{json.dumps(quote_data)}

Recommend the best value quote by considering:

- Price
- MOQ
- Delivery time
- Warranty
- Vendor certification

Return ONLY valid JSON with these fields:

{{
    "best_vendor": "vendor name",
    "reason": "2 sentence explanation"
}}
"""

        try:
            response = await client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                max_tokens=200,
            )

            content = response.choices[0].message.content.strip()

            if content.startswith("```json"):
                content = (
                    content
                    .replace("```json", "")
                    .replace("```", "")
                    .strip()
                )

            result = json.loads(content)

            if (
                isinstance(result, dict)
                and "best_vendor" in result
                and "reason" in result
            ):
                return result

        except Exception as e:
            print(
                "AI quote recommendation unavailable, "
                f"using fallback: {e}"
            )

    # Fallback: choose lowest price
    try:
        valid_quotes = [
            quote
            for quote in quotes
            if quote.get("price") is not None
        ]

        if valid_quotes:
            best = min(
                valid_quotes,
                key=lambda quote: float(
                    quote["price"]
                ),
            )

            return {
                "best_vendor": best.get(
                    "vendor_name"
                ),
                "reason": (
                    "This vendor has the lowest price "
                    "among the available quotes."
                ),
            }

    except Exception as e:
        print(
            f"Quote fallback error: {e}"
        )

    return {
        "best_vendor": None,
        "reason": "Unable to determine the best quote.",
    }


# ==============================================================================
# BUYER DASHBOARD RULE-BASED RECOMMENDATIONS
# ==============================================================================

def get_rule_based_recommendations(
    buyer_data: dict,
) -> list:
    """
    Generate procurement recommendations using
    simple business rules.
    """

    recommendations = []

    active = buyer_data.get(
        "active_rfqs",
        0,
    )

    if active == 0:
        recommendations.append(
            {
                "title": "Create your first RFQ",
                "description": (
                    "Start sourcing by creating a new RFQ "
                    "now to find the best suppliers."
                ),
                "action": "/rfq/create",
            }
        )
    else:
        recommendations.append(
            {
                "title": "Follow up on your active RFQs",
                "description": (
                    f"You have {active} active RFQs. "
                    "Send reminders to suppliers to get "
                    "a better price."
                ),
                "action": "/rfqs",
            }
        )

    saved = buyer_data.get(
        "saved_vendors_count",
        0,
    )

    if saved == 0:
        recommendations.append(
            {
                "title": "Save vendors you like",
                "description": (
                    "Save verified vendors to your favorites "
                    "to get personalized AI recommendations."
                ),
                "action": "/suppliers",
            }
        )
    else:
        recommendations.append(
            {
                "title": "Review your saved vendors",
                "description": (
                    "Compare your favorite suppliers' latest "
                    "quotes and performance."
                ),
                "action": "/saved-vendors",
            }
        )

    total_spent = buyer_data.get(
        "total_spending",
        0,
    )

    if total_spent > 10000:
        recommendations.append(
            {
                "title": "Consolidate suppliers",
                "description": (
                    "Your spending is high. You might save "
                    "5-10% by reducing your supplier count."
                ),
                "action": "/analytics",
            }
        )

    if len(recommendations) == 0:
        recommendations.append(
            {
                "title": "You're all set",
                "description": (
                    "Your procurement is on track. "
                    "Keep monitoring for new insights."
                ),
                "action": "/dashboard",
            }
        )

    return recommendations[:3]


# ==============================================================================
# BUYER DASHBOARD AI RECOMMENDATIONS
# ==============================================================================

async def generate_ai_recommendations(
    buyer_data: dict,
) -> list:
    """
    Generate AI-powered buyer dashboard recommendations.

    Falls back to rule-based recommendations when:
    - OpenAI is unavailable
    - API key is missing
    - OpenAI request fails
    - AI returns invalid JSON
    """

    try:
        from openai import AsyncOpenAI
    except ImportError:
        return get_rule_based_recommendations(
            buyer_data
        )

    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        return get_rule_based_recommendations(
            buyer_data
        )

    try:
        ai_client = AsyncOpenAI(
            api_key=api_key
        )

        recent_searches = buyer_data.get(
            "recent_searches",
            [],
        )

        categories = buyer_data.get(
            "categories",
            [],
        )

        prompt = f"""
You are an AI procurement assistant for VendorHub AI.

Buyer Data:
- Active RFQs: {buyer_data.get("active_rfqs", 0)}
- Total spending: ${buyer_data.get("total_spending", 0):.2f}
- Saved vendors: {buyer_data.get("saved_vendors_count", 0)}
- Recent searches: {
    ", ".join(recent_searches)
    if recent_searches
    else "None"
}
- Categories: {
    ", ".join(categories)
    if categories
    else "None"
}

Provide 3 professional B2B procurement recommendations.

Return ONLY a JSON array of objects with:
"title",
"description",
"action"
"""

        async with asyncio.timeout(5):
            response = await ai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "Return ONLY a valid JSON array."
                        ),
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    },
                ],
                temperature=0.7,
            )

        content = response.choices[0].message.content.strip()

        if content.startswith("```json"):
            content = (
                content
                .replace("```json", "")
                .replace("```", "")
                .strip()
            )

        recommendations = json.loads(content)

        if isinstance(recommendations, list):
            return recommendations[:3]

        return get_rule_based_recommendations(
            buyer_data
        )

    except Exception as e:
        print(
            "AI buyer recommendations unavailable, "
            f"using fallback: {e}"
        )

        return get_rule_based_recommendations(
            buyer_data
        )