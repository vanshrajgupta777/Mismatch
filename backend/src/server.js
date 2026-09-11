import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { initSocket } from './services/socketService.js';
import { initCronJobs } from './services/cronService.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import likeRoutes from './routes/likeRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { Room } from './models/Room.js';
import { runSeed } from './scripts/seed.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin || origin === allowedOrigin || origin.startsWith('http://localhost')) {
        callback(null, true);
      } else {
        callback(null, true); // Dev convenience
      }
    },
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Mismatch Dating App API',
    time: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    // 1. Connect to Database (with in-memory fallback)
    await connectDB();

    // Auto-seed demo rooms and profiles if database is empty
    const roomCount = await Room.countDocuments();
    if (roomCount === 0) {
      console.log('[Init] Database is empty. Seeding initial rooms, demo users, and pre-staged match...');
      await runSeed();
    }

    // 2. Initialize Socket.io
    initSocket(server);

    // 3. Initialize Cron Jobs
    initCronJobs();

    // 4. Start HTTP Server
    server.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`  Mismatch Server running on port ${PORT}`);
      console.log(`  Client URL: ${allowedOrigin}`);
      console.log(`=========================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { app, server };
