import { appConfig } from '@/lib/config/appConfig';

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildUnavailableResponse(message, status = 502) {
  const data = {
    success: false,
    message,
  };

  return {
    response: new Response(JSON.stringify(data), {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }),
    data,
  };
}

export async function backendRequest(path, options = {}) {
  const {
    cache,
    next,
    headers: providedHeaders,
    timeoutMs = appConfig.requestTimeoutMs,
    ...requestOptions
  } = options;
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const resolvedCache = cache ?? (!next ? 'no-store' : undefined);
  const method = String(requestOptions.method || 'GET').toUpperCase();
  const maxAttempts = method === 'GET' ? 2 : 1;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${appConfig.serverApiUrl}${path}`, {
        ...requestOptions,
        headers: {
          ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
          ...(providedHeaders || {}),
        },
        signal: controller.signal,
        ...(resolvedCache ? { cache: resolvedCache } : {}),
        ...(next ? { next } : {}),
      });

      const data = await response.json().catch(() => ({}));
      clearTimeout(timeoutId);

      const shouldRetry =
        method === 'GET' &&
        attempt < maxAttempts - 1 &&
        (response.status === 429 || response.status >= 500);

      if (shouldRetry) {
        await wait(200 * (attempt + 1));
        continue;
      }

      return { response, data };
    } catch (error) {
      clearTimeout(timeoutId);

      const shouldRetry = method === 'GET' && attempt < maxAttempts - 1;
      if (shouldRetry) {
        await wait(200 * (attempt + 1));
        continue;
      }

      if (error?.name === 'AbortError') {
        return buildUnavailableResponse('The request timed out while contacting the backend.', 504);
      }

      return buildUnavailableResponse('The backend service is temporarily unavailable.', 502);
    }
  }

  return buildUnavailableResponse('The backend service is temporarily unavailable.', 502);
}

export function authHeadersFromToken(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}
