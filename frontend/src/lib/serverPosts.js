import { backendRequest } from '@/lib/serverApi';

export async function getServerPostBySlug(slug) {
  const encodedSlug = encodeURIComponent(slug);
  const { response, data } = await backendRequest(`/posts/${encodedSlug}`, {
    method: 'GET',
    cache: 'no-store',
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to load post');
  }

  return data?.data?.post || null;
}

export async function getServerPublishedPosts(limit = 100) {
  const safeLimit = Math.min(Number(limit) || 100, 500);
  const { response, data } = await backendRequest(`/posts?limit=${safeLimit}`, {
    method: 'GET',
    next: {
      revalidate: 1800,
      tags: ['posts'],
    },
  });

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to load posts');
  }

  return data?.data?.items || [];
}
