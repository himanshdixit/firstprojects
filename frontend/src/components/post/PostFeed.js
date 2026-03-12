'use client';

import PostCard from './PostCard';
import PostCardSkeleton from './PostCardSkeleton';
import Alert from '@/components/ui/Alert';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import usePosts from '@/hooks/api/usePosts';

export default function PostFeed() {
  const { data, loading, error, params, setParams } = usePosts({ page: 1, limit: 6 });

  const posts = data?.data?.items || [];
  const pagination = data?.data?.pagination;

  const page = params.page || 1;

  return (
    <div className="space-y-5">
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      ) : null}

      {!loading && error ? <Alert title="Failed to load posts" message={error} /> : null}

      {!loading && !error && posts.length === 0 ? (
        <EmptyState title="No posts yet" message="Create your first blog post to get started." />
      ) : null}

      {!loading && !error && posts.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {posts.map((post) => (
              <div key={post._id}>
                <PostCard post={post} />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setParams((prev) => ({ ...prev, page: page - 1 }))}
            >
              Previous
            </Button>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Page {pagination?.page || 1} of {pagination?.pages || 1}
            </p>
            <Button
              variant="secondary"
              disabled={(pagination?.page || 1) >= (pagination?.pages || 1)}
              onClick={() => setParams((prev) => ({ ...prev, page: page + 1 }))}
            >
              Next
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
