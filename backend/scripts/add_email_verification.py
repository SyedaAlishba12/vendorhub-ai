import asyncio

from sqlalchemy import text

from database.connection import engine


async def add_email_verification_columns():
    async with engine.begin() as conn:

        await conn.execute(
            text(
                """
                ALTER TABLE users
                ADD COLUMN IF NOT EXISTS email_verified
                BOOLEAN NOT NULL DEFAULT FALSE
                """
            )
        )

        await conn.execute(
            text(
                """
                ALTER TABLE users
                ADD COLUMN IF NOT EXISTS verification_token
                VARCHAR UNIQUE
                """
            )
        )

        await conn.execute(
            text(
                """
                ALTER TABLE users
                ADD COLUMN IF NOT EXISTS verification_token_expires_at
                TIMESTAMPTZ
                """
            )
        )

    print(
        "✅ Email verification columns added successfully."
    )


if __name__ == "__main__":
    asyncio.run(
        add_email_verification_columns()
    )