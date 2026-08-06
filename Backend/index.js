const { PORT, corsOrigins, NODE_ENV } = require('./src/config/env');
const http = require('http');
const app = require('./src/app');
const { initSocket } = require('./src/realtime');

const server = http.createServer(app);
initSocket(server, corsOrigins);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} (${NODE_ENV})`);
});
