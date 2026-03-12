import { appApiClient } from './apiClient';

export async function getAdminUsers(params = {}) {
  const { data } = await appApiClient.get('/admin/users', { params });
  return data;
}

export async function getAdminPosts(params = {}) {
  const { data } = await appApiClient.get('/admin/posts', { params });
  return data;
}

export async function getAdminAnalytics() {
  const { data } = await appApiClient.get('/admin/analytics');
  return data;
}

export async function updateAdminUser(id, payload) {
  const { data } = await appApiClient.patch(`/admin/users/${id}`, payload);
  return data;
}

export async function updateAdminPost(id, payload) {
  const { data } = await appApiClient.patch(`/admin/posts/${id}`, payload);
  return data;
}

export async function deleteAdminUser(id) {
  const { data } = await appApiClient.delete(`/admin/users/${id}`);
  return data;
}

export async function deleteAdminPost(id) {
  const { data } = await appApiClient.delete(`/admin/posts/${id}`);
  return data;
}
