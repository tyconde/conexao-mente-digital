
/**
 * Simple Socket.IO server for real-time chat between patients and professionals.
 * Run: node server/index.js
 *
 * Note: This server keeps messages in memory (not persistent). For production,
 * replace with a database (MySQL, Postgres, MongoDB, etc.).
 */
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET","POST"]
  }
});

// Simple in-memory storage
const conversations = {}; // key: roomId, value: [{id, senderId, senderName, ...}]

io.on('connection', (socket) => {
  console.log('Client connected', socket.id);

  socket.on('join_room', ({ roomId }) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
    // send existing messages
    socket.emit('room_history', { roomId, messages: conversations[roomId] || [] });
  });

  socket.on('leave_room', ({ roomId }) => {
    socket.leave(roomId);
    console.log(`Socket ${socket.id} left room ${roomId}`);
  });

  socket.on('send_message', ({ roomId, message }) => {
    // message should be an object with id, senderId, senderName, content, timestamp, etc.
    if (!conversations[roomId]) conversations[roomId] = [];
    conversations[roomId].push(message);
    io.to(roomId).emit('new_message', { roomId, message });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});

// simple health check
app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log('Realtime server listening on port', PORT);
});
