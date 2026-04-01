const authService = require('../services/auth.service');
const userService = require('../services/user.service');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');
const { getUploadedFileUrl } = require('../middlewares/upload.middleware');
const { REFRESH_COOKIE_NAME, setAuthCookies, clearAuthCookies } = require('../utils/authCookies');

exports.register = catchAsync(async (req, res) => {
  const payload = { ...req.body };
  if (req.file) {
    payload.avatar = getUploadedFileUrl(req, 'avatars', req.file.filename);
  }

  const { user, accessToken, refreshToken } = await authService.register(payload);
  setAuthCookies(res, accessToken, refreshToken);

  return sendSuccess(res, {
    statusCode: 201,
    message: 'User registered successfully',
    data: {
      user: authService.getPublicUser(user),
      accessToken,
      refreshToken: refreshToken || undefined,
    },
  });
});

exports.login = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  setAuthCookies(res, accessToken, refreshToken);

  return sendSuccess(res, {
    message: 'Login successful',
    data: {
      user: authService.getPublicUser(user),
      accessToken,
      refreshToken: refreshToken || undefined,
    },
  });
});

exports.refresh = catchAsync(async (req, res) => {
  const tokenFromCookie = req.cookies ? req.cookies[REFRESH_COOKIE_NAME] : null;
  const tokenFromBody = req.body ? req.body.refreshToken : null;
  const token = tokenFromCookie || tokenFromBody;

  const { accessToken, refreshToken } = await authService.refreshAccessToken(token);
  setAuthCookies(res, accessToken, refreshToken);

  return sendSuccess(res, {
    message: 'Token refreshed successfully',
    data: {
      accessToken,
      refreshToken: refreshToken || undefined,
    },
  });
});

exports.logout = catchAsync(async (_req, res) => {
  clearAuthCookies(res);
  return sendSuccess(res, { message: 'Logout successful' });
});

exports.getProfile = catchAsync(async (req, res) => {
  const user = await userService.getProfile(req.user.id);
  return sendSuccess(res, {
    data: {
      user: authService.getPublicUser(user),
    },
  });
});

exports.updateProfile = catchAsync(async (req, res) => {
  const payload = { ...req.body };
  if (req.file) {
    payload.avatar = getUploadedFileUrl(req, 'avatars', req.file.filename);
  }

  const user = await userService.updateProfile(req.user.id, payload);

  return sendSuccess(res, {
    message: 'Profile updated successfully',
    data: {
      user: authService.getPublicUser(user),
    },
  });
});
