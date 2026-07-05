const express = require('express');
const { connect } = require('./config/db');
const rawDataTestRoutes = require('./routes/rawDataTest');
const dashboardRoutes = require('./routes/dashboard');
const dlEffRoutes = require('./routes/dlEff');
const pdInputRoutes = require('./routes/pdInput');

const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'] }));

connect().catch((err) => {
  console.error('Fatal: could not connect to database', err.message);
  process.exit(1);
});

app.use('/api/raw-data-test', rawDataTestRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/dl-eff', dlEffRoutes);
app.use('/api/pd-input', pdInputRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

module.exports = app;
