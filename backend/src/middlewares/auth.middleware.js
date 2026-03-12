const { verifyAccessToken } = require('../utils/jwt');

function extractBearerToken(authorizationHeader) {
  if (!authorizationHeader) return null;

  const parts = authorizationHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

  return parts[1];
}

exports.requireAuth = (req, res, next) => {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const decoded = verifyAccessToken(token);
    req.user = {
      id: decoded.sub,
      role: decoded.role,
      email: decoded.email,
    };

    return next();
  } catch (_error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

exports.optionalAuth = (req, _res, next) => {
  try {
    const token = extractBearerToken(req.headers.authorization);
    if (!token) {
      return next();
    }

    const decoded = verifyAccessToken(token);
    req.user = {
      id: decoded.sub,
      role: decoded.role,
      email: decoded.email,
    };

    return next();
  } catch (_error) {
    return next();
  }
};
