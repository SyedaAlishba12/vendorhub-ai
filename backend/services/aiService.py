import os
import json

from openai import AsyncOpenAI
from services.matching import calculate_match_breakdown


# Optional OpenAI client if API key exists
client = (
    AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    if os.getenv("OPENAI_API_KEY")
    else None
)


def fallback_ranking(query: str, vendors: list) -> list:
    """Strict keyword-based relevance ranking (0-100)."""

    query_lower = query.lower()
    words = [w for w in query_lower.split() if len(w) > 2]

    scored = []

    for v in vendors:
        text = (
            f"{v.company_name} "
            f"{v.country} "
            f"{v.industry or ''} "
            f"{v.certification or ''}"
        ).lower()

        # Count matching words
        match_count = sum(1 for w in words if w in text)

        # Exact phrase in company name gets a big boost
        if query_lower in v.company_name.lower():
            match_count += 2

        # Country mention in query
        if v.country and v.country.lower() in query_lower:
            match_count += 1

        # Industry mention in query
        if v.industry and v.industry.lower() in query_lower:
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
            quality = (v.rating / 5) * 10 if v.rating else 0

            if v.is_verified:
                quality += 2

            if v.certification:
                quality += 2

            score = min(base + quality, 100)

        scored.append((score, v))

    scored.sort(key=lambda x: -x[0])

    return scored


async def ai_rank_vendors(query: str, vendors: list) -> list:
    """Rank vendors using OpenAI when available, otherwise use fallback ranking."""

    # No API key -> fallback
    if not client:
        scored = fallback_ranking(query, vendors)

        for score, v in scored:
            v.match_score = round(score)

        return [v for _, v in scored]

    vendor_data = [
        {
            "id": v.id,
            "name": v.company_name,
            "country": v.country,
            "industry": v.industry or "",
            "certification": v.certification or "",
            "rating": v.rating,
            "response_time": v.response_time_hours,
            "verified": v.is_verified,
        }
        for v in vendors
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
        items = json.loads(content)

        # Map vendors by ID
        id_map = {v.id: v for v in vendors}
        score_map = {
            item["id"]: item["score"]
            for item in items
        }

        ranked = []

        for item in items:
            if item["id"] in id_map:
                v = id_map[item["id"]]

                v.match_score = max(
                    0,
                    min(100, int(item["score"])),
                )

                ranked.append(v)

        # Add vendors not returned by AI
        for v in vendors:
            if v.id not in score_map:
                v.match_score = 0
                ranked.append(v)

        return ranked

    except Exception as e:
        print(f"AI vendor ranking unavailable, using fallback: {e}")

        scored = fallback_ranking(query, vendors)

        for score, v in scored:
            v.match_score = round(score)

        return [v for _, v in scored]


async def get_ai_vendor_insight(vendor) -> dict:
    """Generate an AI insight for a vendor."""

    # No OpenAI -> use local fallback
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

        return json.loads(content)

    except Exception as e:
        print(f"AI vendor insight unavailable: {e}")

        # Local fallback if OpenAI fails
        breakdown = calculate_match_breakdown(vendor)

        return {
            "score": breakdown["total"],
            "explanation": "AI explanation unavailable. Showing vendor information based on available data.",
        }


async def generate_suggestions(query: str) -> list[str]:
    """Generate AI-powered search suggestions."""

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
            suggestions = json.loads(content)

            if isinstance(suggestions, list):
                return [
                    str(item)
                    for item in suggestions[:4]
                ]

        except Exception as e:
            print(
                f"AI suggestions unavailable, using fallback: {e}"
            )

    # Fallback suggestions
    words = [
        w
        for w in query.split()
        if len(w) > 2
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


async def quote_recommendation(quotes: list) -> dict:
    """Recommend the best quote using AI or lowest-price fallback."""

    if not quotes:
        return {
            "best_vendor": None,
            "reason": "No quotes to recommend.",
        }

    # Try OpenAI if available
    if client:
        quote_data = [
            {
                "vendor": q.get("vendor_name"),
                "price": q.get("price"),
                "moq": q.get("moq"),
                "delivery_days": q.get("delivery_days"),
                "warranty_months": q.get("warranty_months"),
                "certification": q.get(
                    "vendor_certification"
                ),
            }
            for q in quotes
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

            result = json.loads(content)

            if (
                isinstance(result, dict)
                and "best_vendor" in result
                and "reason" in result
            ):
                return result

        except Exception as e:
            print(
                f"AI quote recommendation unavailable, using fallback: {e}"
            )

    # Fallback: choose lowest price
    try:
        valid_quotes = [
            q
            for q in quotes
            if q.get("price") is not None
        ]

        if valid_quotes:
            best = min(
                valid_quotes,
                key=lambda q: float(q["price"]),
            )

            return {
                "best_vendor": best.get("vendor_name"),
                "reason": (
                    "This vendor has the lowest price "
                    "among the available quotes."
                ),
            }

    except Exception as e:
        print(f"Quote fallback error: {e}")

    return {
        "best_vendor": None,
        "reason": "Unable to determine the best quote.",
    }