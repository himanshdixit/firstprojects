import { appApiClient } from './apiClient';

const CACHE_TTL_MS = 10 * 1000;
const commentCache = new Map();
const inflightRequests = new Map();

function cacheKeyFromParams(params = {}) {
  return Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${String(value)}`)
    .join('|');
}

function getCached(key) {
  const hit = commentCache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    commentCache.delete(key);
    return null;
  }
  return hit.value;
}

function setCached(key, value) {
  commentCache.set(key, {
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

function clearCommentCache() {
  commentCache.clear();
}

export async function getComments(params = {}) {
  const key = cacheKeyFromParams(params);
  const cached = getCached(key);
  if (cached) {
    return cached;
  }

  const data = await getOrCreateInflight(`comments:${key}`, async () => {
    const response = await appApiClient.get('/comments', { params });
    return response.data;
  });

  setCached(key, data);
  return data;
}

export async function createComment(payload) {
  const { data } = await appApiClient.post('/comments', payload);
  clearCommentCache();
  return data;
}

export async function updateComment(id, payload) {
  const { data } = await appApiClient.patch(`/comments/${id}`, payload);
  clearCommentCache();
  return data;
}

export async function deleteComment(id) {
  const { data } = await appApiClient.delete(`/comments/${id}`);
  clearCommentCache();
  return data;
}

export async function toggleCommentLike(id) {
  const { data } = await appApiClient.patch(`/comments/${id}/like`);
  clearCommentCache();
  return data;
}
