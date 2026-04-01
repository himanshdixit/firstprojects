function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toList(value, fallback = []) {
  if (!value) {
    return fallback;
  }

  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

const appConfig = {
  env: process.env.NODE_ENV || 'development',
  port: toNumber(process.env.PORT, 5000),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/Codex_test_db',
  mongoDbName: 'Codex_test_db',
  backendPublicUrl: (process.env.BACKEND_PUBLIC_URL || '').replace(/\/+$/, ''),
  corsOrigins: toList(process.env.CORS_ORIGIN, ['http://localhost:3000']),
  bodyLimit: process.env.REQUEST_BODY_LIMIT || '1mb',
  jwt: {
    accessExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
  },
  rateLimits: {
    apiMax: toNumber(process.env.API_RATE_LIMIT_MAX, 300),
    authMax: toNumber(process.env.AUTH_RATE_LIMIT_MAX, 20),
  },
};

appConfig.isProduction = appConfig.env === 'production';
appConfig.isDevelopment = appConfig.env === 'development';

module.exports = appConfig;
