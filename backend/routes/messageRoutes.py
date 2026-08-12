"""
routes/messageRoutes.py — FastAPI APIRouter for the Messaging module.

All endpoints return a consistent JSON envelope:
    { "success": true,  "data": <payload> }    on success
    { "success": false, "message": "<text>" }  on error (via HTTPException)

Auth: get_current_user_id() is currently a stub (see common/deps.py).
Replace its implementation when the auth module is ready — every route
here will pick up the change automatically.

Router is registered in main.py under the prefix /api/messages.

Endpoint summary:
    GET    /api/messages                    → list conversations
    GET    /api/messages/{conversationId}   → paginated message history
    POST   /api/messages                    → send a text message
    DELETE /api/messages/{id}               → soft-delete a message
    POST   /api/messages/upload             → upload a file/image/voice note
"""

from typing import Optional

from fastapi import APIRouter, Depends, File, Query, UploadFile, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from common.deps import get_current_user_id
from controllers.messageController import (
    delete_message,
    get_messages,
    list_conversations,
    send_message,
    upload_file,
)
from database.session import get_db

router = APIRouter(prefix="/api/messages", tags=["Messages"])


# ---------------------------------------------------------------------------
# Pydantic request schemas
# ---------------------------------------------------------------------------


class SendMessageRequest(BaseModel):
    """Request body for POST /api/messages."""

    conversationId: str = Field(
        ...,
        description="UUID of the target conversation.",
        examples=["3fa85f64-5717-4562-b3fc-2c963f66afa6"],
    )
    content: str = Field(
        ...,
        min_length=1,
        max_length=10_000,
        description="Text body of the message (max 10,000 characters).",
    )


# ---------------------------------------------------------------------------
# Response envelope helpers
# ---------------------------------------------------------------------------


def _ok(data: object, status_code: int = 200) -> JSONResponse:
    """Wrap a payload in the standard success envelope."""
    return JSONResponse(
        status_code=status_code,
        content={"success": True, "data": data},
    )


# FastAPI's exception_handler for HTTPException automatically produces the
# error shape from the raised detail string.  Routes don't need a manual
# _err() helper — raise HTTPException(status_code=..., detail="...") instead.


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@router.get(
    "",
    summary="List conversations",
    response_description="Conversation list with last-message preview and unread count.",
    status_code=200,
)
async def route_list_conversations(
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
) -> JSONResponse:
    """
    **GET /api/messages**

    Returns all conversations the authenticated user participates in,
    ordered by most-recent activity (last_message_at) descending.

    Each conversation entry includes:
    - `participant_ids`: list of participant UUIDs
    - `last_message`: preview of the most recent non-deleted message
    - `unread_count`: number of messages in this conversation not yet read by the user
    - `last_message_at`: timestamp for client-side sorting
    """
    data = await list_conversations(db, current_user_id)
    return _ok(data)


@router.get(
    "/{conversation_id}",
    summary="Get message history (paginated)",
    response_description="Page of messages for a conversation.",
    status_code=200,
)
async def route_get_messages(
    conversation_id: str,
    limit: int = Query(
        default=50,
        ge=1,
        le=200,
        description="Number of messages to return per page.",
    ),
    before_id: Optional[str] = Query(
        default=None,
        description=(
            "Cursor for infinite-scroll pagination.  "
            "Pass the `id` of the oldest message currently displayed to "
            "fetch the next (earlier) page."
        ),
    ),
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
) -> JSONResponse:
    """
    **GET /api/messages/{conversationId}**

    Returns a page of messages in chronological order (oldest first within
    the page).  Reading a page marks the returned messages as read for the
    current user (side effect).

    **Pagination** (cursor-based):
    1. Initial load: omit `before_id` → fetches the most recent `limit` messages.
    2. Load more: pass `before_id=<id of oldest message on screen>` → fetches
       `limit` messages older than that message.
    3. Stop when `has_more` is `false`.
    """
    data = await get_messages(db, conversation_id, current_user_id, limit, before_id)
    return _ok(data)


@router.post(
    "",
    summary="Send a text message",
    response_description="The newly created message.",
    status_code=status.HTTP_201_CREATED,
)
async def route_send_message(
    body: SendMessageRequest,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
) -> JSONResponse:
    """
    **POST /api/messages**

    Send a text message to a conversation.

    The authenticated user must be a participant in the conversation
    (HTTP 403 otherwise).  The conversation's `last_message_at` is updated
    atomically with the message insert.
    """
    data = await send_message(db, body.conversationId, current_user_id, body.content)
    return _ok(data, status_code=status.HTTP_201_CREATED)


@router.delete(
    "/{message_id}",
    summary="Delete a message (soft delete)",
    response_description="Deletion confirmation with timestamp.",
    status_code=200,
)
async def route_delete_message(
    message_id: str,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
) -> JSONResponse:
    """
    **DELETE /api/messages/{id}**

    Soft-deletes a message — the row is retained but marked deleted, and
    its `content` and `file_url` are cleared.  Only the original sender
    may delete their own message (HTTP 403 otherwise).

    The conversation history stays consistent for other participants: the
    frontend should display a "This message was deleted" placeholder for
    tombstoned messages.
    """
    data = await delete_message(db, message_id, current_user_id)
    return _ok(data)


@router.post(
    "/upload",
    summary="Upload a file, image, or voice note",
    response_description="File URL and metadata for use in a message.",
    status_code=status.HTTP_201_CREATED,
)
async def route_upload_file(
    file: UploadFile = File(
        ...,
        description="File to upload.  See accepted types and size limits below.",
    ),
    current_user_id: str = Depends(get_current_user_id),
) -> JSONResponse:
    """
    **POST /api/messages/upload**

    Upload a file attachment.  Returns a `file_url` and `message_type` that
    the frontend can use immediately.

    **Accepted types and size limits:**
    | Type       | Formats                    | Max size |
    |------------|----------------------------|----------|
    | Images     | JPEG, PNG, GIF, WebP       | 10 MB    |
    | Documents  | PDF, Word (.doc/.docx), TXT| 10 MB    |
    | Voice notes| MP3, M4A, OGG, WAV, WebM   | 5 MB     |

    Files are stored at `backend/uploads/messages/<uuid>.<ext>`.
    Mount a `StaticFiles` route (or configure a CDN prefix) to serve them.
    """
    data = await upload_file(file, current_user_id)
    return _ok(data, status_code=status.HTTP_201_CREATED)
