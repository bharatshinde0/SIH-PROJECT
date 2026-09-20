import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import analyticsRoutes from './routes/analytics.js';
import resourceRoutes from './routes/resources.js';
import riskRoutes from './routes/risk.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 600 }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'land-risk-api', prototypePrediction: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api', resourceRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

async function start() {
  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI is not set. API will start, but database routes require MongoDB.');
  } else {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  }
  app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
}

app.get("/", (req, res) => {
  res.json({
    message: "SIH Land Risk Intelligence Backend is running",
    status: "OK"
  });
});


start().catch((error) => {
  console.error(error);
  process.exit(1);
});
