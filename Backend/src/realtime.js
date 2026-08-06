

const { Server } = require('socket.io');

let io = null;

function initSocket(httpServer, corsOrigins) {
  io = new Server(httpServer, { cors: { origin: corsOrigins } });
  io.on('connection', (socket) => {
    socket.on('disconnect', () => {});
  });
  return io;
}


function notifyDataChanged(scope) {
  io?.emit('data:changed', { scope, at: Date.now() });
}

module.exports = { initSocket, notifyDataChanged };
