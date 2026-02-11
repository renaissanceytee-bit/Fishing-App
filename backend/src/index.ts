import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cron from 'node-cron';

// Routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import catchRoutes from './routes/catches';
import socialRoutes from './routes/social';
import locationRoutes from './routes/locations';
import weatherRoutes from './routes/weather';
import tournamentRoutes from './routes/tournaments';
import subscriptionRoutes from './routes/subscriptions';
import communityRoutes from './routes/community';
import guideRoutes from './routes/guides';
import aiRoutes from './routes/ai';

// Middleware
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';

// Services
import { setupSocketIO } from './services/socket';
import { cleanupExpiredSessions } from './services/cleanup';

dotenv.config();

const app: Application = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/catches', catchRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/ai', aiRoutes);

// Setup Socket.IO
setupSocketIO(io);

// Error handling
app.use(errorHandler);

// Scheduled tasks
cron.schedule('0 0 * * *', () => {
  // Run daily cleanup tasks
  cleanupExpiredSessions();
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`🎣 Fishing App API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

export { io };
