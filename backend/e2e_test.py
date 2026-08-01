"""
e2e_test.py -- End-to-end test for all 5 messaging endpoints.
Run from the project root WHILE uvicorn is already running:
    python backend/e2e_test.py
"""

import json
import os
import sys
import asyncio
from pathlib import Path
from urllib.parse import urlparse

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncpg
import httpx  # pip install httpx if needed

BASE_URL = "http://127.0.0.1:8000"

# Hardcoded stub user that get_current_user_id() returns
STUB_USER_ID = "00000000-0000-0000-0000-000000000001"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def section(title: str):
    print("")
    print("=" * 60)
    print(title)
    print("=" * 60)

def show(label: str, response: httpx.Response):
    print("")
    print(f"  [{label}]")
    print(f"  Status: {response.status_code}")
    try:
        body = response.json()
        print("  Body:   " + json.dumps(body, indent=2).replace("\n", "\n          "))
    except Exception:
        print("  Body:   " + response.text[:500])

def ok(response: httpx.Response, expected_status: int = 200):
    if response.status_code != expected_status:
        print(f"  !! UNEXPECTED STATUS: got {response.status_code}, wanted {expected_status}")
        return False
    return True

# ---------------------------------------------------------------------------
# Raw DB helper -- insert test data directly
# ---------------------------------------------------------------------------

from dotenv import load_dotenv
load_dotenv("backend/.env")

_RAW_URL = os.getenv("DATABASE_URL", "")
_NEEDS_SSL = "sslmode=require" in _RAW_URL
_CLEAN_URL = _RAW_URL.split("?")[0]

def _parse_url(url: str) -> dict:
    clean = url.replace("postgresql+asyncpg://", "postgresql://").split("?")[0]
    p = urlparse(clean)
    return {
        "user": p.username, "password": p.password,
        "host": p.hostname, "port": p.port or 5432,
        "database": p.path.lstrip("/"),
    }

async def _db_conn():
    params = _parse_url(_CLEAN_URL)
    kwargs = {**params}
    if _NEEDS_SSL:
        kwargs["ssl"] = "require"
    return await asyncpg.connect(**kwargs)

async def insert_test_data() -> tuple[str, str]:
    """Insert one conversation and one message; return (conv_id, msg_id)."""
    conn = await _db_conn()
    try:
        stub_uuid = STUB_USER_ID  # already a UUID string
        conv_id = await conn.fetchval(
            """
            INSERT INTO conversations (participant_ids, last_message_at)
            VALUES (ARRAY[$1::uuid], now())
            RETURNING id::text
            """,
            stub_uuid,
        )
        msg_id = await conn.fetchval(
            """
            INSERT INTO messages (conversation_id, sender_id, content, message_type, read_by)
            VALUES ($1::uuid, $2::uuid, 'Hello from seed data', 'text', ARRAY[$2::uuid])
            RETURNING id::text
            """,
            conv_id, stub_uuid,
        )
        return conv_id, msg_id
    finally:
        await conn.close()

async def check_db_state(msg_id: str) -> dict:
    """Return the raw DB row for a message (to verify soft-delete)."""
    conn = await _db_conn()
    try:
        row = await conn.fetchrow(
            "SELECT id::text, is_deleted, deleted_at, content FROM messages WHERE id = $1::uuid",
            msg_id,
        )
        return dict(row) if row else {}
    finally:
        await conn.close()

# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

async def run_tests():
    # ------------------------------------------------------------------ (a)
    section("TEST a: GET /api/messages -- empty state")
    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        r = await client.get("/api/messages")
    show("GET /api/messages (before seed)", r)
    ok(r, 200)
    data = r.json()
    print(f"  success={data['success']}  conversations count={len(data['data'])}")

    # ------------------------------------------------------------------ (b)
    section("TEST b: Insert test conversation + message directly via SQL")
    conv_id, msg_id = await insert_test_data()
    print(f"  Inserted conversation: {conv_id}")
    print(f"  Inserted message:      {msg_id}")

    # ------------------------------------------------------------------ (c)
    section("TEST c: GET /api/messages -- after seeding")
    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        r = await client.get("/api/messages")
    show("GET /api/messages (after seed)", r)
    ok(r, 200)
    data = r.json()
    print(f"  Conversations returned: {len(data['data'])}")
    if data["data"]:
        conv = data["data"][0]
        print(f"  First conv id:          {conv['id']}")
        print(f"  last_message preview:   {conv.get('last_message', {}).get('content') if conv.get('last_message') else 'None'}")
        print(f"  unread_count:           {conv.get('unread_count')}")

    # ------------------------------------------------------------------ (d)
    section("TEST d: GET /api/messages/{conversationId} -- message history")
    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        r = await client.get(f"/api/messages/{conv_id}?limit=10")
    show("GET /api/messages/" + conv_id, r)
    ok(r, 200)
    data = r.json()
    msgs = data["data"]["messages"]
    print(f"  Messages returned: {len(msgs)}")
    if msgs:
        print(f"  First message content: {msgs[0]['content']}")
        print(f"  has_more:              {data['data']['has_more']}")

    # ------------------------------------------------------------------ (e)
    section("TEST e: POST /api/messages -- send a new text message")
    payload = {"conversationId": conv_id, "content": "This is a live end-to-end test message!"}
    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        r = await client.post("/api/messages", json=payload)
    show("POST /api/messages", r)
    ok(r, 201)
    new_msg = r.json()["data"]
    new_msg_id = new_msg["id"]
    print(f"  New message id:   {new_msg_id}")
    print(f"  Content echoed:   {new_msg['content']}")
    print(f"  message_type:     {new_msg['message_type']}")

    # Verify persistence -- re-fetch conversation history
    print("")
    print("  Verifying persistence: re-fetching message history...")
    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        r2 = await client.get(f"/api/messages/{conv_id}?limit=10")
    msgs2 = r2.json()["data"]["messages"]
    print(f"  Messages now in history: {len(msgs2)}")
    found = any(m["id"] == new_msg_id for m in msgs2)
    print(f"  New message found in history: {found}")

    # ------------------------------------------------------------------ (f)
    section("TEST f: POST /api/messages with non-existent conversationId")
    fake_id = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        r = await client.post("/api/messages", json={"conversationId": fake_id, "content": "hi"})
    show("POST /api/messages (bad conv_id)", r)
    print(f"  Expected 404, got: {r.status_code}")
    print(f"  Error body: {r.json()}")

    # ------------------------------------------------------------------ (g)
    section("TEST g: DELETE /api/messages/{id} -- soft delete")
    print(f"  Deleting message: {new_msg_id}")
    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        r = await client.delete(f"/api/messages/{new_msg_id}")
    show("DELETE /api/messages/" + new_msg_id, r)
    ok(r, 200)

    # Verify soft delete in DB
    print("")
    print("  Verifying in DB (raw asyncpg query):")
    db_row = await check_db_state(new_msg_id)
    print(f"    id:         {db_row.get('id')}")
    print(f"    is_deleted: {db_row.get('is_deleted')}   <-- should be True")
    print(f"    deleted_at: {db_row.get('deleted_at')}   <-- should be set")
    print(f"    content:    {db_row.get('content')}       <-- should be None (cleared)")

    # Verify excluded from GET results
    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        r2 = await client.get(f"/api/messages/{conv_id}?limit=10")
    msgs3 = r2.json()["data"]["messages"]
    found_after_delete = any(m["id"] == new_msg_id for m in msgs3)
    print(f"  Message appears in GET history after delete: {found_after_delete}  <-- should be False")

    # ------------------------------------------------------------------ (h)
    section("TEST h: POST /api/messages/upload -- file upload")
    # Create a tiny test PNG (1x1 pixel, valid PNG binary)
    test_png = bytes([
        0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,  # PNG signature
        0x00,0x00,0x00,0x0d,0x49,0x48,0x44,0x52,  # IHDR chunk
        0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,
        0x08,0x02,0x00,0x00,0x00,0x90,0x77,0x53,
        0xde,0x00,0x00,0x00,0x0c,0x49,0x44,0x41,  # IDAT chunk
        0x54,0x08,0xd7,0x63,0xf8,0xcf,0xc0,0x00,
        0x00,0x00,0x02,0x00,0x01,0xe2,0x21,0xbc,
        0x33,0x00,0x00,0x00,0x00,0x49,0x45,0x4e,  # IEND chunk
        0x44,0xae,0x42,0x60,0x82,
    ])

    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        r = await client.post(
            "/api/messages/upload",
            files={"file": ("test_pixel.png", test_png, "image/png")},
        )
    show("POST /api/messages/upload", r)
    ok(r, 201)
    upload_data = r.json()["data"]
    file_url = upload_data.get("file_url", "")
    print(f"  file_url:     {file_url}")
    print(f"  message_type: {upload_data.get('message_type')}")
    print(f"  size_bytes:   {upload_data.get('size_bytes')}")

    # Verify file actually landed on disk
    if file_url:
        filename = file_url.split("/")[-1]
        disk_path = Path("backend/uploads/messages") / filename
        exists_on_disk = disk_path.exists()
        size_on_disk   = disk_path.stat().st_size if exists_on_disk else 0
        print(f"  File on disk: {disk_path}  exists={exists_on_disk}  size={size_on_disk}B")

    # ------------------------------------------------------------------ done
    section("ALL TESTS COMPLETE")
    print("  (server is still running -- check each result above)")

if __name__ == "__main__":
    asyncio.run(run_tests())
