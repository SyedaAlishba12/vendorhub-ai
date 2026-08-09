import asyncio
import os
import json

def get_rule_based_recommendations(buyer_data: dict) -> list:
    recs = []
    active = buyer_data.get('active_rfqs', 0)
    if active == 0:
        recs.append({
            "title": "Create your first RFQ",
            "description": "Start sourcing by creating a new RFQ now.",
            "action": "/rfq/create"
        })
    else:
        recs.append({
            "title": "Follow up on your active RFQs",
            "description": f"You have {active} active RFQs. Send reminders to suppliers.",
            "action": "/rfq"
        })
    saved = buyer_data.get('saved_vendors_count', 0)
    if saved == 0:
        recs.append({
            "title": "Save vendors you like",
            "description": "Save vendors to get personalized AI recommendations.",
            "action": "/vendors"
        })
    else:
        recs.append({
            "title": "Review your saved vendors",
            "description": "Compare their latest quotes.",
            "action": "/saved-vendors"
        })
    if buyer_data.get('total_spending', 0) > 10000:
        recs.append({
            "title": "Consolidate suppliers",
            "description": "You might save costs by reducing supplier count.",
            "action": "/analytics"
        })
    if len(recs) == 0:
        recs.append({
            "title": "You're all set",
            "description": "Keep monitoring for new insights.",
            "action": "/dashboard"
        })
    return recs

async def generate_ai_recommendations(buyer_data: dict) -> list:
    try:
        from openai import AsyncOpenAI
    except ImportError:
        return get_rule_based_recommendations(buyer_data)

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return get_rule_based_recommendations(buyer_data)

    try:
        client = AsyncOpenAI(api_key=api_key)

        recent_searches = buyer_data.get('recent_searches', [])
        categories = buyer_data.get('categories', [])

        prompt = f"""
You are an AI procurement assistant for B2B sourcing platform.

Buyer's current data:
- Active RFQs: {buyer_data.get('active_rfqs', 0)}
- Pending quotations: {buyer_data.get('pending_quotations', 0)}
- Total spending: ${buyer_data.get('total_spending', 0):.2f}
- Saved vendors count: {buyer_data.get('saved_vendors_count', 0)}
- Recent searches: {', '.join(recent_searches) if recent_searches else 'None'}
- Categories of interest: {', '.join(categories) if categories else 'None'}

Provide 3 specific, actionable recommendations.
Format as JSON array of objects with fields: "title", "description", "action".
"""

        # 5-second timeout for AI call
        async with asyncio.timeout(5):
            response = await client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant. Return valid JSON array."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=300
            )
            content = response.choices[0].message.content.strip()
            recommendations = json.loads(content)
            if not isinstance(recommendations, list):
                raise ValueError("Not a list")
            return recommendations[:3]

    except asyncio.TimeoutError:
        print("AI call timed out, using fallback")
        return get_rule_based_recommendations(buyer_data)
    except Exception as e:
        print(f"AI error: {e}")
        return get_rule_based_recommendations(buyer_data)