import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { connectDB } from './config/db.js';
import generateRoutes from './routes/generateRoutes.js';
import evaluationRoutes from './routes/evaluationRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:4173',
  // Add your Vercel URL here after deployment
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Allow non-browser requests (Postman, curl) and listed origins
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS blocked: ${origin}`));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false }));

// ── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/generate',    generateRoutes);
app.use('/api/evaluate',    evaluationRoutes);
app.use('/api/evaluations', evaluationRoutes);

// ── Error handling ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
async function start() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   MongoDB: ${process.env.MONGODB_URI?.split('@').pop() || 'localhost'}`);
  });
}

start().catch(err => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});

export default app;
