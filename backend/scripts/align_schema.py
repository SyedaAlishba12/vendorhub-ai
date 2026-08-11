import asyncio
from sqlalchemy import text
from database.connection import engine


async def align_schema():
    async with engine.begin() as conn:
        # Make user_id nullable (safe even if already nullable)
        await conn.execute(text("ALTER TABLE vendors ALTER COLUMN user_id DROP NOT NULL"))

        # Add FK constraint to users.id if it doesn't already exist (idempotent)
        await conn.execute(text("""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'vendors_user_id_fkey'
                ) THEN
                    ALTER TABLE vendors
                    ADD CONSTRAINT vendors_user_id_fkey
                    FOREIGN KEY (user_id) REFERENCES users(id);
                END IF;
            END $$;
        """))

    print("✅ vendors.user_id aligned: nullable + linked to users.id (safe to re-run anytime).")


if __name__ == "__main__":
    asyncio.run(align_schema())
