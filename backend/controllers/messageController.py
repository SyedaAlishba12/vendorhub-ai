"""
controllers/messageController.py — Business logic for the Messaging module.

Each async function receives a SQLAlchemy AsyncSession as its first argument
and either returns serialisable data (dicts / lists) or raises an HTTPException.
Routes call these functions and wrap results in the standard response envelope.

PostgreSQL ARRAY operations (ANY, array_append, NOT … ANY) are expressed as
text() fragments where the ORM lacks clean first-class support for those
constructs — this is a documented SQLAlchemy limitation for dialect-specific
ARRAY predicates.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import aiofiles
from fastapi import HTTPException, UploadFile, status
from sqlalchemy import func, select, text, update
from sqlalchemy.ext.asyncio import AsyncSession

from models.Conversation import Conversation
from models.Message import Message, MessageType

# ---------------------------------------------------------------------------
# File upload configuration
# ---------------------------------------------------------------------------

# Files land at:  backend/uploads/messages/<uuid>.<ext>
# The path resolves relative to this file so it works regardless of the CWD.
UPLOAD_DIR: Path = Path(__file__).resolve().parent.parent / "uploads" / "messages"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Per-type size limits
MAX_IMAGE_DOC_BYTES: int = 10 * 1024 * 1024  # 10 MB for images and documents
MAX_VOICE_BYTES: int = 5 * 1024 * 1024        # 5 MB for voice notes

# content-type → MessageType mapping; only listed types are accepted.
CONTENT_TYPE_MAP: dict[str, MessageType] = {
    # Images
    "image/jpeg": MessageType.image,
    "image/png":  MessageType.image,
    "image/gif":  MessageType.image,
    "image/webp": MessageType.image,
    # Documents
    "application/pdf":                                                             MessageType.document,
    "application/msword":                                                          MessageType.document,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":     MessageType.document,
    "text/plain":                                                                  MessageType.document,
    # Voice notes
    "audio/mpeg": MessageType.voice,
    "audio/mp4":  MessageType.voice,
    "audio/ogg":  MessageType.voice,
    "audio/wav":  MessageType.voice,
    "audio/webm": MessageType.voice,
}

# content-type → file extension for safe filename generation
EXTENSION_MAP: dict[str, str] = {
    "image/jpeg": "jpg",
    "image/png":  "png",
    "image/gif":  "gif",
    "image/webp": "webp",
    "application/pdf":    "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "text/plain":  "txt",
    "audio/mpeg":  "mp3",
    "audio/mp4":   "m4a",
    "audio/ogg":   "ogg",
    "audio/wav":   "wav",
    "audio/webm":  "weba",
}

# ---------------------------------------------------------------------------
# Serialisation helpers
# ---------------------------------------------------------------------------


def _conv_to_dict(conv: Conversation) -> dict:
    """Serialise a Conversation ORM instance to a JSON-safe dict."""
    return {
        "id":              str(conv.id),
        "participant_ids": [str(p) for p in (conv.participant_ids or [])],
        "created_at":      conv.created_at.isoformat()      if conv.created_at      else None,
        "updated_at":      conv.updated_at.isoformat()      if conv.updated_at      else None,
        "last_message_at": conv.last_message_at.isoformat() if conv.last_message_at else None,
    }


def _msg_to_dict(msg: Message) -> dict:
    """Serialise a Message ORM instance to a JSON-safe dict."""
    return {
        "id":              str(msg.id),
        "conversation_id": str(msg.conversation_id),
        "sender_id":       str(msg.sender_id),
        "content":         msg.content,
        "message_type":    msg.message_type.value if msg.message_type else "text",
        "file_url":        msg.file_url,
        "read_by":         [str(u) for u in (msg.read_by or [])],
        "is_deleted":      msg.is_deleted,
        "created_at":      msg.created_at.isoformat() if msg.created_at else None,
    }


# ---------------------------------------------------------------------------
# Shared guards
# ---------------------------------------------------------------------------


async def _get_conv_or_404(db: AsyncSession, conversation_id: str) -> Conversation:
    """Load a Conversation by UUID string; raise HTTP 404 if missing."""
    try:
        conv_uuid = uuid.UUID(conversation_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"'{conversation_id}' is not a valid UUID.",
        )
    conv = await db.get(Conversation, conv_uuid)
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation '{conversation_id}' not found.",
        )
    return conv


def _assert_participant(conv: Conversation, user_id: str) -> None:
    """Raise HTTP 403 if user_id is not in the conversation's participant list."""
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"'{user_id}' is not a valid UUID.",
        )
    if user_uuid not in (conv.participant_ids or []):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a participant in this conversation.",
        )


# ---------------------------------------------------------------------------
# 1. List conversations  (GET /api/messages)
# ---------------------------------------------------------------------------


async def list_conversations(db: AsyncSession, user_id: str) -> list[dict]:
    """
    Return all conversations the user participates in, ordered by most-recent
    activity first.  Each entry is enriched with a last-message preview and
    an unread message count.

    Performance note (v1):
        This executes 2 additional queries per conversation (last message +
        unread count).  Acceptable for small-to-medium inboxes; refactor to a
        single CTE / window-function query if the inbox grows large.

    PostgreSQL ARRAY note:
        "scalar = ANY(array_column)" is expressed via text() because SQLAlchemy
        Core lacks a clean, dialect-agnostic API for this predicate.
    """
    user_uuid = uuid.UUID(user_id)

    stmt = (
        select(Conversation)
        .where(
            # Checks whether user_uuid is present in the participant_ids ARRAY.
            # Equivalent SQL: WHERE (:uid)::uuid = ANY(conversations.participant_ids)
            text("(:uid)::uuid = ANY(conversations.participant_ids)").bindparams(
                uid=str(user_uuid)
            )
        )
        .order_by(Conversation.last_message_at.desc().nulls_last())
    )
    result = await db.execute(stmt)
    conversations = result.scalars().all()

    enriched: list[dict] = []
    for conv in conversations:
        row = _conv_to_dict(conv)

        # ── Last-message preview ─────────────────────────────────────────────
        last_msg_stmt = (
            select(Message)
            .where(
                Message.conversation_id == conv.id,
                Message.is_deleted.is_(False),
            )
            .order_by(Message.created_at.desc())
            .limit(1)
        )
        last_msg_result = await db.execute(last_msg_stmt)
        last_msg = last_msg_result.scalar_one_or_none()
        row["last_message"] = _msg_to_dict(last_msg) if last_msg else None

        # ── Unread count ─────────────────────────────────────────────────────
        # Count messages in this conversation that:
        #   • are not deleted
        #   • were not sent by the current user
        #   • have not been read by the current user (user NOT in read_by ARRAY)
        unread_stmt = (
            select(func.count())
            .select_from(Message)
            .where(
                Message.conversation_id == conv.id,
                Message.is_deleted.is_(False),
                Message.sender_id != user_uuid,
                text(
                    "NOT ((:uid)::uuid = ANY(messages.read_by))"
                ).bindparams(uid=str(user_uuid)),
            )
        )
        unread_result = await db.execute(unread_stmt)
        row["unread_count"] = unread_result.scalar() or 0

        enriched.append(row)

    return enriched


# ---------------------------------------------------------------------------
# 2. Get message history  (GET /api/messages/{conversationId})
# ---------------------------------------------------------------------------


async def get_messages(
    db: AsyncSession,
    conversation_id: str,
    user_id: str,
    limit: int = 50,
    before_id: Optional[str] = None,
) -> dict:
    """
    Return paginated message history for a conversation.

    Pagination style: cursor-based (before_id).
    Pass the id of the oldest message currently displayed to fetch the
    next (earlier) page — ideal for infinite-scroll upward loading.

    Side effect: marks fetched messages as read for the current user by
    appending user_id to their read_by ARRAY via a single batch UPDATE.

    Returns messages in chronological order (oldest first) within the page.
    """
    conv = await _get_conv_or_404(db, conversation_id)
    _assert_participant(conv, user_id)

    user_uuid = uuid.UUID(user_id)
    conv_uuid = uuid.UUID(conversation_id)

    stmt = select(Message).where(
        Message.conversation_id == conv_uuid,
        Message.is_deleted.is_(False),
    )

    # Apply cursor: fetch only messages older than the cursor message.
    if before_id:
        try:
            cursor_uuid = uuid.UUID(before_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"before_id '{before_id}' is not a valid UUID.",
            )
        cursor_msg = await db.get(Message, cursor_uuid)
        if cursor_msg and not cursor_msg.is_deleted:
            stmt = stmt.where(Message.created_at < cursor_msg.created_at)

    # Fetch newest-first (DESC) so LIMIT cuts at the right boundary;
    # we reverse before returning so the client gets chronological order.
    stmt = stmt.order_by(Message.created_at.desc()).limit(limit)

    result = await db.execute(stmt)
    messages: list[Message] = list(result.scalars().all())

    # ── Mark messages as read (batch UPDATE) ────────────────────────────────
    unread_ids: list[str] = [
        str(msg.id)
        for msg in messages
        if msg.sender_id != user_uuid
        and user_uuid not in (msg.read_by or [])
    ]
    if unread_ids:
        # Build a PostgreSQL array literal from already-validated UUID strings.
        # These UUIDs came from the database so string formatting is safe.
        ids_literal = "{" + ",".join(unread_ids) + "}"
        await db.execute(
            text("""
                UPDATE messages
                   SET read_by = array_append(read_by, (:uid)::uuid)
                 WHERE id = ANY((:ids)::uuid[])
                   AND NOT ((:uid)::uuid = ANY(read_by))
            """).bindparams(uid=str(user_uuid), ids=ids_literal)
        )
        await db.flush()

    # next_cursor is the id of the oldest message in this batch —
    # the client passes it as before_id to load the previous page.
    next_cursor: Optional[str] = str(messages[-1].id) if len(messages) == limit else None

    return {
        "messages":   [_msg_to_dict(msg) for msg in reversed(messages)],
        "next_cursor": next_cursor,
        "has_more":    next_cursor is not None,
    }


# ---------------------------------------------------------------------------
# 3. Send a text message  (POST /api/messages)
# ---------------------------------------------------------------------------


async def send_message(
    db: AsyncSession,
    conversation_id: str,
    sender_id: str,
    content: str,
) -> dict:
    """
    Insert a new text message into a conversation and update the conversation's
    last_message_at timestamp.

    Validates that:
    - The conversation exists.
    - The sender is a participant.
    - The content is not blank.
    """
    conv = await _get_conv_or_404(db, conversation_id)
    _assert_participant(conv, sender_id)

    stripped = (content or "").strip()
    if not stripped:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message content cannot be empty.",
        )

    sender_uuid = uuid.UUID(sender_id)
    conv_uuid   = uuid.UUID(conversation_id)
    now         = datetime.now(timezone.utc)

    new_msg = Message(
        conversation_id=conv_uuid,
        sender_id=sender_uuid,
        content=stripped,
        message_type=MessageType.text,
        # The sender implicitly reads their own message at send time.
        read_by=[sender_uuid],
    )
    db.add(new_msg)

    # Update conversation's last_message_at and updated_at.
    # (updated_at is set explicitly because onupdate only fires for ORM updates,
    #  not for bulk UPDATE statements.)
    await db.execute(
        update(Conversation)
        .where(Conversation.id == conv_uuid)
        .values(last_message_at=now, updated_at=now)
    )

    await db.flush()
    await db.refresh(new_msg)
    return _msg_to_dict(new_msg)


# ---------------------------------------------------------------------------
# 4. Soft-delete a message  (DELETE /api/messages/{id})
# ---------------------------------------------------------------------------


async def delete_message(
    db: AsyncSession,
    message_id: str,
    sender_id: str,
) -> dict:
    """
    Soft-delete a message.

    The row is retained (conversation-timeline integrity for other participants
    and cursor-based pagination correctness), but:
    - is_deleted is set to True
    - deleted_at is set to now
    - content and file_url are cleared (no orphaned data served)

    Only the original sender may delete their message (HTTP 403 otherwise).
    """
    try:
        msg_uuid = uuid.UUID(message_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"'{message_id}' is not a valid UUID.",
        )

    msg = await db.get(Message, msg_uuid)
    if not msg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Message '{message_id}' not found.",
        )
    if msg.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Message has already been deleted.",
        )
    if str(msg.sender_id) != sender_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own messages.",
        )

    now = datetime.now(timezone.utc)
    msg.is_deleted = True
    msg.deleted_at = now
    msg.content    = None   # Clear content — row becomes a tombstone only.
    msg.file_url   = None   # Clear file reference.

    await db.flush()

    return {
        "id":         message_id,
        "is_deleted": True,
        "deleted_at": now.isoformat(),
    }


# ---------------------------------------------------------------------------
# 5. Upload a file  (POST /api/messages/upload)
# ---------------------------------------------------------------------------


async def upload_file(file: UploadFile, sender_id: str) -> dict:
    """
    Validate, persist, and return a URL for an uploaded file attachment.

    The file is streamed to disk in 64 KB chunks so large files do not
    exhaust server memory.  If the size limit is exceeded mid-stream, the
    partially written file is removed before the error is raised.

    Accepted types and limits:
        Images  (JPEG/PNG/GIF/WebP)           → up to 10 MB
        Docs    (PDF/Word/TXT)                → up to 10 MB
        Voice   (MP3/MP4/OGG/WAV/WebM)       → up to  5 MB

    Returns a file_url (relative path) and the detected message_type so the
    frontend knows which icon/player to render without a second server round-trip.
    """
    content_type = (file.content_type or "").lower().split(";")[0].strip()

    if content_type not in CONTENT_TYPE_MAP:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=(
                f"Unsupported file type '{content_type}'.  "
                "Accepted: images (JPEG/PNG/GIF/WebP), "
                "documents (PDF/Word/TXT), "
                "voice notes (MP3/M4A/OGG/WAV/WebM)."
            ),
        )

    derived_type = CONTENT_TYPE_MAP[content_type]
    max_bytes    = MAX_VOICE_BYTES if derived_type == MessageType.voice else MAX_IMAGE_DOC_BYTES
    ext          = EXTENSION_MAP.get(content_type, "bin")
    filename     = f"{uuid.uuid4()}.{ext}"
    dest_path    = UPLOAD_DIR / filename

    size_written = 0
    chunk_size   = 64 * 1024  # 64 KB

    try:
        async with aiofiles.open(dest_path, "wb") as out_file:
            while True:
                chunk = await file.read(chunk_size)
                if not chunk:
                    break
                size_written += len(chunk)
                if size_written > max_bytes:
                    # Remove the partial file before raising.
                    dest_path.unlink(missing_ok=True)
                    limit_mb = max_bytes // (1024 * 1024)
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=(
                            f"File exceeds the {limit_mb} MB limit "
                            f"for {derived_type.value} files."
                        ),
                    )
                await out_file.write(chunk)
    except HTTPException:
        raise
    except Exception as exc:
        dest_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save the uploaded file.",
        ) from exc

    # The file_url is a relative path — wire a StaticFiles mount or CDN prefix
    # in front of it to make it publicly accessible.
    file_url = f"/uploads/messages/{filename}"

    return {
        "file_url":     file_url,
        "filename":     filename,
        "message_type": derived_type.value,
        "size_bytes":   size_written,
        "content_type": content_type,
    }
