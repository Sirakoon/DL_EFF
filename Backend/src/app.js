const express = require('express');
const { connect } = require('./config/db');
const rawDataTestRoutes = require('./routes/rawDataTest');

const app = express();
app.use(express.json());

connect().catch((err) => {
  console.error('Fatal: could not connect to database', err.message);
  process.exit(1);
});

app.use('/api/raw-data-test', rawDataTestRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

module.exports = app;
