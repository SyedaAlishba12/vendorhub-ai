"""
backend/test_gemini_live.py
Tests the live Gemini AI path with verbose error output.
Run: python backend/test_gemini_live.py
"""
import asyncio, os, sys, json
sys.path.insert(0, ".")
from dotenv import load_dotenv
load_dotenv("backend/.env", override=True)

# ── Step 1: Key check ─────────────────────────────────────────────────────────
key = os.environ.get("GEMINI_API_KEY", "")
print("=" * 60)
print("STEP 1 — GEMINI_API_KEY")
print("=" * 60)
print(f"  Present : {bool(key)}")
print(f"  Length  : {len(key)}")
print(f"  Prefix  : {key[:10]}..." if key else "  (empty)")

if not key:
    print("\n[FATAL] Key is empty. Add GEMINI_API_KEY to backend/.env")
    sys.exit(1)

# ── Step 2: Direct Gemini SDK test (bypass the server) ───────────────────────
print("\n" + "=" * 60)
print("STEP 2 — Direct SDK test (google.genai client)")
print("=" * 60)

async def test_gemini_direct():
    try:
        from google import genai
        client = genai.Client(api_key=key)
        print("  SDK imported OK, client created")
        
        response = await client.aio.models.generate_content(
            model="gemini-1.5-flash",
            contents="Reply with exactly 5 words confirming you are working.",
        )
        text = (response.text or "").strip()
        print(f"  Direct API response : {repr(text)}")
        return True, None
    except Exception as e:
        print(f"  FAILED: {type(e).__name__}: {e}")
        return False, str(e)

ok, err = asyncio.run(test_gemini_direct())

# ── Step 3: POST /api/risk/analyze — fresh moderate vendor ────────────────────
print("\n" + "=" * 60)
print("STEP 3 — POST /api/risk/analyze (fresh moderate vendor)")
print("=" * 60)

import urllib.request, urllib.error

BASE = "http://127.0.0.1:8000"

payload_a = {
    "vendorId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",   # fresh UUID
    "certificationStatus": "verified",
    "businessAgeYears": 4,
    "annualRevenueUsd": 450000,
    "onTimeDeliveryRate": 0.89,
    "complaintRate": 0.05,
}
print("Request body:")
print(json.dumps(payload_a, indent=2))

try:
    r = urllib.request.Request(
        BASE + "/api/risk/analyze",
        json.dumps(payload_a).encode(),
        {"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(r, timeout=60) as resp:
        data_a = json.loads(resp.read())["data"]

    print(f"\nHTTP 201")
    print(f"  id                   : {data_a['id']}")
    print(f"  financial_risk_score : {data_a['financial_risk_score']}/100")
    print(f"  delivery_risk_score  : {data_a['delivery_risk_score']}/100")
    print(f"  overall_risk_score   : {data_a['overall_risk_score']}/100")
    print(f"  fraud_indicators     : {data_a['fraud_indicators']}")
    print(f"  ai_used              : {data_a.get('ai_used')}")
    print(f"\n  --- ai_recommendation (VERBATIM) ---")
    print(f"  {data_a['ai_recommendation']}")
    print(f"  ------------------------------------")

except Exception as e:
    print(f"  ERROR calling /api/risk/analyze: {e}")
    sys.exit(1)

# ── Step 4: If ai_used is False, show the actual exception from the controller ─
if not data_a.get("ai_used"):
    print("\n" + "=" * 60)
    print("STEP 4 — ai_used=False: diagnosing exact Gemini error")
    print("=" * 60)

    async def diagnose():
        from controllers.riskController import (
            compute_scores, generate_ai_recommendation,
        )
        import backend.controllers.riskController as rc
        rc._gemini_client = None
        rc._gemini_model = None

        scores = compute_scores(
            business_age_years=4,
            certification_status="verified",
            annual_revenue_usd=450000,
            on_time_delivery_rate=0.89,
            complaint_rate=0.05,
        )
        
        # Temporarily monkey-patch to capture the real exception
        orig_print = __builtins__["print"] if isinstance(__builtins__, dict) else print
        import io, contextlib

        buf = io.StringIO()
        with contextlib.redirect_stdout(buf):
            rec, used = await generate_ai_recommendation(
                vendor_id="f47ac10b-58cc-4372-a567-0e02b2c3d479",
                financial_score=scores["financial_risk_score"],
                delivery_score=scores["delivery_risk_score"],
                overall_score=scores["overall_risk_score"],
                fraud_flags=scores["fraud_indicators"],
                certification_status="verified",
                business_age_years=4,
            )
        captured = buf.getvalue()
        print(f"  Controller log output:\n  {captured.strip()}")
        print(f"  used_ai : {used}")
        print(f"  recommendation: {rec}")

    asyncio.run(diagnose())
    print("\n  Stopping here — re-run after quota resets.")

# ── Step 5: Second call (risky vendor) — only if Step 3 succeeded with AI ────
else:
    print("\n" + "=" * 60)
    print("STEP 5 — Second call: clearly risky vendor (new business, expired cert)")
    print("=" * 60)

    payload_b = {
        "vendorId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",   # different UUID
        "certificationStatus": "expired",
        "businessAgeYears": 0,            # brand new (< 6 months)
        "annualRevenueUsd": 18000,        # very low revenue
        "onTimeDeliveryRate": 0.61,       # very poor delivery
        "complaintRate": 0.25,            # high complaints
    }
    print("Request body:")
    print(json.dumps(payload_b, indent=2))

    r2 = urllib.request.Request(
        BASE + "/api/risk/analyze",
        json.dumps(payload_b).encode(),
        {"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(r2, timeout=60) as resp:
        data_b = json.loads(resp.read())["data"]

    print(f"\nHTTP 201")
    print(f"  id                   : {data_b['id']}")
    print(f"  financial_risk_score : {data_b['financial_risk_score']}/100")
    print(f"  delivery_risk_score  : {data_b['delivery_risk_score']}/100")
    print(f"  overall_risk_score   : {data_b['overall_risk_score']}/100")
    print(f"  fraud_indicators     : {data_b['fraud_indicators']}")
    print(f"  ai_used              : {data_b.get('ai_used')}")
    print(f"\n  --- ai_recommendation (VERBATIM) ---")
    print(f"  {data_b['ai_recommendation']}")
    print(f"  ------------------------------------")

    print("\n" + "=" * 60)
    print("COMPARISON")
    print("=" * 60)
    print(f"  Vendor A (moderate): overall={data_a['overall_risk_score']}/100  ai_used={data_a.get('ai_used')}")
    print(f"  Vendor B (critical) : overall={data_b['overall_risk_score']}/100  ai_used={data_b.get('ai_used')}")
    recs_differ = data_a["ai_recommendation"] != data_b["ai_recommendation"]
    print(f"  Recommendations differ: {recs_differ}")
    if recs_differ:
        print("  PASS: AI tailors recommendations to different risk profiles")
    else:
        print("  WARN: Recommendations are identical — AI may be returning generic output")

print("\n" + "=" * 60)
print("DONE")
print("=" * 60)
