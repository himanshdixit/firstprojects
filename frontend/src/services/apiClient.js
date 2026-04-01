import axios from 'axios';
import { appConfig } from '@/lib/config/appConfig';

let accessToken = null;
const RETRYABLE_METHODS = new Set(['get', 'head', 'options']);

export function setAccessToken(token) {
  accessToken = token || null;
}

function mapAxiosError(error) {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'Request failed';

  const normalizedError = new Error(message);
  normalizedError.status = error?.response?.status || 500;
  normalizedError.payload = error?.response?.data || null;
  return normalizedError;
}

function applyInterceptors(client) {
  client.interceptors.request.use((config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const config = error?.config || {};
      const method = String(config.method || 'get').toLowerCase();
      const retryCount = config.__retryCount || 0;
      const shouldRetry =
        RETRYABLE_METHODS.has(method) &&
        retryCount < 1 &&
        (!error?.response ||
          error?.code === 'ECONNABORTED' ||
          error?.response?.status === 429 ||
          error?.response?.status >= 500);

      if (shouldRetry) {
        config.__retryCount = retryCount + 1;
        await new Promise((resolve) => setTimeout(resolve, 250));
        return client(config);
      }

      if (error?.response?.status === 401) {
        setAccessToken(null);
      }
      return Promise.reject(mapAxiosError(error));
    }
  );
}

export const appApiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: appConfig.requestTimeoutMs,
});

export const backendApiClient = axios.create({
  baseURL: appConfig.publicApiUrl,
  withCredentials: true,
  timeout: appConfig.requestTimeoutMs,
});

applyInterceptors(appApiClient);
applyInterceptors(backendApiClient);
