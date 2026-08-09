const { PORT, corsOrigins, NODE_ENV } = require('./src/config/env');
const http = require('http');
const app = require('./src/app');
const { initSocket } = require('./src/realtime');

process.on('uncaughtException', (err) => {
  console.error(`[${new Date().toISOString()}] Fatal: uncaughtException`, err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error(`[${new Date().toISOString()}] Fatal: unhandledRejection`, reason);
  process.exit(1);
});

const server = http.createServer(app);
initSocket(server, corsOrigins);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} (${NODE_ENV})`);
});
