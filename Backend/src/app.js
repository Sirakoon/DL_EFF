const path = require('path');
const express = require('express');
const cors = require('cors');
const { connect, getPool } = require('./config/db');
const { corsOrigins, isProduction } = require('./config/env');
const requestLogger = require('./middleware/requestLogger');
const dashboardRoutes = require('./routes/dashboard');
const dlEffRoutes = require('./routes/dlEff');
const pdInputRoutes = require('./routes/pdInput');
const authRoutes = require('./routes/auth');
const machineRoutes = require('./routes/machine')
const productRoutes = require('./routes/product')
const productGroupRoutes = require('./routes/productgroup')

const app = express();
app.use(express.json());
app.use(cors({ origin: corsOrigins }));
app.use(requestLogger);

connect().catch((err) => {
  console.error('Fatal: could not connect to database', err.message);
  process.exit(1);
});

app.get('/health', async (req, res) => {
  try {
    await getPool().request().query('SELECT 1');
    res.json({ status: 'ok', uptime: process.uptime() });
  } catch (err) {
    res.status(503).json({ status: 'db_unavailable', uptime: process.uptime() });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/dl-eff', dlEffRoutes);
app.use('/api/machine', machineRoutes);
app.use('/api/product', productRoutes);
app.use('/api/productgroup', productGroupRoutes);
app.use('/api/pd-input', pdInputRoutes);

// Serve the built frontend (Frontend `npm run build` emits into this folder,
// see Frontend/vite.config.js) so the whole app runs behind a single port.
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// SPA fallback: any other GET request (client-side routes from react-router)
// gets index.html so deep links / refreshes work. Placed after the routes
// above and the static middleware so /api/*, /health and real static files
// are never shadowed by this.
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api') || req.path === '/health') {
    return next();
  }
  res.sendFile(path.join(publicDir, 'index.html'), (err) => {
    if (err) next(err);
  });
});

app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} —`, err);
  res.status(500).json({ error: isProduction ? 'Internal server error' : (err.message || 'Internal server error') });
});

module.exports = app;
