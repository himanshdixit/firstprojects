require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const DEFAULT_PORT = Number(process.env.PORT) || 5000;

function startServer(port) {
  const server = app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      // eslint-disable-next-line no-console
      console.warn(`Port ${port} is in use. Retrying on ${nextPort}...`);
      startServer(nextPort);
      return;
    }

    // eslint-disable-next-line no-console
    console.error('Server error', error);
    process.exit(1);
  });
}

(async () => {
  try {
    await connectDB();
    startServer(DEFAULT_PORT);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server', error);
    process.exit(1);
  }
})();
