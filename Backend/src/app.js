const express = require('express');
const cors = require('cors');
const { connect } = require('./config/db');
const { corsOrigins, isProduction } = require('./config/env');
const rawDataTestRoutes = require('./routes/rawDataTest');
const dashboardRoutes = require('./routes/dashboard');
const dlEffRoutes = require('./routes/dlEff');
const pdInputRoutes = require('./routes/pdInput');
const authRoutes = require('./routes/auth');

const app = express();
app.use(express.json());
app.use(cors({ origin: corsOrigins }));

connect().catch((err) => {
  console.error('Fatal: could not connect to database', err.message);
  process.exit(1);
});

app.use('/api/auth', authRoutes);
app.use('/api/raw-data-test', rawDataTestRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/dl-eff', dlEffRoutes);
app.use('/api/pd-input', pdInputRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: isProduction ? 'Internal server error' : (err.message || 'Internal server error') });
});

module.exports = app;
