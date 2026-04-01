const appConfig = require('../config/app.config');

const ACCESS_COOKIE_NAME = 'auth_token';
const REFRESH_COOKIE_NAME = 'refresh_token';

function isProduction() {
  return appConfig.isProduction;
}

function baseCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction(),
    sameSite: isProduction() ? 'none' : 'lax',
    path: '/',
  };
}

function parseExpiryToMs(value, fallbackMs) {
  if (!value || typeof value !== 'string') {
    return fallbackMs;
  }

  const match = value.trim().match(/^(\d+)([smhd])$/i);
  if (!match) {
    return fallbackMs;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const unitMap = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * unitMap[unit];
}

function accessCookieOptions() {
  return {
    ...baseCookieOptions(),
    maxAge: parseExpiryToMs(appConfig.jwt.accessExpiresIn, 15 * 60 * 1000),
  };
}

function refreshCookieOptions() {
  return {
    ...baseCookieOptions(),
    maxAge: parseExpiryToMs(appConfig.jwt.refreshExpiresIn, 7 * 24 * 60 * 60 * 1000),
  };
}

function setAuthCookies(res, accessToken, refreshToken) {
  if (accessToken) {
    res.cookie(ACCESS_COOKIE_NAME, accessToken, accessCookieOptions());
  }

  if (refreshToken) {
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
  }
}

function clearAuthCookies(res) {
  res.clearCookie(ACCESS_COOKIE_NAME, baseCookieOptions());
  res.clearCookie(REFRESH_COOKIE_NAME, baseCookieOptions());
}

module.exports = {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  setAuthCookies,
  clearAuthCookies,
};
