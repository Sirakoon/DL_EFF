const express = require('express');
const { connect } = require('./config/db');
const routes = require('./api/routes');
const errorHandler = require('./api/middlewares/errorHandler');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.use(errorHandler);

// Connect to SQL Server before exporting
connect().catch((err) => {
  console.error('Failed to connect to database:', err.message);
  process.exit(1);
});

module.exports = app;
