/**
 * chat-service/src/socketHandlers.js
 *
 * All Socket.IO event handlers live here.
 * index.js imports registerHandlers() and calls it once per new connection.
 *
 * Design decisions:
 *  - No DB persistence here — messages are persisted via the FastAPI backend
 *    (POST /api/messages).  The chat-service is a pure real-time relay.
 *  - Authentication is a stub: userId is taken from the connection handshake
 *    query/auth.  Replace with real JWT verification when the auth module lands
 *    (same pattern as get_current_user_id() in the FastAPI backend).
 *  - Typing expiry: if a client emits `typing` but never emits `stop_typing`,
 *    the server auto-cancels the broadcast after TYPING_EXPIRY_MS.
 *  - Redis adapter: not wired yet.  When scaling to multiple Node processes,
 *    add @socket.io/redis-adapter in index.js — the handlers below need no changes.
 */

'use strict';

const fetch = require('node-fetch');

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000';
const TYPING_EXPIRY_MS = 3000; // broadcast user_stopped_typing after 3s of silence

// In-process map: socketId → { userId, typingTimers: Map<conversationId, timeoutId> }
// This is intentionally simple for v1. With Redis, move this state to Redis.
const connectedUsers = new Map();

/**
 * Register all Socket.IO event handlers for a single connection.
 *
 * @param {import('socket.io').Socket} socket
 * @param {import('socket.io').Server} io
 */
function registerHandlers(socket, io) {
  // ── Identify the connecting user ─────────────────────────────────────────
  // userId comes from the client's handshake:
  //   io({ query: { userId: '...' } })     — query param
  //   io({ auth: { userId: '...' } })      — auth payload (preferred for real JWT)
  //
  // TODO (auth module): validate a JWT token here instead of trusting the raw userId.
  const userId =
    socket.handshake.auth?.userId ||
    socket.handshake.query?.userId ||
    'anonymous';

  // Store per-connection state
  connectedUsers.set(socket.id, { userId, typingTimers: new Map() });

  console.log(`[CONNECT]    socketId=${socket.id}  userId=${userId}`);

  // ── join_conversation ────────────────────────────────────────────────────
  /**
   * Client joins a Socket.IO room named after the conversationId.
   * Only sockets in the same room receive new_message and user_typing events
   * for that conversation — so messages don't leak across conversations.
   *
   * Payload: { conversationId: string }
   * Emits back: joined_conversation { conversationId }
   */
  socket.on('join_conversation', ({ conversationId } = {}) => {
    if (!conversationId) {
      socket.emit('error', { event: 'join_conversation', message: 'conversationId is required.' });
      return;
    }
    socket.join(conversationId);
    socket.emit('joined_conversation', { conversationId });
    console.log(`[JOIN]       socketId=${socket.id}  userId=${userId}  room=${conversationId}`);
  });

  // ── send_message ─────────────────────────────────────────────────────────
  /**
   * Client emits this to send a message.
   * Flow:
   *   1. Call FastAPI POST /api/messages to persist the message.
   *   2. If FastAPI succeeds → broadcast new_message to everyone in the room.
   *   3. If FastAPI fails → emit error back to sender only; do NOT broadcast.
   *
   * Payload: { conversationId: string, content: string, senderId: string }
   * Broadcasts: new_message { ...persistedMessage } to room (sender excluded — 
   *             the client already has optimistic UI; include if you need echo).
   */
  socket.on('send_message', async ({ conversationId, content, senderId } = {}) => {
    if (!conversationId || !content) {
      socket.emit('error', {
        event: 'send_message',
        message: 'conversationId and content are required.',
      });
      return;
    }

    // Use the socket's identified userId as a fallback if senderId not supplied
    const resolvedSenderId = senderId || userId;

    console.log(`[SEND_MSG]   socketId=${socket.id}  userId=${resolvedSenderId}  room=${conversationId}  content="${content.slice(0, 60)}"`);

    // ── Persist via FastAPI ─────────────────────────────────────────────────
    let persistedMessage;
    try {
      const response = await fetch(`${BACKEND_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, content }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(
          `FastAPI returned ${response.status}: ${errorBody.detail || JSON.stringify(errorBody)}`
        );
      }

      const apiResponse = await response.json();
      persistedMessage = apiResponse.data; // unwrap { success, data }
    } catch (err) {
      console.error(`[SEND_MSG]   FastAPI persist FAILED: ${err.message}`);
      socket.emit('error', {
        event: 'send_message',
        message: `Failed to persist message: ${err.message}`,
      });
      return; // Do NOT broadcast — message was not persisted
    }

    // ── Broadcast to room ───────────────────────────────────────────────────
    // socket.to() sends to everyone in the room EXCEPT the sender.
    // If you want the sender to receive it too (e.g. to replace an optimistic
    // placeholder with the server-confirmed message), use io.to() instead.
    socket.to(conversationId).emit('new_message', persistedMessage);
    // Also ack back to the sender with the persisted message so they can
    // confirm the message ID and timestamp from the server.
    socket.emit('message_sent', persistedMessage);

    console.log(`[BROADCAST]  new_message → room=${conversationId}  msgId=${persistedMessage?.id}`);
  });

  // ── typing ────────────────────────────────────────────────────────────────
  /**
   * Client emits when they start (or continue) typing.
   * Server broadcasts user_typing to others in the room.
   * Auto-cancels: if no new `typing` event arrives within TYPING_EXPIRY_MS,
   * broadcasts user_stopped_typing automatically.
   *
   * Clients may also emit `stop_typing` explicitly to cancel immediately.
   *
   * Payload: { conversationId: string }
   * Broadcasts: user_typing { conversationId, userId }
   *             user_stopped_typing { conversationId, userId }  (after timeout)
   */
  socket.on('typing', ({ conversationId } = {}) => {
    if (!conversationId) return;

    const state = connectedUsers.get(socket.id);
    if (!state) return;

    // Broadcast to everyone else in the room
    socket.to(conversationId).emit('user_typing', { conversationId, userId });

    // Reset the auto-expiry timer
    if (state.typingTimers.has(conversationId)) {
      clearTimeout(state.typingTimers.get(conversationId));
    }
    const timerId = setTimeout(() => {
      socket.to(conversationId).emit('user_stopped_typing', { conversationId, userId });
      state.typingTimers.delete(conversationId);
      console.log(`[TYPING]     auto-expired  userId=${userId}  room=${conversationId}`);
    }, TYPING_EXPIRY_MS);

    state.typingTimers.set(conversationId, timerId);
    console.log(`[TYPING]     userId=${userId}  room=${conversationId}`);
  });

  // ── stop_typing ───────────────────────────────────────────────────────────
  socket.on('stop_typing', ({ conversationId } = {}) => {
    if (!conversationId) return;

    const state = connectedUsers.get(socket.id);
    if (!state) return;

    if (state.typingTimers.has(conversationId)) {
      clearTimeout(state.typingTimers.get(conversationId));
      state.typingTimers.delete(conversationId);
    }
    socket.to(conversationId).emit('user_stopped_typing', { conversationId, userId });
    console.log(`[STOP_TYPE]  userId=${userId}  room=${conversationId}`);
  });

  // ── mark_read ─────────────────────────────────────────────────────────────
  /**
   * Client emits when they've viewed messages in a conversation.
   * Broadcasts messages_read to others in the room (optimistic — the frontend
   * can update read indicators immediately without waiting for a DB round-trip).
   *
   * The FastAPI backend already marks messages read as a side-effect of
   * GET /api/messages/{conversationId}, so no extra persist call is needed here.
   * If you later need server-authoritative read receipts on this path, add a
   * fetch() call to BACKEND_URL here.
   *
   * Payload: { conversationId: string }
   * Broadcasts: messages_read { conversationId, userId }
   */
  socket.on('mark_read', ({ conversationId } = {}) => {
    if (!conversationId) return;
    socket.to(conversationId).emit('messages_read', { conversationId, userId });
    console.log(`[MARK_READ]  userId=${userId}  room=${conversationId}`);
  });

  // ── disconnect ────────────────────────────────────────────────────────────
  socket.on('disconnect', (reason) => {
    const state = connectedUsers.get(socket.id);
    if (state) {
      // Cancel all pending typing expiry timers for this socket
      for (const [convId, timerId] of state.typingTimers) {
        clearTimeout(timerId);
        // Notify rooms that the user has stopped typing on disconnect
        socket.to(convId).emit('user_stopped_typing', { conversationId: convId, userId });
      }
      connectedUsers.delete(socket.id);
    }
    console.log(`[DISCONNECT] socketId=${socket.id}  userId=${userId}  reason=${reason}`);
  });
}

module.exports = { registerHandlers };
