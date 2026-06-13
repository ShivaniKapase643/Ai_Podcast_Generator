import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

import healthRoutes from './src/routes/health.js';
import episodeRoutes from './src/routes/episodes.js';
import generateRoutes from './src/routes/generate.js';
import subscriberRoutes from './src/routes/subscribers.js';
import userRoutes from './src/routes/users.js';
import { apiKeyAuth } from './src/middleware/auth.js';
import { generalLimiter } from './src/middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './src/middleware/errorHandler.js';
import { startScheduler } from './src/scheduler/cronJob.js';
import { isAutoGenerateEnabled, getSchedule, toggleAutoGenerate } from './src/scheduler/cronJob.js';
import { ensureDirectories } from './src/utils/fileManager.js';
import { seedDemoData } from './src/database/seed.js';
import logger from './src/utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure required directories exist
ensureDirectories();

// Seed demo data if database is empty
seedDemoData();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false
}));
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(generalLimiter);
app.use(apiKeyAuth);

// API Routes
app.use('/api', healthRoutes);
app.use('/api', episodeRoutes);
app.use('/api', generateRoutes);
app.use('/api', subscriberRoutes);
app.use('/api', userRoutes);

// Schedule toggle endpoints
app.post('/api/schedule/toggle', (req, res) => {
  try {
    const { enabled } = req.body;
    toggleAutoGenerate(enabled);
    res.json({ enabled: isAutoGenerateEnabled(), schedule: getSchedule() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/schedule/status', (req, res) => {
  res.json({
    enabled: isAutoGenerateEnabled(),
    schedule: getSchedule(),
    timezone: process.env.CRON_TIMEZONE || 'Asia/Kolkata'
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 AI News Podcast Backend running on port ${PORT}`);
  logger.info(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);

  // Start cron scheduler
  startScheduler();
});

export default app;
