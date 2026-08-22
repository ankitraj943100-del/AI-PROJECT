import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config/env';
import { connectDB } from './config/db';
import { initKafkaPipeline } from './services/eventPipeline';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/authRoutes';
import documentRoutes from './routes/documentRoutes';
import taskRoutes from './routes/taskRoutes';
import teamRoutes from './routes/teamRoutes';
import aiRoutes from './routes/aiRoutes';

const app = express();

// Middleware
app.use(
  cors({
    origin: [config.frontendUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    env: config.nodeEnv,
  });
});

// Global Error Handler
app.use(errorHandler);

const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Initialize Kafka Event Pipeline (with async fallback)
  await initKafkaPipeline();

  app.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`🚀 PDF Orchestrator Backend running on port ${config.port}`);
    console.log(`🌐 Frontend Origin: ${config.frontendUrl}`);
    console.log(`=======================================================`);
  });
};

startServer();
