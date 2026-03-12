import { appApiClient, setAccessToken } from './apiClient';

export async function registerUser(payload) {
  const { data } = await appApiClient.post('/auth/register', payload);
  setAccessToken(data?.data?.accessToken);
  return data;
}

export async function loginUser(payload) {
  const { data } = await appApiClient.post('/auth/login', payload);
  setAccessToken(data?.data?.accessToken);
  return data;
}

export async function logoutUser() {
  const { data } = await appApiClient.post('/auth/logout');
  setAccessToken(null);
  return data;
}

export async function getCurrentUser() {
  const { data } = await appApiClient.get('/auth/me');
  return data;
}

export async function updateCurrentUser(payload) {
  const { data } = await appApiClient.patch('/auth/me', payload);
  return data;
}
