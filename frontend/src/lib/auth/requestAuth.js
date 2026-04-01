import { appConfig } from '@/lib/config/appConfig';

export function getRequestAuthToken(request) {
  const cookieToken = request?.cookies?.get(appConfig.auth.tokenCookieName)?.value;
  if (cookieToken) {
    return cookieToken;
  }

  const authorizationHeader =
    request?.headers?.get('authorization') || request?.headers?.get('Authorization') || '';

  const [scheme, token] = authorizationHeader.split(' ');
  if (!/^Bearer$/i.test(scheme) || !token) {
    return '';
  }

  return token;
}
