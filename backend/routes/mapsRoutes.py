from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from controllers.mapsController import geocode_address

router = APIRouter(prefix="/api/maps", tags=["Maps"])

class GeocodeRequest(BaseModel):
    address: str = Field(..., min_length=1, max_length=1000, description="Address string to geocode")

def _ok(data: object, status_code: int = 200) -> JSONResponse:
    """Standard success envelope."""
    return JSONResponse(
        status_code=status_code,
        content={"success": True, "data": data},
    )

@router.post(
    "/geocode",
    summary="Geocode an address",
    response_description="Latitude, longitude, and formatted display name.",
    status_code=200,
)
async def route_geocode(body: GeocodeRequest) -> JSONResponse:
    """
    **POST /api/maps/geocode**
    
    Geocodes a given address string into coordinates using OpenStreetMap Nominatim.
    """
    data = await geocode_address(body.address)
    return _ok(data)