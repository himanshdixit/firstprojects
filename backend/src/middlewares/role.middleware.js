const AppError = require('../utils/AppError');

exports.requireRole = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Forbidden: insufficient role', 403));
    }

    return next();
  };
};

exports.requireAdmin = exports.requireRole('admin');
