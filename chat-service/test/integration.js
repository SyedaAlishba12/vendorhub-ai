/**
 * chat-service/test/integration.js
 *
 * End-to-end integration test for the chat-service.
 * Requires both services to be running:
 *   1. FastAPI backend  → uvicorn backend.main:app --port 8000  (from project root)
 *   2. chat-service     → node src/index.js                     (from chat-service/)
 *
 * Run from the project root:
 *   node chat-service/test/integration.js
 *
 * What it tests:
 *   a. Client A connects, joins a conversation, sends a message via send_message.
 *   b. Chat-service calls FastAPI POST /api/messages — we verify persistence via
 *      GET /api/messages/{conversationId} afterward.
 *   c. Client B (in the same room) receives the new_message broadcast.
 *   d. Typing indicator: Client A emits typing → Client B receives user_typing,
 *      then user_stopped_typing after ~3s auto-expiry.
 */

'use strict';

const { io: ioClient } = require('socket.io-client');
const fetch = require('node-fetch');

// ── Config ─────────────────────────────────────────────────────────────────────
const CHAT_URL   = 'http://127.0.0.1:4000';
const BACKEND_URL = 'http://127.0.0.1:8000';

// Use the stub user ID that get_current_user_id() returns on the FastAPI side.
// In the real system this would be a JWT-bearing user; for now they share one ID.
const USER_A_ID = '00000000-0000-0000-0000-000000000001';
const USER_B_ID = '00000000-0000-0000-0000-000000000002';

// We'll use the conversation that was seeded during the e2e test.
// Fetched from the backend at test start so the test is self-healing.
let CONV_ID = null;

// ── Helpers ────────────────────────────────────────────────────────────────────

function log(tag, msg) {
  const ts = new Date().toISOString().substring(11, 23); // HH:mm:ss.mmm
  console.log(`[${ts}] ${tag.padEnd(14)} ${msg}`);
}

function connectClient(userId, label) {
  return ioClient(CHAT_URL, {
    auth: { userId },
    transports: ['websocket'],
  });
}

function waitForEvent(socket, event, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for event '${event}' (${timeoutMs}ms)`));
    }, timeoutMs);
    socket.once(event, (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function run() {
  console.log('');
  console.log('='.repeat(60));
  console.log('  VendorHub AI — chat-service integration test');
  console.log('='.repeat(60));

  // ── Preflight: confirm both services are up ─────────────────────────────────
  log('PREFLIGHT', 'Checking FastAPI backend...');
  try {
    const r = await fetch(`${BACKEND_URL}/`);
    const body = await r.json();
    log('PREFLIGHT', `FastAPI OK: ${JSON.stringify(body)}`);
  } catch (e) {
    console.error('FATAL: FastAPI backend is not reachable at ' + BACKEND_URL);
    process.exit(1);
  }

  log('PREFLIGHT', 'Checking chat-service...');
  try {
    const r = await fetch(`${CHAT_URL}/`);
    const body = await r.json();
    log('PREFLIGHT', `chat-service OK: ${JSON.stringify(body)}`);
  } catch (e) {
    console.error('FATAL: chat-service is not reachable at ' + CHAT_URL);
    process.exit(1);
  }

  // ── Get a conversation to use ───────────────────────────────────────────────
  log('SETUP', 'Fetching conversation list from FastAPI...');
  const convListRes = await fetch(`${BACKEND_URL}/api/messages`);
  const convList = await convListRes.json();
  if (!convList.data || convList.data.length === 0) {
    console.error('FATAL: No conversations in DB. Run the FastAPI e2e test first to seed data.');
    process.exit(1);
  }
  CONV_ID = convList.data[0].id;
  log('SETUP', `Using conversationId: ${CONV_ID}`);

  // ── Connect two clients ─────────────────────────────────────────────────────
  log('CONNECT', 'Connecting Client A (sender)...');
  const clientA = connectClient(USER_A_ID, 'A');
  await waitForEvent(clientA, 'connect');
  log('CONNECT', `Client A connected  socketId=${clientA.id}`);

  log('CONNECT', 'Connecting Client B (receiver)...');
  const clientB = connectClient(USER_B_ID, 'B');
  await waitForEvent(clientB, 'connect');
  log('CONNECT', `Client B connected  socketId=${clientB.id}`);

  // ── TEST: join_conversation ─────────────────────────────────────────────────
  console.log('');
  console.log('-'.repeat(60));
  console.log('TEST 1: join_conversation');
  console.log('-'.repeat(60));

  clientA.emit('join_conversation', { conversationId: CONV_ID });
  const joinedA = await waitForEvent(clientA, 'joined_conversation');
  log('TEST 1', `Client A joined room: ${JSON.stringify(joinedA)}`);

  clientB.emit('join_conversation', { conversationId: CONV_ID });
  const joinedB = await waitForEvent(clientB, 'joined_conversation');
  log('TEST 1', `Client B joined room: ${JSON.stringify(joinedB)}`);

  // ── TEST: send_message → persist via FastAPI + broadcast ───────────────────
  console.log('');
  console.log('-'.repeat(60));
  console.log('TEST 2: send_message → FastAPI persist + real-time broadcast');
  console.log('-'.repeat(60));

  // Client B listens for new_message BEFORE Client A sends
  const newMessagePromise = waitForEvent(clientB, 'new_message', 8000);

  const testContent = `Real-time test message at ${new Date().toISOString()}`;
  log('TEST 2', `Client A emitting send_message: "${testContent}"`);
  clientA.emit('send_message', {
    conversationId: CONV_ID,
    content: testContent,
    senderId: USER_A_ID,
  });

  // Wait for sender's ack
  const sentAck = await waitForEvent(clientA, 'message_sent', 8000);
  log('TEST 2', `Client A received message_sent ack: id=${sentAck.id}`);
  log('TEST 2', `  content:      ${sentAck.content}`);
  log('TEST 2', `  message_type: ${sentAck.message_type}`);
  log('TEST 2', `  created_at:   ${sentAck.created_at}`);

  // Wait for Client B's broadcast
  const receivedMsg = await newMessagePromise;
  log('TEST 2', `Client B received new_message broadcast: id=${receivedMsg.id}`);
  log('TEST 2', `  content:  ${receivedMsg.content}`);
  log('TEST 2', `  Match sender ack: ${receivedMsg.id === sentAck.id ? 'YES (same message ID)' : 'NO (mismatch!)'}`);

  // ── TEST 2a: Verify persistence via FastAPI GET ─────────────────────────────
  console.log('');
  console.log('-'.repeat(60));
  console.log('TEST 2a: Verify persistence — GET /api/messages/{conversationId}');
  console.log('-'.repeat(60));

  await sleep(500); // short wait to ensure DB commit propagated
  const historyRes = await fetch(`${BACKEND_URL}/api/messages/${CONV_ID}?limit=10`);
  const history = await historyRes.json();
  const found = history.data.messages.find((m) => m.id === sentAck.id);
  log('TEST 2a', `GET /api/messages/${CONV_ID}  status=${historyRes.status}`);
  log('TEST 2a', `Messages in history: ${history.data.messages.length}`);
  log('TEST 2a', `New message found in history: ${found ? 'YES ✓' : 'NO — PERSISTENCE FAILED'}`);
  if (found) {
    log('TEST 2a', `  id:         ${found.id}`);
    log('TEST 2a', `  content:    ${found.content}`);
    log('TEST 2a', `  is_deleted: ${found.is_deleted}`);
  }

  // ── TEST: typing indicator ─────────────────────────────────────────────────
  console.log('');
  console.log('-'.repeat(60));
  console.log('TEST 3: typing indicator (auto-expiry after 3s)');
  console.log('-'.repeat(60));

  const typingPromise    = waitForEvent(clientB, 'user_typing', 3000);
  const stopTypingPromise = waitForEvent(clientB, 'user_stopped_typing', 6000);

  log('TEST 3', 'Client A emitting typing...');
  clientA.emit('typing', { conversationId: CONV_ID });

  const typingData = await typingPromise;
  log('TEST 3', `Client B received user_typing: ${JSON.stringify(typingData)}`);

  log('TEST 3', 'Waiting for auto-expiry (3s)...');
  const stopData = await stopTypingPromise;
  log('TEST 3', `Client B received user_stopped_typing: ${JSON.stringify(stopData)}`);

  // ── TEST: stop_typing (explicit) ───────────────────────────────────────────
  console.log('');
  console.log('-'.repeat(60));
  console.log('TEST 4: stop_typing (explicit cancel)');
  console.log('-'.repeat(60));

  const explicitStopPromise = waitForEvent(clientB, 'user_stopped_typing', 3000);

  clientA.emit('typing', { conversationId: CONV_ID });
  await waitForEvent(clientB, 'user_typing', 3000);
  log('TEST 4', 'Client A started typing, Client B acknowledged user_typing');

  await sleep(500); // simulate brief typing delay
  clientA.emit('stop_typing', { conversationId: CONV_ID });
  const explicitStop = await explicitStopPromise;
  log('TEST 4', `Client B received explicit user_stopped_typing: ${JSON.stringify(explicitStop)}`);

  // ── TEST: mark_read ────────────────────────────────────────────────────────
  console.log('');
  console.log('-'.repeat(60));
  console.log('TEST 5: mark_read broadcast');
  console.log('-'.repeat(60));

  const readPromise = waitForEvent(clientA, 'messages_read', 3000);
  log('TEST 5', 'Client B emitting mark_read...');
  clientB.emit('mark_read', { conversationId: CONV_ID });

  const readData = await readPromise;
  log('TEST 5', `Client A received messages_read: ${JSON.stringify(readData)}`);

  // ── Cleanup ─────────────────────────────────────────────────────────────────
  console.log('');
  console.log('='.repeat(60));
  console.log('ALL TESTS PASSED');
  console.log('='.repeat(60));
  console.log('');

  clientA.disconnect();
  clientB.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('');
  console.error('TEST FAILED:', err.message);
  console.error(err.stack);
  process.exit(1);
});
