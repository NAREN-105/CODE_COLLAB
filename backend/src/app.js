// backend/src/app.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const { executeCode } = require('./execute'); // ✅ NEW LINE ADDED

const app = express();
const server = http.createServer(app);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Store active rooms and users
const rooms = new Map();

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'CodeCollab Backend is running! 🚀',
    timestamp: new Date().toISOString()
  });
});

// ✅ CODE EXECUTION ROUTE - NEW
app.post('/execute', async (req, res) => {
  const { language, code, stdin } = req.body;
  if (!language || !code) {
    return res.status(400).json({ error: 'language and code are required' });
  }
  try {
    const result = await executeCode(language, code, stdin || '');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // Join room
  socket.on('join-room', ({ roomId, userId, username }) => {
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, { users: [] });
    }
    
    const room = rooms.get(roomId);
    room.users.push({ userId, username, socketId: socket.id });
    
    socket.to(roomId).emit('user-joined', { userId, username });
    
    const usernames = room.users.map(u => u.username);
    io.to(roomId).emit('active-users', { users: usernames });
    
    console.log(`👤 ${username} joined room: ${roomId}`);
  });

  // Handle code changes
  socket.on('code-change', ({ roomId, code }) => {
    socket.to(roomId).emit('code-update', { code, userId: socket.id });
  });

  // Handle chat messages
  socket.on('send-message', ({ roomId, message, username }) => {
    io.to(roomId).emit('new-message', { message, userId: socket.id, username });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    
    rooms.forEach((room, roomId) => {
      const userIndex = room.users.findIndex(u => u.socketId === socket.id);
      if (userIndex !== -1) {
        const user = room.users[userIndex];
        room.users.splice(userIndex, 1);
        
        socket.to(roomId).emit('user-left', { userId: user.userId, username: user.username });
        
        const usernames = room.users.map(u => u.username);
        io.to(roomId).emit('active-users', { users: usernames });
        
        console.log(`👋 ${user.username} left room: ${roomId}`);
        
        if (room.users.length === 0) {
          rooms.delete(roomId);
        }
      }
    });
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║   🚀 CodeCollab Backend Running!      ║
  ║   📡 Port: ${PORT}                         ║
  ║   🌐 http://localhost:${PORT}             ║
  ╚════════════════════════════════════════╝
  `);
});

module.exports = { app, io };