// backend/src/app.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

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

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // Join room
  socket.on('join-room', ({ roomId, userId, username }) => {
    socket.join(roomId);
    
    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, { users: [] });
    }
    
    // Add user to room
    const room = rooms.get(roomId);
    room.users.push({ userId, username, socketId: socket.id });
    
    // Notify others that user joined
    socket.to(roomId).emit('user-joined', { userId, username });
    
    // Send active users list to all in room
    const usernames = room.users.map(u => u.username);
    io.to(roomId).emit('active-users', { users: usernames });
    
    console.log(`👤 ${username} joined room: ${roomId}`);
  });

  // Handle code changes
  socket.on('code-change', ({ roomId, code }) => {
    // Broadcast code change to all other users in the room
    socket.to(roomId).emit('code-update', { code, userId: socket.id });
  });

  // Handle chat messages
  socket.on('send-message', ({ roomId, message, username }) => {
    // Broadcast message to all users in the room (including sender)
    io.to(roomId).emit('new-message', { message, userId: socket.id, username });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    
    // Remove user from all rooms
    rooms.forEach((room, roomId) => {
      const userIndex = room.users.findIndex(u => u.socketId === socket.id);
      if (userIndex !== -1) {
        const user = room.users[userIndex];
        room.users.splice(userIndex, 1);
        
        // Notify others that user left
        socket.to(roomId).emit('user-left', { userId: user.userId, username: user.username });
        
        // Update active users list
        const usernames = room.users.map(u => u.username);
        io.to(roomId).emit('active-users', { users: usernames });
        
        console.log(`👋 ${user.username} left room: ${roomId}`);
        
        // Remove room if empty
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