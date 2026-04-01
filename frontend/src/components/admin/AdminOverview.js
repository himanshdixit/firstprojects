'use client';

import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BellRing,
  FileText,
  LayoutDashboard,
  Mail,
  Menu,
  MessageSquareText,
  PencilLine,
  ShieldCheck,
  Sparkles,
  UserCog,
  Users,
} from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import AuthContext from '@/context/AuthContext';
import { getAvatar, getPostCover } from '@/lib/media';
import { getAdminAnalytics, getAdminComments, getAdminContacts, getAdminPosts, getAdminUsers } from '@/lib/api';
import AdminAnalyticsCards from './AdminAnalyticsCards';
import AdminSidebar from './AdminSidebar';

const AdminUsersTable = dynamic(() => import('./AdminUsersTable'), {
  ssr: false,
  loading: () => <Skeleton variant="card" className="h-64 w-full" />,
});

const AdminPostsTable = dynamic(() => import('./AdminPostsTable'), {
  ssr: false,
  loading: () => <Skeleton variant="card" className="h-64 w-full" />,
});

const AdminCommentsTable = dynamic(() => import('./AdminCommentsTable'), {
  ssr: false,
  loading: () => <Skeleton variant="card" className="h-64 w-full" />,
});

const AdminContactsTable = dynamic(() => import('./AdminContactsTable'), {
  ssr: false,
  loading: () => <Skeleton variant="card" className="h-64 w-full" />,
});

const AdminCharts = dynamic(() => import('./AdminCharts'), {
  ssr: false,
  loading: () => <Skeleton variant="card" className="h-80 w-full" />,
});

function formatRelativeTime(value) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

function buildActivity(users = [], posts = [], comments = [], contacts = []) {
  const userItems = users.slice(0, 3).map((item) => ({
    id: `user-${item._id}`,
    type: 'user',
    title: item.name || 'New member',
    subtitle: item.email || 'User registration',
    time: item.createdAt,
    icon: Users,
    tone: 'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200',
  }));

  const postItems = posts.slice(0, 3).map((item) => ({
    id: `post-${item._id}`,
    type: 'post',
    title: item.title || 'Untitled post',
    subtitle: item.author?.name ? `by ${item.author.name}` : 'Editorial update',
    time: item.createdAt,
    icon: FileText,
    tone: 'bg-[#efe3cf] text-[#8f6b33] dark:bg-[#8f6b33]/18 dark:text-[#e2c996]',
  }));

  const commentItems = comments.slice(0, 3).map((item) => ({
    id: `comment-${item._id}`,
    type: 'comment',
    title: item.userId?.name || 'Comment activity',
    subtitle: item.postId?.title || 'Discussion update',
    time: item.createdAt,
    icon: MessageSquareText,
    tone: 'bg-stone-200 text-stone-700 dark:bg-stone-400/15 dark:text-stone-200',
  }));

  const contactItems = contacts.slice(0, 3).map((item) => ({
    id: `contact-${item._id}`,
    type: 'contact',
    title: item.name || 'Inbox submission',
    subtitle: item.subject || item.email || 'Contact inquiry',
    time: item.createdAt,
    icon: Mail,
    tone: 'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200',
  }));

  return [...userItems, ...postItems, ...commentItems, ...contactItems]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 6);
}

function PreviewCard({ title, description, icon: Icon, actionLabel, onAction, children }) {
  return (
    <Card variant="dashboard" hover={false} className="relative h-full overflow-hidden">
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(183,146,87,0.75)] to-transparent" />
      <Card.Header className="flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#8f6b33,#d6b57e)] text-[#120d08] shadow-[0_14px_30px_rgba(143,107,51,0.2)]">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-950 dark:text-white">{title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
          </div>
        </div>
        {actionLabel ? (
          <Button
            variant="ghost"
            size="sm"
            className="w-full rounded-full sm:w-auto"
            rightIcon={<ArrowRight className="h-4 w-4" />}
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        ) : null}
      </Card.Header>
      <Card.Content className="mt-5">{children}</Card.Content>
    </Card>
  );
}

function ActivityFeedCard({ items = [], drafts = 0, commentsTotal = 0 }) {
  return (
    <Card variant="dashboard" hover={false} className="relative h-full overflow-hidden">
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(183,146,87,0.75)] to-transparent" />
      <Card.Header>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
            Live activity
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
            Recent operational events
          </h3>
        </div>
        <div className="rounded-2xl bg-amber-100 p-3 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
          <BellRing className="h-5 w-5" />
        </div>
      </Card.Header>

      <div className="mt-5 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-amber-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.74),rgba(250,245,236,0.58))] px-4 py-6 text-sm text-slate-500 dark:border-amber-300/10 dark:bg-[linear-gradient(180deg,rgba(18,14,11,0.72),rgba(11,9,7,0.58))] dark:text-slate-400">
            Activity will appear here as members sign up, publish stories, and join discussions.
          </div>
        ) : (
          items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-[24px] border border-amber-100/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.8),rgba(250,245,236,0.66))] p-3 shadow-[0_12px_28px_rgba(18,12,7,0.05)] dark:border-amber-300/10 dark:bg-[linear-gradient(180deg,rgba(18,14,11,0.76),rgba(11,9,7,0.62))] sm:flex-row sm:items-start"
              >
                <div className={clsx('flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl', item.tone)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.subtitle}</p>
                </div>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500 sm:shrink-0">
                  {formatRelativeTime(item.time)}
                </span>
              </div>
            );
          })
        )}
      </div>

      <Card.Footer className="flex-col items-start sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-2">
          <Badge variant={drafts > 0 ? 'warning' : 'success'} size="sm">
            {drafts} drafts need review
          </Badge>
          <Badge variant="brand" size="sm">
            {commentsTotal} comments in circulation
          </Badge>
        </div>
      </Card.Footer>
    </Card>
  );
}

export default function AdminOverview() {
  const { user } = useContext(AuthContext) || {};
  const canManageUsers = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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

  const [commentsState, setCommentsState] = useState({
    loading: true,
    error: '',
    data: null,
    page: 1,
    limit: 10,
    filters: {
      search: '',
      post: '',
    },
  });

  const [contactsState, setContactsState] = useState({
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
      setUsersState((prev) => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to load users',
      }));
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
      setPostsState((prev) => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to load posts',
      }));
    }
  }, [postsState.page, postsState.limit, postsState.filters.search, postsState.filters.status]);

  const fetchComments = useCallback(async () => {
    setCommentsState((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const queryObj = {
        page: String(commentsState.page),
        limit: String(commentsState.limit),
      };

      if (commentsState.filters.search) {
        queryObj.search = commentsState.filters.search;
      }

      if (commentsState.filters.post) {
        queryObj.post = commentsState.filters.post;
      }

      const query = new URLSearchParams(queryObj).toString();
      const data = await getAdminComments(query);
      setCommentsState((prev) => ({ ...prev, loading: false, data }));
    } catch (err) {
      setCommentsState((prev) => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to load comments',
      }));
    }
  }, [commentsState.page, commentsState.limit, commentsState.filters.search, commentsState.filters.post]);

  const fetchContacts = useCallback(async () => {
    setContactsState((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const queryObj = {
        page: String(contactsState.page),
        limit: String(contactsState.limit),
      };

      if (contactsState.filters.search) {
        queryObj.search = contactsState.filters.search;
      }

      if (contactsState.filters.status && contactsState.filters.status !== 'all') {
        queryObj.status = contactsState.filters.status;
      }

      const query = new URLSearchParams(queryObj).toString();
      const data = await getAdminContacts(query);
      setContactsState((prev) => ({ ...prev, loading: false, data }));
    } catch (err) {
      setContactsState((prev) => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to load contacts',
      }));
    }
  }, [contactsState.page, contactsState.limit, contactsState.filters.search, contactsState.filters.status]);

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsState((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const data = await getAdminAnalytics();
      setAnalyticsState({ loading: false, error: '', data });
    } catch (err) {
      setAnalyticsState({
        loading: false,
        error: err.message || 'Failed to load analytics',
        data: null,
      });
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    if (!canManageUsers && activeTab === 'users') {
      setActiveTab('overview');
    }
  }, [activeTab, canManageUsers]);

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

  const commentsRequest = useMemo(
    () => ({
      loading: commentsState.loading,
      error: commentsState.error,
      data: commentsState.data,
      setPage: (page) => setCommentsState((prev) => ({ ...prev, page })),
      setFilters: (filters) => setCommentsState((prev) => ({ ...prev, filters })),
      refetch: fetchComments,
    }),
    [commentsState.loading, commentsState.error, commentsState.data, fetchComments]
  );

  const contactsRequest = useMemo(
    () => ({
      loading: contactsState.loading,
      error: contactsState.error,
      data: contactsState.data,
      setPage: (page) => setContactsState((prev) => ({ ...prev, page })),
      setFilters: (filters) => setContactsState((prev) => ({ ...prev, filters })),
      refetch: fetchContacts,
    }),
    [contactsState.loading, contactsState.error, contactsState.data, fetchContacts]
  );

  const totals = analyticsState.data?.data?.totals || {};
  const monthly = analyticsState.data?.data?.monthly || [];
  const statusBreakdown = analyticsState.data?.data?.statusBreakdown || [];
  const users = usersState.data?.data?.items || [];
  const posts = postsState.data?.data?.items || [];
  const comments = commentsState.data?.data?.items || [];
  const contacts = contactsState.data?.data?.items || [];
  const commentsTotal = commentsState.data?.data?.pagination?.total || 0;
  const contactsTotal = contactsState.data?.data?.pagination?.total || totals.contacts || 0;
  const recentActivity = useMemo(() => buildActivity(users, posts, comments, contacts), [users, posts, comments, contacts]);

  const navigationItems = useMemo(() => {
    const items = [
      {
        key: 'overview',
        label: 'Overview',
        description: 'Metrics, charts, and recent operational signals.',
        icon: LayoutDashboard,
      },
      {
        key: 'posts',
        label: 'Posts',
        description: 'Moderate stories, covers, and publishing state.',
        icon: FileText,
        count: totals.posts || 0,
      },
      {
        key: 'comments',
        label: 'Comments',
        description: 'Monitor discussion and moderation activity.',
        icon: MessageSquareText,
        count: commentsTotal,
      },
      {
        key: 'contacts',
        label: 'Contacts',
        description: 'Manage inbound inquiries and response workflow.',
        icon: Mail,
        count: contactsTotal,
      },
    ];

    if (canManageUsers) {
      items.splice(1, 0, {
        key: 'users',
        label: 'Users',
        description: 'Manage members, roles, and account access.',
        icon: Users,
        count: totals.users || 0,
      });
    }

    return items;
  }, [canManageUsers, commentsTotal, contactsTotal, totals.posts, totals.users]);

  const currentTab = navigationItems.find((item) => item.key === activeTab) || navigationItems[0];

  const showGlobalError =
    (usersState.error || postsState.error || commentsState.error || contactsState.error) &&
    !usersState.data &&
    !postsState.data &&
    !commentsState.data &&
    !contactsState.data;

  return (
    <div
      className={clsx(
        'grid gap-4 lg:gap-6 xl:gap-7',
        sidebarCollapsed
          ? 'lg:grid-cols-[108px_minmax(0,1fr)]'
          : 'lg:grid-cols-[300px_minmax(0,1fr)]'
      )}
    >
      <AdminSidebar
        activeTab={activeTab}
        items={navigationItems}
        onChange={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        user={user}
      />

      <section className="min-w-0 space-y-4 lg:space-y-6">
        <Card
          variant="elevated"
          hover={false}
          className="relative overflow-hidden border border-amber-100/80 bg-[radial-gradient(circle_at_top_left,rgba(183,146,87,0.22),transparent_38%),linear-gradient(180deg,rgba(255,252,247,0.96),rgba(247,241,232,0.92))] p-5 shadow-[0_32px_86px_rgba(18,12,7,0.12)] sm:p-6 dark:border-amber-300/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(210,178,122,0.14),transparent_35%),linear-gradient(180deg,rgba(18,14,11,0.96),rgba(10,8,6,0.9))]"
          padding="none"
        >
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(183,146,87,0.86)] to-transparent" />
          <div className="grid gap-5 lg:gap-6 2xl:grid-cols-[minmax(0,1.45fr)_360px]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-2xl lg:hidden"
                  leftIcon={<Menu className="h-4 w-4" />}
                  onClick={() => setMobileSidebarOpen(true)}
                >
                  Menu
                </Button>
                <Badge variant="brand" size="sm">
                  DraftSphere admin suite
                </Badge>
                <Badge variant="default" size="sm">
                  Current view: {currentTab?.label || 'Overview'}
                </Badge>
              </div>

              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                Production controls for publishing, moderation, and member stewardship.
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                Use this SaaS-style operations hub to monitor editorial performance, review community activity, and move elegantly between content and account management.
              </p>

              <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
                <Button
                  variant={activeTab === 'overview' ? 'primary' : 'secondary'}
                  className="w-full sm:w-auto"
                  leftIcon={<LayoutDashboard className="h-4 w-4" />}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </Button>
                <Button
                  variant={activeTab === 'posts' ? 'primary' : 'secondary'}
                  className="w-full sm:w-auto"
                  leftIcon={<PencilLine className="h-4 w-4" />}
                  onClick={() => setActiveTab('posts')}
                >
                  Manage posts
                </Button>
                <Button
                  variant={activeTab === 'contacts' ? 'primary' : 'secondary'}
                  className="w-full sm:w-auto"
                  leftIcon={<Mail className="h-4 w-4" />}
                  onClick={() => setActiveTab('contacts')}
                >
                  Contact inbox
                </Button>
                {canManageUsers ? (
                  <Button
                    variant={activeTab === 'users' ? 'primary' : 'secondary'}
                    className="w-full sm:w-auto"
                    leftIcon={<UserCog className="h-4 w-4" />}
                    onClick={() => setActiveTab('users')}
                  >
                    Manage users
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
              <Card variant="dashboard" hover={false} padding="sm" className="overflow-hidden">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                      Access role
                    </p>
                    <p className="mt-3 text-lg font-semibold text-slate-950 dark:text-white">
                      {user?.role === 'admin' ? 'Administrator' : 'Editor'}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Signed in as {user?.name || 'Dashboard user'}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-amber-100 p-3 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                </div>
              </Card>

              <Card variant="dashboard" hover={false} padding="sm" className="overflow-hidden">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                      Ops focus
                    </p>
                    <p className="mt-3 text-lg font-semibold text-slate-950 dark:text-white">
                      {totals.drafts > 0 ? 'Draft review in queue' : 'Publishing flow looks healthy'}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {commentsTotal > 0
                        ? `${commentsTotal} comments currently visible to moderators.`
                        : 'No discussion backlog detected right now.'}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-stone-200 p-3 text-stone-700 dark:bg-stone-400/15 dark:text-stone-200">
                    <Sparkles className="h-5 w-5" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Card>

        {analyticsState.loading ? (
          <Skeleton variant="card" className="h-40 w-full" />
        ) : (
          <AdminAnalyticsCards
            usersTotal={totals.users || 0}
            postsTotal={totals.posts || 0}
            commentsTotal={commentsTotal}
            contactsTotal={totals.contacts || contactsTotal}
            drafts={totals.drafts || 0}
            published={totals.published || 0}
            activityCount={recentActivity.length}
            resolvedContacts={totals.resolvedContacts || 0}
          />
        )}

        {analyticsState.error ? (
          <Alert title="Analytics unavailable" message={analyticsState.error} />
        ) : null}
        {showGlobalError ? (
          <Alert title="Dashboard load failed" message={usersState.error || postsState.error || commentsState.error || contactsState.error} />
        ) : null}

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 210, damping: 24 }}
            className="space-y-5 xl:space-y-6"
          >
            {activeTab === 'overview' ? (
              <>
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_380px]">
                  <div>
                    {analyticsState.loading ? (
                      <Skeleton variant="card" className="h-80 w-full" />
                    ) : (
                      <AdminCharts monthly={monthly} statusBreakdown={statusBreakdown} />
                    )}
                  </div>
                  <ActivityFeedCard
                    items={recentActivity}
                    drafts={totals.drafts || 0}
                    commentsTotal={commentsTotal}
                  />
                </div>

                <div className={clsx('grid gap-4 lg:gap-5', canManageUsers ? 'lg:grid-cols-2 2xl:grid-cols-4' : 'lg:grid-cols-2')}>
                  {canManageUsers ? (
                    <PreviewCard
                      title="Member management"
                      description="Recent accounts ready for role review and moderation."
                      icon={Users}
                      actionLabel="Open users"
                      onAction={() => setActiveTab('users')}
                    >
                      {users.length === 0 ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          No recent users to review.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {users.slice(0, 4).map((account) => (
                            <div
                              key={account._id}
                              className="flex items-center gap-3 rounded-[24px] border border-amber-100/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.8),rgba(250,245,236,0.66))] p-3 shadow-[0_12px_28px_rgba(18,12,7,0.05)] dark:border-amber-300/10 dark:bg-[linear-gradient(180deg,rgba(18,14,11,0.76),rgba(11,9,7,0.62))]"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={getAvatar(account)}
                                alt={account.name}
                                className="h-11 w-11 rounded-full object-cover"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-medium text-slate-950 dark:text-white">
                                  {account.name}
                                </p>
                                <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                                  {account.email}
                                </p>
                              </div>
                              <Badge variant={account.role === 'admin' ? 'brand' : 'default'} size="sm">
                                {account.role}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </PreviewCard>
                  ) : null}

                  <PreviewCard
                    title="Content pipeline"
                    description="Latest stories moving through draft and published states."
                    icon={FileText}
                    actionLabel="Open posts"
                    onAction={() => setActiveTab('posts')}
                  >
                    {posts.length === 0 ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        No post activity yet.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {posts.slice(0, 4).map((post) => (
                          <div
                            key={post._id}
                            className="flex items-center gap-3 rounded-[24px] border border-amber-100/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.8),rgba(250,245,236,0.66))] p-3 shadow-[0_12px_28px_rgba(18,12,7,0.05)] dark:border-amber-300/10 dark:bg-[linear-gradient(180deg,rgba(18,14,11,0.76),rgba(11,9,7,0.62))]"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={getPostCover(post)}
                              alt={post.title}
                              className="h-12 w-16 rounded-xl object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium text-slate-950 dark:text-white">
                                {post.title}
                              </p>
                              <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                                {post.author?.name || 'Unknown author'}
                              </p>
                            </div>
                            <Badge variant={post.status === 'published' ? 'success' : 'warning'} size="sm">
                              {post.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </PreviewCard>

                  <PreviewCard
                    title="Discussion queue"
                    description="Newest comments that may need moderation attention."
                    icon={MessageSquareText}
                    actionLabel="Open comments"
                    onAction={() => setActiveTab('comments')}
                  >
                    {comments.length === 0 ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        No comments to review.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {comments.slice(0, 4).map((comment) => (
                          <div
                            key={comment._id}
                            className="rounded-[24px] border border-amber-100/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.8),rgba(250,245,236,0.66))] p-3 shadow-[0_12px_28px_rgba(18,12,7,0.05)] dark:border-amber-300/10 dark:bg-[linear-gradient(180deg,rgba(18,14,11,0.76),rgba(11,9,7,0.62))]"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-medium text-slate-950 dark:text-white">
                                {comment.userId?.name || 'Unknown user'}
                              </p>
                              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                                {formatRelativeTime(comment.createdAt)}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                              {comment.postId?.title || 'Deleted post'}
                            </p>
                            <p className="mt-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                              {comment.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </PreviewCard>

                  <PreviewCard
                    title="Contact inbox"
                    description="Incoming editorial and product inquiries waiting for review."
                    icon={Mail}
                    actionLabel="Open inbox"
                    onAction={() => setActiveTab('contacts')}
                  >
                    {contacts.length === 0 ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        No contact submissions to review.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {contacts.slice(0, 4).map((contact) => (
                          <div
                            key={contact._id}
                            className="rounded-[24px] border border-amber-100/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.8),rgba(250,245,236,0.66))] p-3 shadow-[0_12px_28px_rgba(18,12,7,0.05)] dark:border-amber-300/10 dark:bg-[linear-gradient(180deg,rgba(18,14,11,0.76),rgba(11,9,7,0.62))]"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate font-medium text-slate-950 dark:text-white">
                                  {contact.name}
                                </p>
                                <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                                  {contact.subject}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  contact.status === 'resolved'
                                    ? 'success'
                                    : contact.status === 'in_progress'
                                      ? 'warning'
                                      : 'brand'
                                }
                                size="sm"
                              >
                                {(contact.status || 'new').replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="mt-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                              {contact.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </PreviewCard>
                </div>
              </>
            ) : null}

            {activeTab === 'users' && canManageUsers ? (
              <AdminUsersTable usersRequest={usersRequest} />
            ) : null}
            {activeTab === 'posts' ? <AdminPostsTable postsRequest={postsRequest} /> : null}
            {activeTab === 'comments' ? <AdminCommentsTable commentsRequest={commentsRequest} /> : null}
            {activeTab === 'contacts' ? <AdminContactsTable contactsRequest={contactsRequest} /> : null}
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}
