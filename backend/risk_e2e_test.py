"""
backend/risk_e2e_test.py  -- Steps 4 already passed, this runs 5-7.
Run from project root: python backend/risk_e2e_test.py
"""
import json, os, sys, asyncio, urllib.request

BASE = "http://127.0.0.1:8000"
VENDOR_ID = "aaaabbbb-cccc-dddd-eeee-000000000099"
# id from step 4 run (we'll re-fetch to be self-contained)
REPORT_A_ID = "46ee1564-44fc-41a1-8764-50627e83838c"

def section(n, title):
    print(f"\n{'='*60}")
    print(f"STEP {n}: {title}")
    print('='*60)

def req(method, path, body=None):
    url = BASE + path
    data = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"} if data else {}
    r = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(r, timeout=30) as resp:
        return resp.status, json.loads(resp.read().decode())

# --------------------------------------------------------------------------
# STEP 5: Fallback test via direct module call (no server restart needed)
# --------------------------------------------------------------------------
section(5, "AI Fallback -- invalid key, expect rule-based recommendation, NOT empty")

env_path = "backend/.env"
with open(env_path, "r") as f:
    original_env = f.read()

# Find real key
real_key = ""
for line in original_env.splitlines():
    if line.startswith("GEMINI_API_KEY="):
        real_key = line.split("=", 1)[1].strip()

print(f"Real key present before fallback test: {bool(real_key)}")

# Set invalid key in env
os.environ["GEMINI_API_KEY"] = "TOTALLY_INVALID_KEY_FALLBACK_TEST"

sys.path.insert(0, ".")
from controllers import riskController as rc

# Reset cached model so it re-initialises with invalid key
rc._gemini_model = None

from controllers.riskController import compute_scores, generate_ai_recommendation

scores = compute_scores(
    business_age_years=2,
    certification_status="expired",
    annual_revenue_usd=180000,
    on_time_delivery_rate=0.76,
    complaint_rate=0.12,
)
print(f"Scores computed: {scores}")

loop = asyncio.new_event_loop()
recommendation, used_ai = loop.run_until_complete(
    generate_ai_recommendation(
        vendor_id=VENDOR_ID,
        financial_score=scores["financial_risk_score"],
        delivery_score=scores["delivery_risk_score"],
        overall_score=scores["overall_risk_score"],
        fraud_flags=scores["fraud_indicators"],
        certification_status="expired",
        business_age_years=2,
    )
)
loop.close()

print(f"\n  used_ai      : {used_ai}   <- should be False (rule-based fallback)")
print(f"  recommendation: {recommendation}")
assert not used_ai,   "FALLBACK FAILED: used_ai should be False with invalid key"
assert recommendation, "FALLBACK FAILED: recommendation is empty"
print("\n  PASS: fallback returns non-empty rule-based recommendation without crashing")

# Restore real key
os.environ["GEMINI_API_KEY"] = real_key
rc._gemini_model = None
print(f"\n  Real key restored. Key present: {bool(real_key)}, length: {len(real_key)}")

# --------------------------------------------------------------------------
# STEP 6: GET /api/risk/{vendorId} -- most recent report only
# --------------------------------------------------------------------------
section(6, "GET /api/risk/{vendorId} -- most recent report")
status, resp = req("GET", f"/api/risk/{VENDOR_ID}")
print(f"HTTP {status}")
d = resp["data"]
print(f"  id              : {d['id']}")
print(f"  overall_score   : {d['overall_risk_score']}/100")
print(f"  certification   : {d['certification_status']}")
print(f"  fraud_indicators: {d['fraud_indicators']}")
print(f"  ai_recommendation (first 200 chars): {d['ai_recommendation'][:200]}")
print(f"\n  Is this the most recent (report_a)? {d['id'] == REPORT_A_ID}")

# --------------------------------------------------------------------------
# STEP 7a: Second POST -- re-assess same vendor with improved data
# --------------------------------------------------------------------------
section("7a", "POST /api/risk/analyze -- second call, improved vendor data")
payload_b = {
    "vendorId": VENDOR_ID,
    "certificationStatus": "verified",
    "businessAgeYears": 7,
    "annualRevenueUsd": 1_200_000,
    "onTimeDeliveryRate": 0.96,
    "complaintRate": 0.02,
}
print(f"Request: {json.dumps(payload_b)}")
status, resp = req("POST", "/api/risk/analyze", payload_b)
print(f"\nHTTP {status}")
d2 = resp["data"]
print(f"  financial_risk_score : {d2['financial_risk_score']}/100")
print(f"  delivery_risk_score  : {d2['delivery_risk_score']}/100")
print(f"  overall_risk_score   : {d2['overall_risk_score']}/100  <- should be HIGHER than 35")
print(f"  fraud_indicators     : {d2['fraud_indicators']}  <- should be []")
print(f"  ai_used              : {d2.get('ai_used')}")
print(f"  ai_recommendation (first 300 chars): {d2['ai_recommendation'][:300]}")
report_b_id = d2["id"]
print(f"  report_b id: {report_b_id}")

assert d2["overall_risk_score"] > 35, f"Expected improved score > 35, got {d2['overall_risk_score']}"
assert d2["fraud_indicators"] == [], f"Expected no flags, got {d2['fraud_indicators']}"
print("\n  PASS: improved data -> higher score, no fraud flags")

# --------------------------------------------------------------------------
# STEP 7b: GET /api/risk/history -- both reports, newest first
# --------------------------------------------------------------------------
section("7b", "GET /api/risk/history -- both reports, newest first")
status, resp = req("GET", f"/api/risk/history?vendorId={VENDOR_ID}")
print(f"HTTP {status}")
hist = resp["data"]
print(f"\n  Total reports: {hist['count']}")
for i, r in enumerate(hist["reports"]):
    print(f"\n  Report #{i+1}:")
    print(f"    id            : {r['id']}")
    print(f"    overall_score : {r['overall_risk_score']}/100")
    print(f"    created_at    : {r['created_at']}")
    print(f"    fraud_flags   : {r['fraud_indicators']}")

assert hist["count"] >= 2, f"Expected >=2 reports, got {hist['count']}"
newest = hist["reports"][0]
assert newest["id"] == report_b_id, f"Expected newest to be report_b, got {newest['id']}"
print(f"\n  Newest report matches report_b: {newest['id'] == report_b_id}")
print("  PASS: history sorted newest first, both reports present")

print(f"\n{'='*60}")
print("STEPS 5-7 ALL PASSED")
print('='*60 + "\n")
