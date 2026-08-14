import asyncio

from services.email_service import (
    send_verification_email,
)


async def main():
    await send_verification_email(
        "syedaalishbakhatoon@gmail.com",
        "TEST_TOKEN_123",
    )


if __name__ == "__main__":
    asyncio.run(main())