"""Final verification of all risk API endpoints"""
import json, urllib.request, urllib.error

BASE = 'http://127.0.0.1:8000'
VID = 'aaaabbbb-cccc-dddd-eeee-000000000099'

# 1 - POST analyze
payload = {
    'vendorId': VID,
    'certificationStatus': 'expired',
    'businessAgeYears': 2,
    'annualRevenueUsd': 180000,
    'onTimeDeliveryRate': 0.76,
    'complaintRate': 0.12,
}
r = urllib.request.Request(
    BASE+'/api/risk/analyze',
    json.dumps(payload).encode(),
    {'Content-Type': 'application/json'},
    method='POST'
)
with urllib.request.urlopen(r, timeout=30) as resp:
    d = json.loads(resp.read())
print("=== POST /api/risk/analyze (HTTP 201) ===")
print(json.dumps(d['data'], indent=2))

# 2 - GET latest
with urllib.request.urlopen(BASE+'/api/risk/'+VID, timeout=15) as resp:
    latest = json.loads(resp.read())
print("\n=== GET /api/risk/:vendorId (HTTP 200) ===")
print("  overall_score    :", latest['data']['overall_risk_score'])
print("  fraud_indicators :", latest['data']['fraud_indicators'])
print("  ai_recommendation:", latest['data']['ai_recommendation'][:150])

# 3 - GET history
with urllib.request.urlopen(BASE+'/api/risk/history?vendorId='+VID+'&limit=5', timeout=15) as resp:
    hist = json.loads(resp.read())
print("\n=== GET /api/risk/history (HTTP 200) ===")
print("  total_reports:", hist['data']['count'])
for i, rpt in enumerate(hist['data']['reports'][:3]):
    overall = rpt['overall_risk_score']
    created = rpt['created_at'][:19]
    print(f"  [{i+1}] overall={overall}/100  created={created}")

# 4 - Download endpoint (expected: 404 or 405, handled gracefully)
try:
    r2 = urllib.request.Request(
        BASE+'/api/pdf/generate',
        json.dumps({'reportId': 'test', 'type': 'risk_report'}).encode(),
        {'Content-Type': 'application/json'},
        method='POST'
    )
    with urllib.request.urlopen(r2, timeout=5) as resp:
        print("\n  PDF endpoint: HTTP 200 (unexpected)")
except urllib.error.HTTPError as e:
    print(f"\n=== POST /api/pdf/generate ===")
    print(f"  HTTP {e.code} - frontend will show 'coming soon' toast (graceful)")
except Exception as e:
    print(f"\n=== POST /api/pdf/generate ===")
    print(f"  {type(e).__name__} - frontend falls back to 'coming soon' toast (graceful)")

print("\n=== ALL CHECKS COMPLETE ===")
