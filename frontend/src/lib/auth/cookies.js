import { appConfig } from '@/lib/config/appConfig';

export function buildAuthCookieOptions(overrides = {}) {
  return {
    httpOnly: true,
    secure: appConfig.auth.secureCookies,
    sameSite: appConfig.auth.sameSite,
    path: '/',
    ...overrides,
  };
}

export function clearAuthCookies(response) {
  response.cookies.set(appConfig.auth.tokenCookieName, '', buildAuthCookieOptions({ maxAge: 0 }));
  response.cookies.set(appConfig.auth.roleCookieName, '', buildAuthCookieOptions({ maxAge: 0 }));
}

export function setSessionCookies(response, accessToken, role = 'user') {
  response.cookies.set(
    appConfig.auth.tokenCookieName,
    accessToken,
    buildAuthCookieOptions({ maxAge: appConfig.auth.sessionMaxAgeSeconds })
  );

  response.cookies.set(
    appConfig.auth.roleCookieName,
    role,
    buildAuthCookieOptions({ maxAge: appConfig.auth.sessionMaxAgeSeconds })
  );
}
