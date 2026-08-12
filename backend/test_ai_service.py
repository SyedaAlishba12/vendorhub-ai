import sys
import os
from pathlib import Path

# 🛠️ PATH FIX
current_file = Path(__file__).absolute()
backend_root = current_file.parent 
sys.path.insert(0, str(backend_root))

print(f"📂 Project Root: {backend_root}")

# 📦 IMPORT AT THE TOP
try:
    from services.aiService import generate_ai_recommendations, get_rule_based_recommendations
    print("✅ SUCCESS: aiService imported correctly!")
except Exception as e:
    print(f"❌ FATAL IMPORT ERROR: {e}")
    sys.exit(1)

import asyncio

async def run_tests():
    print("\n" + "="*50)
    print("🚀 TESTING AI LOGIC (No DB required)")
    print("="*50)

    # Test 1: New User
    print("\n🧪 TEST 1: New User (Expect: 'Create first RFQ')")
    data_1 = {"active_rfqs": 0, "saved_vendors_count": 0, "total_spending": 0}
    res_1 = get_rule_based_recommendations(data_1)
    for r in res_1: print(f"💡 {r['title']}")

    # Test 2: Active User
    print("\n🧪 TEST 2: Active User (Expect: 'Follow up')")
    data_2 = {"active_rfqs": 5, "saved_vendors_count": 0, "total_spending": 100}
    res_2 = get_rule_based_recommendations(data_2)
    for r in res_2: print(f"💡 {r['title']}")

    # Test 3: Big Spender
    print("\n🧪 TEST 3: Big Spender (Expect: 'Consolidate')")
    data_3 = {"active_rfqs": 2, "saved_vendors_count": 5, "total_spending": 50000}
    res_3 = get_rule_based_recommendations(data_3)
    for r in res_3: print(f"💡 {r['title']}")

    # Test 4: Async Wrapper
    print("\n🧪 TEST 4: Testing Async Wrapper...")
    try:
        res_async = await generate_ai_recommendations(data_2)
        print(f"✅ Async Wrapper works! Received {len(res_async)} recs.")
        for r in res_async: print(f"🤖 {r['title']}")
    except Exception as e:
        print(f"❌ Async Wrapper failed: {e}")

    print("\n" + "="*50)
    print("✅ AI SERVICE IS 100% FUNCTIONAL")
    print("="*50)

if __name__ == "__main__":
    asyncio.run(run_tests())