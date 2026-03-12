import axios from 'axios';

// const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
// const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-sdzh.onrender.com/api';
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://firstprojects-tiz9.onrender.com/api';

let accessToken = null;

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
    (error) => {
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
  timeout: 15000,
});

export const backendApiClient = axios.create({
  baseURL: BACKEND_API_URL,
  withCredentials: true,
  timeout: 15000,
});

applyInterceptors(appApiClient);
applyInterceptors(backendApiClient);
