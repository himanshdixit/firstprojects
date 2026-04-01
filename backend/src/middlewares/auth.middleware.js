const AppError = require('../utils/AppError');
const { verifyAccessToken } = require('../utils/jwt');
const { ACCESS_COOKIE_NAME } = require('../utils/authCookies');

function extractBearerToken(authorizationHeader) {
  if (!authorizationHeader) return null;

  const parts = authorizationHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

  return parts[1];
}

function extractToken(req) {
  const bearerToken = extractBearerToken(req.headers.authorization);
  if (bearerToken) {
    return bearerToken;
  }

  if (req.cookies && req.cookies[ACCESS_COOKIE_NAME]) {
    return req.cookies[ACCESS_COOKIE_NAME];
  }

  return null;
}

function attachUser(req, decoded) {
  req.user = {
    id: decoded.sub,
    role: decoded.role,
    email: decoded.email,
  };
}

exports.requireAuth = (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return next(new AppError('Authentication required', 401));
    }

    const decoded = verifyAccessToken(token);
    if (decoded.tokenType && decoded.tokenType !== 'access') {
      throw new Error('Invalid token type');
    }
    attachUser(req, decoded);

    return next();
  } catch (error) {
    return next(new AppError('Invalid or expired token', 401));
  }
};

exports.optionalAuth = (req, _res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return next();
    }

    const decoded = verifyAccessToken(token);
    if (decoded.tokenType && decoded.tokenType !== 'access') {
      throw new Error('Invalid token type');
    }
    attachUser(req, decoded);

    return next();
  } catch (_error) {
    return next();
  }
};
