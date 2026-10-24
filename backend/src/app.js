import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import routes from './routes/api.routes.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';

const app = express();
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://horizon-project-backend-tft6.onrender.com'
    ]
}));
app.use(express.json({ limit: '1mb' }));
app.use('/api', rateLimit({ windowMs: 60_000, limit: 30, message: { error: 'Too many requests. Please wait a minute.' } }));
app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);
export default app;
