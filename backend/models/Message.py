"""
models/Message.py — SQLAlchemy ORM model for a single chat message.

Messages belong to a Conversation and support text, image, document, and
voice content types.  Deletion is soft (is_deleted flag) to preserve
conversation-timeline integrity.
"""

import enum

from sqlalchemy import Boolean, Column, DateTime, Enum as SAEnum, ForeignKey, Text, text
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.sql import func

from database.base import Base


# ---------------------------------------------------------------------------
# MessageType enum
# ---------------------------------------------------------------------------


class MessageType(str, enum.Enum):
    """
    Supported message content types.

    - text:     plain-text body (content column populated).
    - image:    image attachment (file_url populated; content optional caption).
    - document: PDF/Word/TXT attachment (file_url populated).
    - voice:    audio recording (file_url populated).
    """

    text = "text"
    image = "image"
    document = "document"
    voice = "voice"


# ---------------------------------------------------------------------------
# Message model
# ---------------------------------------------------------------------------


class Message(Base):
    """A single message within a Conversation."""

    __tablename__ = "messages"

    # ------------------------------------------------------------------
    # Primary key
    # ------------------------------------------------------------------
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
        nullable=False,
    )

    # ------------------------------------------------------------------
    # Foreign key to conversations
    # ------------------------------------------------------------------
    conversation_id = Column(
        UUID(as_uuid=True),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # UUID of the user who sent this message (resolved via the auth module).
    sender_id = Column(
        UUID(as_uuid=True),
        nullable=False,
        index=True,
    )

    # ------------------------------------------------------------------
    # Content
    # ------------------------------------------------------------------
    # Nullable for image / voice / document messages that carry no text body.
    content = Column(Text, nullable=True)

    message_type = Column(
        SAEnum(MessageType, name="messagetype", create_type=True),
        nullable=False,
        default=MessageType.text,
        server_default="text",
    )

    # Populated for image / document / voice messages; null for text-only.
    file_url = Column(Text, nullable=True)

    # ------------------------------------------------------------------
    # V1 DESIGN DECISION — PostgreSQL ARRAY vs. read-receipts join table
    # ------------------------------------------------------------------
    # read_by is stored as a PostgreSQL ARRAY of UUIDs rather than a
    # separate `message_read_receipts` join table.
    #
    # Pros (v1 simplicity):
    #   • No extra table or join needed to check "has user X read this?"
    #   • Simple append via PostgreSQL's array_append() built-in.
    #   • Unread count per-conversation is a straightforward COUNT ...
    #     WHERE NOT (user_id = ANY(read_by)).
    #
    # Cons / tradeoff to document:
    #   • A join table would be more relationally queryable for admin/fraud
    #     lookups (e.g. "total unread messages per user across all threads",
    #     "read-receipt analytics dashboard") because those patterns need a
    #     cross-conversation aggregation that requires scanning every message's
    #     ARRAY column rather than a simple indexed JOIN on a receipts table.
    #   • ARRAY columns are also harder to partially index (e.g. GIN indexes
    #     help for containment, but they're heavier than a plain btree on a
    #     join table's (message_id, user_id) composite key).
    #
    # Recommendation: migrate to a `message_read_receipts` join table in v2
    # if cross-conversation read-receipt queries or analytics become a
    # requirement.
    # ------------------------------------------------------------------
    read_by = Column(
        ARRAY(UUID(as_uuid=True)),
        nullable=False,
        server_default=text("'{}'::uuid[]"),
        comment=(
            "V1: PostgreSQL ARRAY of user UUIDs who have read this message.  "
            "See inline design-decision note — consider a join table for v2 "
            "if cross-conversation read-receipt queries are needed."
        ),
    )

    # ------------------------------------------------------------------
    # Soft delete
    # ------------------------------------------------------------------
    # Rows are never hard-deleted — doing so would create gaps in the message
    # timeline that the frontend's cursor-based pagination would miscount.
    # Deleted messages are replaced by a "This message was deleted" tombstone
    # in the UI; the content and file_url columns are cleared on deletion.
    is_deleted = Column(
        Boolean,
        nullable=False,
        default=False,
        server_default=text("false"),
    )
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    # ------------------------------------------------------------------
    # Timestamps
    # ------------------------------------------------------------------
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        # Index supports cursor-based pagination (ORDER BY created_at DESC).
        index=True,
    )
