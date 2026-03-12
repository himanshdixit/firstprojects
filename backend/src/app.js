require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const apiRoutes = require('./routes');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/health', (_req, res) => {
  return res.status(200).json({ success: true, message: 'OK' });
});

app.use('/api', apiRoutes);

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

app.use(errorMiddleware);

module.exports = app;
