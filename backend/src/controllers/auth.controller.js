const authService = require('../services/auth.service');
const userService = require('../services/user.service');
const catchAsync = require('../utils/catchAsync');
const { getUploadedFileUrl } = require('../middlewares/upload.middleware');

const REFRESH_COOKIE_NAME = 'refreshToken';

function setRefreshCookie(res, refreshToken) {
  if (!refreshToken) return;

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
}

exports.register = catchAsync(async (req, res) => {
  const payload = { ...req.body };
  if (req.file) {
    payload.avatar = getUploadedFileUrl(req, 'avatars', req.file.filename);
  }

  const { user, accessToken, refreshToken } = await authService.register(payload);
  setRefreshCookie(res, refreshToken);

  return res.status(201).json({
    success: true,
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
  setRefreshCookie(res, refreshToken);

  return res.status(200).json({
    success: true,
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
  setRefreshCookie(res, refreshToken);

  return res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      accessToken,
      refreshToken: refreshToken || undefined,
    },
  });
});

exports.logout = catchAsync(async (_req, res) => {
  clearRefreshCookie(res);
  return res.status(200).json({ success: true, message: 'Logout successful' });
});

exports.getProfile = catchAsync(async (req, res) => {
  const user = await userService.getProfile(req.user.id);
  return res.status(200).json({
    success: true,
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

  return res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: authService.getPublicUser(user),
    },
  });
});
