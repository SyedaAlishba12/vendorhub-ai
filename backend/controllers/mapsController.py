import urllib.parse
import asyncio
import requests
from fastapi import HTTPException, status

async def geocode_address(address: str) -> dict:
    """
    Lightweight geocoding lookup using Nominatim (OpenStreetMap).
    Requires no API key, but requires a descriptive User-Agent.
    """
    if not address or not address.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Address cannot be empty."
        )

    # Nominatim requires a proper User-Agent per usage policy
    headers = {
        "User-Agent": "VendorHubAI/1.0 (contact@vendorhub.local)"
    }
    
    url = f"https://nominatim.openstreetmap.org/search?q={urllib.parse.quote(address.strip())}&format=json&limit=1"
    
    def fetch():
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        return response.json()
        
    try:
        data = await asyncio.to_thread(fetch)
        if not data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Address not found."
            )
            
        first_result = data[0]
        return {
            "lat": float(first_result["lat"]),
            "lng": float(first_result["lon"]),
            "display_name": first_result["display_name"]
        }
    except requests.RequestException as e:
        print(f"[mapsController] Geocoding API error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error communicating with geocoding service."
        )