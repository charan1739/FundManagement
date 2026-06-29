/**
 * Singleton wrapper for Socket.io instance.
 * Call initSocket(httpServer) once from server.js,
 * then getIO() anywhere in the app.
 */
let io = null;

const initSocket = (httpServer) => {
  const { Server } = require('socket.io');
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      socket.join(`user:${userId}`);
    }

    socket.on('join:group', (groupId) => {
      socket.join(`group:${groupId}`);
    });

    socket.on('leave:group', (groupId) => {
      socket.leave(`group:${groupId}`);
    });

    socket.on('disconnect', () => {});
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized — call initSocket(httpServer) first');
  return io;
};

module.exports = { initSocket, getIO };
