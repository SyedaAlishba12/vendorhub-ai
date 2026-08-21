"""
controllers/negotiationController.py — Business logic for the AI Negotiation
Copilot module.

Architecture mirrors riskController.py exactly:
  1. _get_gemini_client()          — Lazy-init Gemini client; returns None on
                                     missing key or import failure (triggers fallback).
  2. _rule_based_suggestion()      — Deterministic fallback: produces a genuine,
                                     usable counter-offer template, not just an
                                     error string.
  3. generate_negotiation_draft()  — Gemini call with fail-silent fallback.
                                     Returns (draft_text: str, ai_used: bool).
  4. suggest()                     — Orchestrator called by the route; validates
                                     inputs and delegates to generate_negotiation_draft().

Design:
  - Stateless. No DB writes. No new models.
  - The generated text is returned to the frontend as a draft.
  - The buyer edits and sends it through the existing POST /api/messages path —
    it becomes a plain text MessageType.text message, indistinguishable from any
    other message in the conversation thread.

SDK: `from google import genai`  (google-genai package, NOT google.generativeai)
Model: gemini-2.0-flash
Async API: client.aio.models.generate_content(...)
"""

from __future__ import annotations

import os
from typing import Optional

from fastapi import HTTPException, status

# ---------------------------------------------------------------------------
# Gemini AI client — lazy-initialised on first call (mirrors riskController)
# ---------------------------------------------------------------------------
_gemini_client = None
_gemini_model = None  # sentinel; tests may reset via _gemini_model = None


def _get_gemini_client():
    """
    Initialise the Gemini async client once and cache it.
    Returns None if the API key is missing or the library isn't installed,
    which will trigger the rule-based fallback — identical pattern to
    riskController._get_gemini_client().
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
        _gemini_model = True  # sentinel so tests can reset via _gemini_model = None
        return _gemini_client
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Rule-based fallback — a genuinely usable negotiation template
# ---------------------------------------------------------------------------


def _rule_based_suggestion(
    vendor_name: str,
    item_description: str,
    quoted_price: float,
    target_price: float,
    currency: str,
    notes: Optional[str],
) -> str:
    """
    Produce a polished, ready-to-send counter-offer message when the AI API
    is unavailable.  This is a real template, not an error string — the buyer
    should be able to send it without editing if they choose.

    Structure:
      1. Acknowledgement of the vendor's quote
      2. Interest confirmation (avoids sounding adversarial)
      3. Specific counter-offer with reasoning
      4. Invitation to continue discussion
      5. Professional close
    """
    gap = quoted_price - target_price
    gap_pct = (gap / quoted_price * 100) if quoted_price > 0 else 0

    # Choose a softness level based on how large the gap is
    if gap_pct <= 5:
        reasoning = (
            f"Our internal benchmarks and recent market comparisons suggest a "
            f"range closer to {currency}{target_price:,.2f} for this specification."
        )
    elif gap_pct <= 15:
        reasoning = (
            f"After reviewing comparable sourcing costs in our network, we believe "
            f"{currency}{target_price:,.2f} better aligns with current market rates "
            f"for this volume and specification."
        )
    else:
        reasoning = (
            f"Given our procurement budget for this cycle and recent competitive "
            f"quotes we have received, we would need to see a price closer to "
            f"{currency}{target_price:,.2f} to move forward with your proposal."
        )

    notes_line = ""
    if notes and notes.strip():
        notes_line = f"\n\nAdditional context: {notes.strip()}"

    return (
        f"Dear {vendor_name} Team,\n\n"
        f"Thank you for your quotation for {item_description}. We appreciate the "
        f"detail you have provided and are genuinely interested in establishing a "
        f"supply relationship with your organisation.\n\n"
        f"Having reviewed your quoted price of {currency}{quoted_price:,.2f}, "
        f"we would like to propose a counter-offer of "
        f"{currency}{target_price:,.2f} per unit. "
        f"{reasoning}{notes_line}\n\n"
        f"We are committed to building a long-term partnership and believe there is "
        f"room to reach a mutually beneficial agreement. Please let us know if this "
        f"revised figure is workable on your end, or if there are other terms "
        f"(payment schedule, minimum order quantity, lead time) where you have "
        f"flexibility that might allow us to meet closer to your original price.\n\n"
        f"We look forward to your response and hope to finalise this together.\n\n"
        f"Best regards"
    )


# ---------------------------------------------------------------------------
# AI draft generation (Gemini, with rule-based fallback)
# ---------------------------------------------------------------------------


async def generate_negotiation_draft(
    vendor_name: str,
    item_description: str,
    quoted_price: float,
    target_price: float,
    currency: str,
    notes: Optional[str],
) -> tuple[str, bool]:
    """
    Generate a negotiation counter-offer draft using the Gemini API.

    Returns:
        (draft_text: str, ai_used: bool)
        ai_used=False means the rule-based fallback was used.

    Fallback triggers (identical to riskController):
      - GEMINI_API_KEY not set
      - google-genai not installed
      - Any API error (network, quota, safety filter, empty response, etc.)
    """
    client = _get_gemini_client()
    if client is None:
        return (
            _rule_based_suggestion(
                vendor_name, item_description, quoted_price, target_price, currency, notes
            ),
            False,
        )

    gap = quoted_price - target_price
    gap_pct = round(gap / quoted_price * 100, 1) if quoted_price > 0 else 0

    notes_section = (
        f"\nAdditional context from the buyer: {notes.strip()}"
        if notes and notes.strip()
        else ""
    )

    prompt = f"""You are an expert B2B procurement negotiator writing on behalf of a buyer on VendorHub AI, a B2B sourcing platform.

The buyer needs to send a professional counter-offer message to a vendor. Here are the details:

- Vendor name: {vendor_name}
- Item / service being quoted: {item_description}
- Vendor's quoted price: {currency}{quoted_price:,.2f}
- Buyer's target price: {currency}{target_price:,.2f}
- Price gap: {currency}{gap:,.2f} ({gap_pct}% reduction requested){notes_section}

Write a professional, polished counter-offer message that:
1. Opens by acknowledging and thanking the vendor for their quote (warm but concise)
2. Confirms genuine interest in the vendor and the item (not adversarial)
3. Proposes the target price of {currency}{target_price:,.2f} with a brief, credible justification
4. Invites further discussion — mentions openness to negotiating on other terms (payment terms, MOQ, lead time) if price cannot move
5. Closes professionally

Tone: professional, respectful, and collaborative — not aggressive or demanding.
Format: plain paragraph prose, ready to copy-paste into a chat window.
Length: 3–5 paragraphs. Do NOT use bullet points or headers.
Start directly with "Dear {vendor_name} Team," — no preamble."""

    try:
        response = await client.aio.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt,
        )
        text = (response.text or "").strip()
        if not text:
            raise ValueError("Empty response from Gemini")
        return text, True
    except Exception as exc:
        # Fail-silent — never surface the AI error to the caller.
        print(
            f"[negotiationController] Gemini API call failed "
            f"({type(exc).__name__}: {exc}). Using rule-based fallback."
        )
        return (
            _rule_based_suggestion(
                vendor_name, item_description, quoted_price, target_price, currency, notes
            ),
            False,
        )


# ---------------------------------------------------------------------------
# Orchestrator — called by the route
# ---------------------------------------------------------------------------


async def suggest(
    vendor_name: str,
    item_description: str,
    quoted_price: float,
    target_price: float,
    currency: str = "USD $",
    notes: Optional[str] = None,
) -> dict:
    """
    Validate inputs and return an AI-generated (or fallback) negotiation draft.

    Returns a dict matching the NegotiationSuggestionResponse schema:
        {
            "draft":    str,   # the full ready-to-send message text
            "ai_used":  bool,  # True if Gemini generated it, False if rule-based
            "context":  dict,  # echoes the inputs for frontend convenience
        }
    """
    # --- Input validation ---
    vendor_name = (vendor_name or "").strip()
    if not vendor_name:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="vendor_name is required and cannot be blank.",
        )

    item_description = (item_description or "").strip()
    if not item_description:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="item_description is required and cannot be blank.",
        )

    if quoted_price <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="quoted_price must be greater than 0.",
        )

    if target_price <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="target_price must be greater than 0.",
        )

    if target_price >= quoted_price:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "target_price must be lower than quoted_price. "
                "If accepting the price, no negotiation draft is needed."
            ),
        )

    # ---------------------------------------------------------------------------
    # Currency normalisation
    # ---------------------------------------------------------------------------
    # Accepted formats:
    #   "USD $"  → left as-is → "USD $14.50"   (recommended combined form)
    #   "$"      → left as-is → "$14.50"         (bare symbol — natural)
    #   "USD"    → "USD "     → "USD 14.50"      (bare code — add space)
    #   "EUR €"  → left as-is → "EUR €14.50"
    #
    # Rule: if the value contains no space AND every character is A-Z (all-alpha
    # ISO currency code), append a trailing space so the rendered price reads
    # "USD 14.50" instead of "USD14.50".
    currency = (currency or "USD $").strip()
    if currency and currency.isalpha():
        currency = currency + " "

    draft, ai_used = await generate_negotiation_draft(
        vendor_name=vendor_name,
        item_description=item_description,
        quoted_price=quoted_price,
        target_price=target_price,
        currency=currency,
        notes=notes,
    )

    return {
        "draft": draft,
        "ai_used": ai_used,
        "context": {
            "vendor_name":       vendor_name,
            "item_description":  item_description,
            "quoted_price":      quoted_price,
            "target_price":      target_price,
            "currency":          currency,
            "gap":               round(quoted_price - target_price, 2),
            "gap_pct":           round((quoted_price - target_price) / quoted_price * 100, 1),
            "notes":             notes or "",
        },
    }
