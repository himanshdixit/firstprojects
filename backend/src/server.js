require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const connectDB = require('./config/db');
const appConfig = require('./config/app.config');

let server;

async function shutdown(signal, exitCode = 0) {
  // eslint-disable-next-line no-console
  console.log(`${signal} received. Shutting down gracefully...`);

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
    }

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    process.exit(exitCode);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Graceful shutdown failed', error);
    process.exit(1);
  }
}

function registerProcessHandlers() {
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  process.on('uncaughtException', (error) => {
    // eslint-disable-next-line no-console
    console.error('Uncaught exception', error);
    shutdown('uncaughtException', 1);
  });

  process.on('unhandledRejection', (error) => {
    // eslint-disable-next-line no-console
    console.error('Unhandled rejection', error);
    shutdown('unhandledRejection', 1);
  });
}

async function startServer() {
  await connectDB();

  server = app.listen(appConfig.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${appConfig.port}`);
  });

  server.on('error', (error) => {
    // eslint-disable-next-line no-console
    console.error('Server failed to start', error);
    shutdown('serverError', 1);
  });
}

registerProcessHandlers();

startServer().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server', error);
  process.exit(1);
});
