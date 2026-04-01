const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const appConfig = require('../config/app.config');
const sanitizeRequest = require('./sanitize.middleware');

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  if (appConfig.corsOrigins.includes('*')) {
    return true;
  }

  return appConfig.corsOrigins.includes(origin);
}

function corsOptionsDelegate(req, callback) {
  const origin = req.header('Origin');

  callback(null, {
    origin: isAllowedOrigin(origin),
    credentials: true,
  });
}

function applySecurityMiddleware(app) {
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
      referrerPolicy: { policy: 'no-referrer-when-downgrade' },
    })
  );
  app.use(cors(corsOptionsDelegate));
  app.use(compression());
  app.use(expressJsonWithLimit());
  app.use(expressUrlEncoded());
  app.use(cookieParser());
  app.use(sanitizeRequest);
  app.use('/uploads', appStaticUploads());
}

function expressJsonWithLimit() {
  return express.json({ limit: appConfig.bodyLimit });
}

function expressUrlEncoded() {
  return express.urlencoded({ extended: true, limit: appConfig.bodyLimit });
}

function appStaticUploads() {
  return express.static(path.join(__dirname, '..', '..', 'uploads'));
}

module.exports = {
  applySecurityMiddleware,
};
