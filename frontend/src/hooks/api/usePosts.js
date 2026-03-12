'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getPosts } from '@/services/post.service';

export default function usePosts(initialParams = {}) {
  const [params, setParams] = useState({ page: 1, limit: 6, ...initialParams });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const hasLoadedRef = useRef(false);

  const fetchPosts = useCallback(async () => {
    try {
      if (!hasLoadedRef.current) {
        setLoading(true);
      }
      setError('');
      const response = await getPosts(params);
      setData(response);
      hasLoadedRef.current = true;
    } catch (err) {
      setError(err.message || 'Failed to load posts');
      hasLoadedRef.current = true;
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    data,
    loading,
    error,
    params,
    setParams,
    refetch: fetchPosts,
  };
}
