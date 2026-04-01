import { appApiClient } from './apiClient';

const CACHE_TTL_MS = 30 * 1000;
const postListCache = new Map();
const postDetailCache = new Map();
const inflightRequests = new Map();

function cacheKeyFromParams(params = {}) {
  return Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${String(v)}`)
    .join('|');
}

function getCached(cache, key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    cache.delete(key);
    return null;
  }
  return hit.value;
}

function setCached(cache, key, value) {
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

function clearPostCaches() {
  postListCache.clear();
  postDetailCache.clear();
}

function isSamePost(left, right) {
  if (!left || !right) return false;
  const leftId = String(left._id || '');
  const rightId = String(right._id || '');
  const leftSlug = String(left.slug || '');
  const rightSlug = String(right.slug || '');

  return (leftId && rightId && leftId === rightId) || (leftSlug && rightSlug && leftSlug === rightSlug);
}

function mergePostIntoListResponse(response, updatedPost) {
  const items = response?.data?.items;
  if (!Array.isArray(items) || !updatedPost) {
    return response;
  }

  let changed = false;
  const nextItems = items.map((item) => {
    if (!isSamePost(item, updatedPost)) {
      return item;
    }
    changed = true;
    return { ...item, ...updatedPost };
  });

  if (!changed) {
    return response;
  }

  return {
    ...response,
    data: {
      ...response.data,
      items: nextItems,
    },
  };
}

function mergePostIntoDetailResponse(response, updatedPost) {
  const existing = response?.data?.post;
  if (!existing || !updatedPost || !isSamePost(existing, updatedPost)) {
    return response;
  }

  return {
    ...response,
    data: {
      ...response.data,
      post: {
        ...existing,
        ...updatedPost,
      },
    },
  };
}

function mergeUpdatedPostIntoCaches(updatedPost) {
  if (!updatedPost?._id) {
    return;
  }

  for (const [key, cached] of postListCache.entries()) {
    const nextValue = mergePostIntoListResponse(cached.value, updatedPost);
    if (nextValue !== cached.value) {
      postListCache.set(key, { ...cached, value: nextValue });
    }
  }

  for (const [key, cached] of postDetailCache.entries()) {
    const cachedPost = cached?.value?.data?.post;
    if (
      isSamePost(cachedPost, updatedPost) ||
      key === String(updatedPost._id) ||
      key === String(updatedPost.slug || '')
    ) {
      const nextValue = mergePostIntoDetailResponse(cached.value, updatedPost);
      postDetailCache.set(key, { ...cached, value: nextValue });
    }
  }
}

async function getOrCreateInflight(key, loader) {
  const existing = inflightRequests.get(key);
  if (existing) return existing;

  const promise = loader().finally(() => inflightRequests.delete(key));
  inflightRequests.set(key, promise);
  return promise;
}

export async function createPost(payload) {
  const data = await getOrCreateInflight('post:create', async () => {
    const response = await appApiClient.post('/posts', payload);
    return response.data;
  });
  clearPostCaches();
  return data;
}

export async function getPosts(params = {}) {
  const key = cacheKeyFromParams(params);
  const cached = getCached(postListCache, key);
  if (cached) return cached;

  const data = await getOrCreateInflight(`post:list:${key}`, async () => {
    const response = await appApiClient.get('/posts', { params });
    return response.data;
  });

  setCached(postListCache, key, data);
  return data;
}

export async function getPostById(id) {
  const key = String(id);
  const cached = getCached(postDetailCache, key);
  if (cached) return cached;

  const data = await getOrCreateInflight(`post:detail:${key}`, async () => {
    const response = await appApiClient.get(`/posts/${id}`);
    return response.data;
  });

  setCached(postDetailCache, key, data);
  return data;
}

export async function togglePostLike(id) {
  const { data } = await appApiClient.patch(`/posts/${id}/like`);
  const post = data?.data?.post;
  mergeUpdatedPostIntoCaches(post);
  return data;
}

export async function togglePostBookmark(id) {
  const { data } = await appApiClient.patch(`/posts/${id}/bookmark`);
  const post = data?.data?.post;
  mergeUpdatedPostIntoCaches(post);
  return data;
}

export async function deletePostAsAdmin(id) {
  const { data } = await appApiClient.delete(`/admin/posts/${id}`);
  clearPostCaches();
  return data;
}
