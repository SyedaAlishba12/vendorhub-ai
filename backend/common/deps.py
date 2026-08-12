"""
common/deps.py — Shared FastAPI dependency stubs.

These are stable placeholders that other modules' auth layer will replace.
Keep function signatures (name + return type) unchanged so every route that
already imports them continues to work without modification.
"""

# ---------------------------------------------------------------------------
# Auth stub
# ---------------------------------------------------------------------------


async def get_current_user_id() -> str:
    """
    Dependency placeholder — returns a hardcoded user UUID for development.

    ┌──────────────────────────────────────────────────────────────────────┐
    │  TODO (auth module): Replace the body of this function with real JWT │
    │  / session token extraction.  The return type (str UUID) and the     │
    │  function name must stay the same — all routes depend on this exact  │
    │  signature.                                                           │
    │                                                                       │
    │  Example replacement:                                                 │
    │      async def get_current_user_id(                                   │
    │          token: str = Depends(oauth2_scheme),                         │
    │      ) -> str:                                                        │
    │          payload = decode_jwt(token)                                  │
    │          return payload["sub"]                                        │
    └──────────────────────────────────────────────────────────────────────┘

    Usage in a route:
        current_user_id: str = Depends(get_current_user_id)
    """
    return "00000000-0000-0000-0000-000000000001"
