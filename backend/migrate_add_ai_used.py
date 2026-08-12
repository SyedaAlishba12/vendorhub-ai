"""
migrate_add_ai_used.py
======================
Adds the `ai_used` boolean column to the existing `risk_reports` table on the
shared Neon database, then backfills all pre-existing rows.

Run from the project root:
    python backend/migrate_add_ai_used.py

Safety guarantees
-----------------
* Only touches `risk_reports` — no other table is read or written.
* Uses `IF NOT EXISTS` for the ALTER, so running twice is a no-op.
* Backfill heuristic (used ONLY for the 8 legacy rows, not as an ongoing
  mechanism): a row is considered AI-generated if its ai_recommendation does
  NOT start with '[' — the rule-based fallback always produces text like
  "[Critical Risk] Overall score: …", so the leading bracket is a reliable
  discriminator for these known legacy rows.  New rows always have ai_used
  set correctly at write-time in riskController.analyze_vendor().
* Prints every row's id, score, and inferred ai_used value so you can
  sanity-check against the 8 real reports before the server restarts.
"""

import asyncio
import os
import sys

sys.path.insert(0, ".")
from dotenv import load_dotenv
load_dotenv("backend/.env", override=True)

_RAW = os.getenv("DATABASE_URL", "")
_NEEDS_SSL = "sslmode=require" in _RAW
DATABASE_URL = _RAW.split("?")[0]
_CONNECT_ARGS = {"ssl": "require"} if _NEEDS_SSL else {}

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text


async def main() -> None:
    engine = create_async_engine(DATABASE_URL, echo=False, connect_args=_CONNECT_ARGS)

    async with engine.begin() as conn:
        # ------------------------------------------------------------------
        # Step 1: Add the column (idempotent — IF NOT EXISTS)
        # ------------------------------------------------------------------
        print("\n[1/3] Adding ai_used column (IF NOT EXISTS) …")
        await conn.execute(text("""
            ALTER TABLE risk_reports
            ADD COLUMN IF NOT EXISTS ai_used BOOLEAN NOT NULL DEFAULT false;
        """))
        print("      Column added (or already existed).")

        # ------------------------------------------------------------------
        # Step 2: Backfill — inspect existing rows and set ai_used
        #
        # Heuristic: rule-based fallback ALWAYS produces text starting with
        # '[Low Risk]', '[Moderate Risk]', '[High Risk]', or '[Critical Risk]'.
        # If the recommendation does NOT start with '[', it came from Gemini.
        # This is only used here for the 8 legacy rows — new rows are set at
        # write-time.
        # ------------------------------------------------------------------
        print("\n[2/3] Backfilling ai_used for legacy rows …")

        rows = await conn.execute(text("""
            SELECT id, overall_risk_score, ai_recommendation
            FROM   risk_reports
            ORDER  BY created_at ASC;
        """))
        rows = rows.fetchall()

        print(f"\n      Found {len(rows)} rows:")
        print(f"      {'id':<38}  {'score':>5}  {'inferred_ai_used':>16}  recommendation (first 60 chars)")
        print(f"      {'-'*38}  {'-'*5}  {'-'*16}  {'-'*60}")

        for row in rows:
            rid, score, rec = row
            # Rule-based recommendations always start with '['; AI prose does not.
            inferred_ai_used = not (rec or "").startswith("[")
            print(f"      {str(rid):<38}  {score:>5}  {str(inferred_ai_used):>16}  {(rec or '')[:60]}")

        # Apply the backfill — set ai_used=true only for rows where the
        # recommendation does NOT begin with the rule-based prefix '['.
        await conn.execute(text("""
            UPDATE risk_reports
            SET    ai_used = (ai_recommendation NOT LIKE '[%')
            WHERE  ai_used = false;
        """))
        print("\n      Backfill complete.")

        # ------------------------------------------------------------------
        # Step 3: Verify final state
        # ------------------------------------------------------------------
        print("\n[3/3] Final state of risk_reports (ai_used column):")
        result = await conn.execute(text("""
            SELECT
                id,
                overall_risk_score,
                certification_status,
                ai_used,
                created_at::date AS report_date
            FROM   risk_reports
            ORDER  BY created_at ASC;
        """))
        final_rows = result.fetchall()

        ai_true_count  = sum(1 for r in final_rows if r[3] is True)
        ai_false_count = sum(1 for r in final_rows if r[3] is False)

        print(f"\n      {'id':<38}  {'score':>5}  {'cert':>10}  {'ai_used':>7}  date")
        print(f"      {'-'*38}  {'-'*5}  {'-'*10}  {'-'*7}  ----------")
        for r in final_rows:
            rid, score, cert, ai_used, date = r
            print(f"      {str(rid):<38}  {score:>5}  {cert:>10}  {str(ai_used):>7}  {date}")

        print(f"\n      Summary: {len(final_rows)} rows total")
        print(f"               ai_used=True  : {ai_true_count}")
        print(f"               ai_used=False : {ai_false_count}")

    await engine.dispose()
    print("\nDONE: Migration complete.\n")


if __name__ == "__main__":
    asyncio.run(main())
