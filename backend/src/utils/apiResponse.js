function sendSuccess(res, { statusCode = 200, message, data, meta } = {}) {
  const payload = {
    success: true,
    ...(message ? { message } : {}),
    ...(data !== undefined ? { data } : {}),
    ...(meta !== undefined ? { meta } : {}),
  };

  return res.status(statusCode).json(payload);
}

module.exports = {
  sendSuccess,
};
