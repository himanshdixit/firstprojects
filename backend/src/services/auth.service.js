const User = require('../models/User');
const AppError = require('../utils/AppError');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');

async function register(payload) {
  const { name, email, password, avatar } = payload;

  if (!name || !email || !password) {
    throw new AppError('name, email and password are required', 400);
  }

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    throw new AppError('Email already exists', 409);
  }

  const user = await User.create({
    name: name.trim(),
    email,
    password,
    avatar: avatar || '',
  });

  return {
    user,
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user),
  };
}

async function login(payload) {
  const { email, password } = payload;

  if (!email || !password) {
    throw new AppError('email and password are required', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  return {
    user,
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user),
  };
}

async function refreshAccessToken(refreshToken) {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new AppError('Refresh token flow is disabled', 400);
  }

  if (!refreshToken) {
    throw new AppError('Refresh token is required', 401);
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (_error) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const user = await User.findById(decoded.sub);
  if (!user) {
    throw new AppError('Invalid refresh token', 401);
  }

  return {
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user),
  };
}

function getPublicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

module.exports = {
  register,
  login,
  refreshAccessToken,
  getPublicUser,
};
