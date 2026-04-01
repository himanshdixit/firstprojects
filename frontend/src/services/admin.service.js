import { appApiClient } from './apiClient';

const CACHE_TTL_MS = 10 * 1000;
const adminCache = new Map();
const inflightRequests = new Map();

function cacheKeyFromParams(prefix, params = {}) {
  const suffix = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${String(value)}`)
    .join('|');

  return suffix ? `${prefix}:${suffix}` : prefix;
}

function getCached(key) {
  const hit = adminCache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    adminCache.delete(key);
    return null;
  }
  return hit.value;
}

function setCached(key, value) {
  adminCache.set(key, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

async function getOrCreateInflight(key, loader) {
  const existing = inflightRequests.get(key);
  if (existing) {
    return existing;
  }

  const promise = loader().finally(() => inflightRequests.delete(key));
  inflightRequests.set(key, promise);
  return promise;
}

function clearAdminCache() {
  adminCache.clear();
}

export async function getAdminUsers(params = {}) {
  const key = cacheKeyFromParams('admin:users', params);
  const cached = getCached(key);
  if (cached) {
    return cached;
  }

  const data = await getOrCreateInflight(key, async () => {
    const response = await appApiClient.get('/admin/users', { params });
    return response.data;
  });

  setCached(key, data);
  return data;
}

export async function getAdminPosts(params = {}) {
  const key = cacheKeyFromParams('admin:posts', params);
  const cached = getCached(key);
  if (cached) {
    return cached;
  }

  const data = await getOrCreateInflight(key, async () => {
    const response = await appApiClient.get('/admin/posts', { params });
    return response.data;
  });

  setCached(key, data);
  return data;
}

export async function getAdminAnalytics() {
  const key = 'admin:analytics';
  const cached = getCached(key);
  if (cached) {
    return cached;
  }

  const data = await getOrCreateInflight(key, async () => {
    const response = await appApiClient.get('/admin/analytics');
    return response.data;
  });

  setCached(key, data);
  return data;
}

export async function getAdminComments(params = {}) {
  const key = cacheKeyFromParams('admin:comments', params);
  const cached = getCached(key);
  if (cached) {
    return cached;
  }

  const data = await getOrCreateInflight(key, async () => {
    const response = await appApiClient.get('/admin/comments', { params });
    return response.data;
  });

  setCached(key, data);
  return data;
}

export async function getAdminContacts(params = {}) {
  const key = cacheKeyFromParams('admin:contacts', params);
  const cached = getCached(key);
  if (cached) {
    return cached;
  }

  const data = await getOrCreateInflight(key, async () => {
    const response = await appApiClient.get('/admin/contacts', { params });
    return response.data;
  });

  setCached(key, data);
  return data;
}

export async function updateAdminUser(id, payload) {
  const { data } = await appApiClient.patch(`/admin/users/${id}`, payload);
  clearAdminCache();
  return data;
}

export async function updateAdminPost(id, payload) {
  const { data } = await appApiClient.patch(`/admin/posts/${id}`, payload);
  clearAdminCache();
  return data;
}

export async function updateAdminContact(id, payload) {
  const { data } = await appApiClient.patch(`/admin/contacts/${id}`, payload);
  clearAdminCache();
  return data;
}

export async function deleteAdminUser(id) {
  const { data } = await appApiClient.delete(`/admin/users/${id}`);
  clearAdminCache();
  return data;
}

export async function deleteAdminPost(id) {
  const { data } = await appApiClient.delete(`/admin/posts/${id}`);
  clearAdminCache();
  return data;
}

export async function deleteAdminComment(id) {
  const { data } = await appApiClient.delete(`/admin/comments/${id}`);
  clearAdminCache();
  return data;
}

export async function deleteAdminContact(id) {
  const { data } = await appApiClient.delete(`/admin/contacts/${id}`);
  clearAdminCache();
  return data;
}
