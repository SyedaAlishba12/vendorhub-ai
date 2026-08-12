"""
controllers/integrationsController.py — Business logic for the
AI Provider Integration Hub.

Architecture mirrors riskController.py / negotiationController.py:
  1. _get_gemini_client()   — Lazy-init Gemini client (identical pattern).
  2. get_integration_status() — Pings Gemini with a minimal probe call and
                                 maps the result to one of four named statuses.

Status values (mutually exclusive):
  "connected"      — Gemini responded successfully.
  "quota_exceeded" — HTTP 429 / RESOURCE_EXHAUSTED detected.
  "no_key"         — GEMINI_API_KEY env var is missing or blank.
  "error"          — Any other exception (network, import failure, etc.)

The 429 / quota case is detected by inspecting the exception message for
known marker strings from the Google API error payload — the same strings
we observed in the server log during the testing session
("RESOURCE_EXHAUSTED", "429", "quota_exceeded", "GenerateRequestsPerDay").
This is intentionally broader than a status-code check because the
google-genai SDK wraps 429s in a generic exception, not an HTTPStatusError.
"""

from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Optional

# ---------------------------------------------------------------------------
# Gemini client — lazy-init, identical to riskController / negotiationController
# ---------------------------------------------------------------------------

_gemini_client = None
_gemini_model  = None  # sentinel; tests may reset via _gemini_model = None


def _get_gemini_client():
    """
    Initialise the Gemini async client once and cache it.
    Returns None when GEMINI_API_KEY is absent or the library is missing.
    """
    global _gemini_client, _gemini_model
    if _gemini_client is not None and _gemini_model is not None:
        return _gemini_client

    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return None

    try:
        from google import genai  # noqa: PLC0415  (google-genai package)
        _gemini_client = genai.Client(api_key=api_key)
        _gemini_model  = True
        return _gemini_client
    except Exception:
        return None


# ---------------------------------------------------------------------------
# 429 / quota fingerprint detection
# ---------------------------------------------------------------------------

# Known strings that appear in the exception message when Gemini returns a
# quota / rate-limit error.  Checked case-insensitively.
_QUOTA_MARKERS = (
    "resource_exhausted",
    "quota_exceeded",
    "generatecontentfreetierre",   # partial match for the quota metric name
    "generaterequest",             # GenerateRequestsPerDay... etc.
    "429",
    "rateLimitExceeded",
    "free tier",
)


def _is_quota_error(exc: Exception) -> bool:
    """Return True if the exception looks like a Gemini 429 / quota error."""
    msg = str(exc).lower()
    return any(marker.lower() in msg for marker in _QUOTA_MARKERS)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

GEMINI_MODEL = "gemini-2.0-flash"

_STATUS_CONNECTED      = "connected"
_STATUS_QUOTA_EXCEEDED = "quota_exceeded"
_STATUS_NO_KEY         = "no_key"
_STATUS_ERROR          = "error"


async def get_integration_status() -> dict:
    """
    Probe the Gemini API with a minimal request and return a status dict.

    Returns:
        {
            "provider":       "Google Gemini",
            "model":          "gemini-2.0-flash",
            "status":         "connected" | "quota_exceeded" | "no_key" | "error",
            "fallback_active": bool,   # True when AI is not available
            "checked_at":     ISO-8601 UTC timestamp,
            "detail":         str,     # human-readable note (not shown in UI by default)
        }
    """
    checked_at = datetime.now(timezone.utc).isoformat()

    # ── No key configured ───────────────────────────────────────────────────
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return {
            "provider":        "Google Gemini",
            "model":           GEMINI_MODEL,
            "status":          _STATUS_NO_KEY,
            "fallback_active": True,
            "checked_at":      checked_at,
            "detail":          "GEMINI_API_KEY is not set in the environment.",
        }

    client = _get_gemini_client()
    if client is None:
        # Key exists but client init failed (library not installed, etc.)
        return {
            "provider":        "Google Gemini",
            "model":           GEMINI_MODEL,
            "status":          _STATUS_ERROR,
            "fallback_active": True,
            "checked_at":      checked_at,
            "detail":          "Failed to initialise the google-genai client. Check that the package is installed.",
        }

    # ── Probe call — minimal token usage, just enough to get a real response ─
    try:
        response = await client.aio.models.generate_content(
            model=GEMINI_MODEL,
            contents="ping",   # one-token prompt; one-token expected response
        )
        text = (response.text or "").strip()
        return {
            "provider":        "Google Gemini",
            "model":           GEMINI_MODEL,
            "status":          _STATUS_CONNECTED,
            "fallback_active": False,
            "checked_at":      checked_at,
            "detail":          f"API responded successfully. Response preview: {text[:80]!r}",
        }

    except Exception as exc:
        # ── Distinguish quota / 429 from every other error ──────────────────
        if _is_quota_error(exc):
            return {
                "provider":        "Google Gemini",
                "model":           GEMINI_MODEL,
                "status":          _STATUS_QUOTA_EXCEEDED,
                "fallback_active": True,
                "checked_at":      checked_at,
                "detail": (
                    "Free-tier quota exhausted (HTTP 429 / RESOURCE_EXHAUSTED). "
                    "Rule-based fallbacks are active across all AI features. "
                    f"Raw: {str(exc)[:200]}"
                ),
            }
        # ── Generic error (network, safety filter, malformed response, etc.) ─
        return {
            "provider":        "Google Gemini",
            "model":           GEMINI_MODEL,
            "status":          _STATUS_ERROR,
            "fallback_active": True,
            "checked_at":      checked_at,
            "detail":          f"{type(exc).__name__}: {str(exc)[:200]}",
        }
