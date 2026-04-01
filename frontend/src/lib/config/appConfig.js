const DEFAULT_BACKEND_API_URL = 'http://localhost:5000/api';
const DEFAULT_SITE_URL = 'http://localhost:3000';

export const appConfig = {
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, ''),
  publicApiUrl: (process.env.NEXT_PUBLIC_API_URL || DEFAULT_BACKEND_API_URL).replace(/\/$/, ''),
  serverApiUrl: (process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || DEFAULT_BACKEND_API_URL).replace(/\/$/, ''),
  requestTimeoutMs: 15000,
  auth: {
    tokenCookieName: 'auth_token',
    roleCookieName: 'auth_role',
    sessionMaxAgeSeconds: 60 * 15,
    secureCookies: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  },
};

export function getBackendOrigin() {
  return appConfig.publicApiUrl.replace(/\/api\/?$/, '');
}
