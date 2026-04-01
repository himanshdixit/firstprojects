const rateLimit = require('express-rate-limit');
const appConfig = require('../config/app.config');

function buildRateLimiter(options) {
  return rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
  });
}

const apiRateLimiter = buildRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: appConfig.rateLimits.apiMax,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});

const authRateLimiter = buildRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: appConfig.rateLimits.authMax,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
});

module.exports = {
  apiRateLimiter,
  authRateLimiter,
};
