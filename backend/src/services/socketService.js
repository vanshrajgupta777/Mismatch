import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        callback(null, true);
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) {
        return next(new Error('Socket authentication error: No token provided'));
      }

      const secret = process.env.JWT_SECRET || 'mismatch_super_secret_jwt_key_987654321';
      const decoded = jwt.verify(token, secret);
      const user = await User.findById(decoded.id).select('_id name gender role');

      if (!user) {
        return next(new Error('Socket authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Socket authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    console.log(`[Socket] User connected: ${socket.user.name} (${userId})`);

    // Join personal user room for direct notifications (matches, like alerts)
    socket.join(`user:${userId}`);

    // Join match chat room
    socket.on('join_chat', (matchId) => {
      socket.join(`chat:${matchId}`);
      console.log(`[Socket] User ${socket.user.name} joined chat:${matchId}`);
    });

    // Leave match chat room
    socket.on('leave_chat', (matchId) => {
      socket.leave(`chat:${matchId}`);
      console.log(`[Socket] User ${socket.user.name} left chat:${matchId}`);
    });

    // Typing indicator
    socket.on('typing', ({ matchId, isTyping }) => {
      socket.to(`chat:${matchId}`).emit('user_typing', {
        userId,
        isTyping,
      });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.user.name}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized');
  }
  return io;
};

/**
 * Emit event to a specific user
 */
export const emitToUser = (userId, event, payload) => {
  if (io) {
    io.to(`user:${userId.toString()}`).emit(event, payload);
  }
};

/**
 * Emit event to a chat conversation
 */
export const emitToChat = (matchId, event, payload) => {
  if (io) {
    io.to(`chat:${matchId.toString()}`).emit(event, payload);
  }
};
