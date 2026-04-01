require('dotenv').config();
const express = require('express');
const apiRoutes = require('./routes');
const errorMiddleware = require('./middlewares/error.middleware');
const notFoundMiddleware = require('./middlewares/notFound.middleware');
const { apiRateLimiter } = require('./middlewares/rateLimit.middleware');
const { applySecurityMiddleware } = require('./middlewares/security.middleware');
const { sendSuccess } = require('./utils/apiResponse');

const app = express();

applySecurityMiddleware(app);

app.get('/health', (_req, res) => {
  return sendSuccess(res, {
    message: 'OK',
    data: {
      service: 'draftsphere-backend',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

app.use('/api', apiRateLimiter);
app.use('/api', apiRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
