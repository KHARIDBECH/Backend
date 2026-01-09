
import http from 'http';
import mongoose from 'mongoose';
import app from './app.js';
import { envConfig } from './config/env.config.js';
import logger from './utils/logger.js';
import { initSocket } from './utils/socket.js';

const port = envConfig.port;
app.set('port', port);

const server = http.createServer(app);
initSocket(server);

const serverErrorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  switch (error.code) {
    case 'EACCES':
      logger.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

server.on('error', serverErrorHandler);
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  logger.info('Listening on ' + bind);
});

server.listen(port);

// Graceful Shutdown
const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
      mongoose.connection.close(false, () => {
        logger.info('Mongo connection closed');
        process.exit(0);
      });
    });
  } else {
    process.exit(0);
  }
};

const unexpectedErrorHandler = error => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});

process.on('SIGINT', () => {
  logger.info('SIGINT received');
  exitHandler();
});
