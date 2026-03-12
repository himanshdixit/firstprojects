const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Missing JWT_SECRET');
  }
  return secret;
}

function getRefreshSecret() {
  return process.env.JWT_REFRESH_SECRET;
}

function buildTokenPayload(user) {
  return {
    sub: user._id.toString(),
    role: user.role,
    email: user.email,
  };
}

function signAccessToken(user) {
  return jwt.sign(buildTokenPayload(user), getJwtSecret(), {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
}

function signRefreshToken(user) {
  const refreshSecret = getRefreshSecret();
  if (!refreshSecret) {
    return null;
  }

  return jwt.sign(
    { sub: user._id.toString(), tokenType: 'refresh' },
    refreshSecret,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, getJwtSecret());
}

function verifyRefreshToken(token) {
  const refreshSecret = getRefreshSecret();
  if (!refreshSecret) {
    throw new Error('Missing JWT_REFRESH_SECRET');
  }
  return jwt.verify(token, refreshSecret);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
