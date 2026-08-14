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
app.use('/api/pd-input', pdInputRoutes);

app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} —`, err);
  res.status(500).json({ error: isProduction ? 'Internal server error' : (err.message || 'Internal server error') });
});

module.exports = app;
