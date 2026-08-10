"""
routes/integrationsRoutes.py — FastAPI APIRouter for the Integration Hub.

Endpoint summary:
    GET /api/integrations/status  → probe all registered AI providers and
                                    return their current health status.

Router is registered in main.py under the prefix /api/integrations.

Response envelope (same as all other routes):
    { "success": true, "data": { "integrations": [...] } }

The response is intentionally shaped as a list ("integrations": [...]) so
future providers (OpenAI, Anthropic, etc.) slot in below without a schema
change — the frontend card grid is already designed for multiple entries.
"""

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from controllers.integrationsController import get_integration_status

router = APIRouter(prefix="/api/integrations", tags=["Integrations"])


def _ok(data: object, status_code: int = 200) -> JSONResponse:
    """Standard success envelope — identical to all other route files."""
    return JSONResponse(
        status_code=status_code,
        content={"success": True, "data": data},
    )


@router.get(
    "/status",
    summary="Get AI provider integration health status",
    response_description=(
        "List of registered AI integrations with their current health status."
    ),
    status_code=200,
)
async def route_get_status() -> JSONResponse:
    """
    **GET /api/integrations/status**

    Probes each registered AI provider and returns current health status.

    **Status values per integration:**
    - `connected`      — Provider responded successfully.
    - `quota_exceeded` — Free-tier quota exhausted (HTTP 429). Rule-based
                         fallbacks are active for all features that use this provider.
    - `no_key`         — API key is not configured in the environment.
    - `error`          — Any other failure (network, library, etc.).

    **`fallback_active`:**
    `true` when the provider is unavailable and the platform has fallen back
    to its rule-based alternatives.  `false` only when `status == "connected"`.

    **Response shape:**
    ```json
    {
      "success": true,
      "data": {
        "integrations": [
          {
            "provider":       "Google Gemini",
            "model":          "gemini-2.0-flash",
            "status":         "quota_exceeded",
            "fallback_active": true,
            "checked_at":     "2026-08-10T08:11:00.000000+00:00",
            "detail":         "Free-tier quota exhausted..."
          }
        ]
      }
    }
    ```
    """
    gemini_status = await get_integration_status()

    # Shape the response as a list — future providers append here.
    return _ok({"integrations": [gemini_status]})
