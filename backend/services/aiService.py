import asyncio
import os
import json

# ==============================================================================
# 🛠️ RULE-BASED FALLBACK (Pure Python - No Project Imports)
# ==============================================================================
def get_rule_based_recommendations(buyer_data: dict) -> list:
    recs = []
    
    active = buyer_data.get('active_rfqs', 0)
    if active == 0:
        recs.append({
            "title": "Create your first RFQ",
            "description": "Start sourcing by creating a new RFQ now to find the best suppliers.",
            "action": "/rfq/create"
        })
    else:
        recs.append({
            "title": "Follow up on your active RFQs",
            "description": f"You have {active} active RFQs. Send reminders to suppliers to get a better price.",
            "action": "/rfqs"
        })

    saved = buyer_data.get('saved_vendors_count', 0)
    if saved == 0:
        recs.append({
            "title": "Save vendors you like",
            "description": "Save verified vendors to your favorites to get personalized AI recommendations.",
            "action": "/suppliers"
        })
    else:
        recs.append({
            "title": "Review your saved vendors",
            "description": "Compare your favorite suppliers' latest quotes and performance.",
            "action": "/saved-vendors"
        })

    total_spent = buyer_data.get('total_spending', 0)
    if total_spent > 10000:
        recs.append({
            "title": "Consolidate suppliers",
            "description": "Your spending is high. You might save 5-10% by reducing your supplier count.",
            "action": "/analytics"
        })

    if len(recs) == 0:
        recs.append({
            "title": "You're all set",
            "description": "Your procurement is on track. Keep monitoring for new insights.",
            "action": "/dashboard"
        })

    return recs[:3]

# ==============================================================================
# 🤖 REAL AI GENERATION (Pure Python - No Project Imports)
# ==============================================================================
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
        You are an AI procurement assistant for VendorHub AI.
        Buyer Data:
        - Active RFQs: {buyer_data.get('active_rfqs', 0)}
        - Total spending: ${buyer_data.get('total_spending', 0):.2f}
        - Saved vendors: {buyer_data.get('saved_vendors_count', 0)}
        - Recent searches: {', '.join(recent_searches) if recent_searches else 'None'}
        - Categories: {', '.join(categories) if categories else 'None'}

        Provide 3 professional B2B procurement recommendations. 
        Return ONLY a JSON array of objects with "title", "description", "action".
        """

        async with asyncio.timeout(5):
            response = await client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Return ONLY a valid JSON array."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            content = response.choices[0].message.content.strip()
            if content.startswith("```json"):
                content = content.replace("```json", "").replace("```", "").strip()
            
            recommendations = json.loads(content)
            return recommendations[:3]

    except Exception:
        return get_rule_based_recommendations(buyer_data)