from fastapi import Depends
from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials
)


security = HTTPBearer(
    auto_error=False
)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> int:

    """
    TEMPORARY TESTING AUTH.

    Returns user ID 1 until the real JWT
    authentication module is connected.
    """

    return 1