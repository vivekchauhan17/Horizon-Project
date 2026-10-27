import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import routes from './routes/api.routes.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';

const app = express();
app.set('trust proxy', 1); // Render runs behind a proxy

// Always allowed: local dev + your live frontend.
// Anything in FRONTEND_ORIGIN (comma-separated) is added on top.
const defaults = ['http://localhost:5173', 'https://horizon-project-qfjm.onrender.com'];
const fromEnv = (process.env.FRONTEND_ORIGIN || '')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);
const origins = [...new Set([...defaults, ...fromEnv])];

app.use(cors({ origin: origins }));
app.use(express.json({ limit: '1mb' }));
app.use(
  '/api',
  rateLimit({
    windowMs: 60_000,
    limit: 30,
    message: { error: 'Too many requests. Please wait a minute.' },
  })
);
app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

export default app;