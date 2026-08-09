require('dotenv').config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

const DEV_ORIGINS = 'http://localhost:5173,http://localhost:5174';
const PLACEHOLDER_JWT_SECRET = 'change-me-to-a-long-random-string';

function fail(message) {
  console.error(`Fatal: ${message}`);
  process.exit(1);
}

if (!process.env.DB_SERVER) fail('DB_SERVER is not set (see .env)');
if (!process.env.DB_NAME) fail('DB_NAME is not set (see .env)');
if (!process.env.JWT_SECRET) fail('JWT_SECRET is not set (see .env)');
if (isProduction && process.env.JWT_SECRET === PLACEHOLDER_JWT_SECRET) {
  fail('JWT_SECRET is still the placeholder value — set a real secret before running in production');
}
if (isProduction && !process.env.CORS_ORIGINS) {
  fail('CORS_ORIGINS is not set — required in production (no localhost fallback)');
}

const corsOrigins = (process.env.CORS_ORIGINS || DEV_ORIGINS).split(',').map((o) => o.trim());

module.exports = {
  NODE_ENV,
  isProduction,
  PORT: process.env.PORT || 3000,
  corsOrigins,
};
