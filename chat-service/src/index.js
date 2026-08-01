/**
 * chat-service/src/index.js — Entry point
 *
 * Creates an Express HTTP server, attaches Socket.IO to it, and starts
 * listening.  All Socket.IO event logic lives in socketHandlers.js.
 *
 * Configuration (via .env):
 *   PORT       — TCP port to listen on (default: 4000)
 *   CLIENT_URL — Allowed CORS origin for Socket.IO handshakes (default: http://localhost:3000)
 *   BACKEND_URL — FastAPI base URL used by socketHandlers (default: http://127.0.0.1:8000)
 */

'use strict';

require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { registerHandlers } = require('./socketHandlers');

// ── Config ────────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '4000', 10);
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// ── Express app ───────────────────────────────────────────────────────────────
const app = express();

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

// Health-check route
app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'chat-service', port: PORT });
});

// ── HTTP server ───────────────────────────────────────────────────────────────
const httpServer = http.createServer(app);

// ── Socket.IO server ──────────────────────────────────────────────────────────
// CORS: allow the Next.js frontend origin.
// In production, tighten to an explicit list — do not use '*'.
//
// Future: attach a Redis adapter here for multi-process horizontal scaling:
//   const { createAdapter } = require('@socket.io/redis-adapter');
//   const pubClient = createClient({ url: process.env.REDIS_URL });
//   const subClient = pubClient.duplicate();
//   await Promise.all([pubClient.connect(), subClient.connect()]);
//   io.adapter(createAdapter(pubClient, subClient));
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
  },
  // Increase ping timeout slightly for development behind slow local networks
  pingTimeout: 20000,
});

// ── Register handlers for every new connection ────────────────────────────────
io.on('connection', (socket) => {
  registerHandlers(socket, io);
});

// ── Start ─────────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log('');
  console.log('  VendorHub AI — chat-service');
  console.log(`  Listening on  http://127.0.0.1:${PORT}`);
  console.log(`  CORS origin   ${CLIENT_URL}`);
  console.log(`  FastAPI URL   ${process.env.BACKEND_URL || 'http://127.0.0.1:8000'}`);
  console.log('');
});
