import asyncio

from sqlalchemy import text

from database.connection import engine


async def add_two_factor_columns():
    async with engine.begin() as conn:

        await conn.execute(
            text("""
                ALTER TABLE users
                ADD COLUMN IF NOT EXISTS
                two_factor_enabled
                BOOLEAN DEFAULT FALSE
            """)
        )

        await conn.execute(
            text("""
                ALTER TABLE users
                ADD COLUMN IF NOT EXISTS
                two_factor_code
                VARCHAR
            """)
        )

        await conn.execute(
            text("""
                ALTER TABLE users
                ADD COLUMN IF NOT EXISTS
                two_factor_code_expires_at
                TIMESTAMPTZ
            """)
        )

    print(
        "✅ Two-factor authentication columns added."
    )


if __name__ == "__main__":
    asyncio.run(
        add_two_factor_columns()
    )