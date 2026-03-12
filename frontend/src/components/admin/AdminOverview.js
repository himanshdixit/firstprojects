'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Alert from '@/components/ui/Alert';
import Skeleton from '@/components/ui/Skeleton';
import AdminSidebar from './AdminSidebar';
import AdminAnalyticsCards from './AdminAnalyticsCards';
import { getAdminAnalytics, getAdminPosts, getAdminUsers } from '@/lib/api';

const AdminUsersTable = dynamic(() => import('./AdminUsersTable'), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />,
});

const AdminPostsTable = dynamic(() => import('./AdminPostsTable'), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />,
});

const AdminCharts = dynamic(() => import('./AdminCharts'), {
  ssr: false,
  loading: () => <Skeleton className="h-80 w-full" />,
});

export default function AdminOverview() {
  const [activeTab, setActiveTab] = useState('overview');

  const [usersState, setUsersState] = useState({
    loading: true,
    error: '',
    data: null,
    page: 1,
    limit: 10,
  });

  const [postsState, setPostsState] = useState({
    loading: true,
    error: '',
    data: null,
    page: 1,
    limit: 10,
    filters: {
      search: '',
      status: 'all',
    },
  });

  const [analyticsState, setAnalyticsState] = useState({
    loading: true,
    error: '',
    data: null,
  });

  const fetchUsers = useCallback(async () => {
    setUsersState((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const query = new URLSearchParams({
        page: String(usersState.page),
        limit: String(usersState.limit),
      }).toString();

      const data = await getAdminUsers(query);
      setUsersState((prev) => ({ ...prev, loading: false, data }));
    } catch (err) {
      setUsersState((prev) => ({ ...prev, loading: false, error: err.message || 'Failed to load users' }));
    }
  }, [usersState.page, usersState.limit]);

  const fetchPosts = useCallback(async () => {
    setPostsState((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const queryObj = {
        page: String(postsState.page),
        limit: String(postsState.limit),
      };

      if (postsState.filters.search) {
        queryObj.search = postsState.filters.search;
      }

      if (postsState.filters.status && postsState.filters.status !== 'all') {
        queryObj.status = postsState.filters.status;
      }

      const query = new URLSearchParams(queryObj).toString();
      const data = await getAdminPosts(query);
      setPostsState((prev) => ({ ...prev, loading: false, data }));
    } catch (err) {
      setPostsState((prev) => ({ ...prev, loading: false, error: err.message || 'Failed to load posts' }));
    }
  }, [postsState.page, postsState.limit, postsState.filters.search, postsState.filters.status]);

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsState((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const data = await getAdminAnalytics();
      setAnalyticsState({ loading: false, error: '', data });
    } catch (err) {
      setAnalyticsState({ loading: false, error: err.message || 'Failed to load analytics', data: null });
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const usersRequest = useMemo(
    () => ({
      loading: usersState.loading,
      error: usersState.error,
      data: usersState.data,
      setPage: (page) => setUsersState((prev) => ({ ...prev, page })),
      refetch: fetchUsers,
    }),
    [usersState.loading, usersState.error, usersState.data, fetchUsers]
  );

  const postsRequest = useMemo(
    () => ({
      loading: postsState.loading,
      error: postsState.error,
      data: postsState.data,
      setPage: (page) => setPostsState((prev) => ({ ...prev, page })),
      setFilters: (filters) => setPostsState((prev) => ({ ...prev, filters })),
      refetch: fetchPosts,
    }),
    [postsState.loading, postsState.error, postsState.data, fetchPosts]
  );

  const totals = analyticsState.data?.data?.totals || {};
  const monthly = analyticsState.data?.data?.monthly || [];
  const statusBreakdown = analyticsState.data?.data?.statusBreakdown || [];

  const showGlobalError = (usersState.error || postsState.error) && !usersState.data && !postsState.data;

  return (
    <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <AdminSidebar activeTab={activeTab} onChange={setActiveTab} />

      <section className="space-y-4">
        {analyticsState.loading ? (
          <Skeleton className="h-36 w-full" />
        ) : (
          <AdminAnalyticsCards
            usersTotal={totals.users || 0}
            postsTotal={totals.posts || 0}
            drafts={totals.drafts || 0}
            published={totals.published || 0}
          />
        )}

        {analyticsState.error ? <Alert title="Analytics unavailable" message={analyticsState.error} /> : null}

        {activeTab === 'overview' && !analyticsState.loading ? (
          <AdminCharts monthly={monthly} statusBreakdown={statusBreakdown} />
        ) : null}

        {showGlobalError ? (
          <Alert title="Dashboard load failed" message={usersState.error || postsState.error} />
        ) : null}

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 210, damping: 24 }}
          >
            {activeTab === 'overview' ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {usersState.loading ? <Skeleton className="h-64 w-full" /> : <AdminUsersTable usersRequest={usersRequest} />}
                {postsState.loading ? <Skeleton className="h-64 w-full" /> : <AdminPostsTable postsRequest={postsRequest} />}
              </div>
            ) : null}

            {activeTab === 'users' ? <AdminUsersTable usersRequest={usersRequest} /> : null}
            {activeTab === 'posts' ? <AdminPostsTable postsRequest={postsRequest} /> : null}
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}
