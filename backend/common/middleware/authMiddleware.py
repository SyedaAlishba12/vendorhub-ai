from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer(auto_error=False)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> int:
    """
    TEMPORARY TESTING AUTH - returns user ID 1
    Replace with real JWT verification when Sayeel's module is ready.
    """
    # For now, always return user id 1 (the seeded buyer)
    return 1