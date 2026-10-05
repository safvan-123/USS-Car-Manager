const express = require('express');
const cors = require('cors');
const { AppError } = require('./utils/validation');
const { requireAuth } = require('./middleware/auth');
const app = express();
app.disable('x-powered-by');
const hops = Number(process.env.TRUST_PROXY_HOPS || 0);
if (!Number.isSafeInteger(hops) || hops < 0 || hops > 5) throw new Error('Invalid TRUST_PROXY_HOPS');
app.set('trust proxy', hops);
const origins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174,https://uss-car-manager.vercel.app').split(',').map(s => s.trim()).filter(Boolean);
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Cache-Control', 'no-store');
  next();
});
app.use(cors({
  origin(origin, callback) {
    callback(origin && !origins.includes(origin) ? new AppError(403, 'Origin is not allowed') : null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count', 'X-Page']
}));
app.use(express.json({ limit: '256kb' }));
app.get('/health', (req, res) => {
  const connected = require('mongoose').connection.readyState === 1;
  res.status(connected ? 200 : 503).json({ status: connected ? 'ok' : 'unavailable' });
});
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api', requireAuth);
app.use('/api/cars', require('./routes/carRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/earnings', require('./routes/earningRoutes'));
app.use('/api/partners', require('./routes/partnerRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use((req, res) => res.status(404).json({ error: 'Route not found', message: 'Route not found' }));
app.use(require('./middleware/errors'));
module.exports = app;
