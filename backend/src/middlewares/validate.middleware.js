const { z } = require('zod');
const AppError = require('../utils/AppError');

function flattenZodError(error) {
  return error.issues.map((issue) => {
    const path = issue.path.length ? issue.path.join('.') : 'request';
    return `${path}: ${issue.message}`;
  });
}

function parseWithSchema(schema, value) {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new AppError(flattenZodError(result.error).join(', '), 400);
  }
  return result.data;
}

function validateRequest({ body, query, params, allowEmptyBodyWithFile = false } = {}) {
  return (req, _res, next) => {
    try {
      if (body) {
        const isFileOnlyBody = allowEmptyBodyWithFile && req.file && (!req.body || Object.keys(req.body).length === 0);
        if (!isFileOnlyBody) {
          req.body = parseWithSchema(body, req.body || {});
        }
      }

      if (query) {
        req.query = parseWithSchema(query, req.query || {});
      }

      if (params) {
        req.params = parseWithSchema(params, req.params || {});
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = {
  validateRequest,
  z,
};
