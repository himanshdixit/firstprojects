'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import PostCard from './PostCard';
import BlogFeedSkeleton from './BlogFeedSkeleton';
import PostFeedFilters from './PostFeedFilters';
import Alert from '@/components/ui/Alert';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import usePosts from '@/hooks/api/usePosts';
import usePostFeedFilters from '@/hooks/usePostFeedFilters';

function mergeUniquePosts(existingPosts, nextPosts) {
  const merged = [...existingPosts];

  nextPosts.forEach((post) => {
    if (!merged.some((item) => item._id === post._id)) {
      merged.push(post);
    }
  });

  return merged;
}

export default function PostFeed() {
  const { data, loading, isFetching, error, params, setParams, refetch } = usePosts({
    page: 1,
    limit: 6,
  });
  const {
    activeSearch,
    activeTag,
    activeCategory,
    searchInput,
    setSearchInput,
    updateRouteFilters,
    clearFilters,
    hasActiveFilters,
    filterSummary,
  } = usePostFeedFilters(setParams);

  const page = params.page || 1;
  const fetchedPosts = data?.data?.items || [];
  const pagination = data?.data?.pagination;
  const filterOptions = data?.data?.filters || {};
  const tags = filterOptions.tags || [];
  const categories = filterOptions.categories || [];
  const hasMore = (pagination?.page || 1) < (pagination?.pages || 1);
  const filterKey = useMemo(
    () => [activeSearch, activeTag, activeCategory].filter(Boolean).join('|'),
    [activeCategory, activeSearch, activeTag]
  );

  const [visiblePosts, setVisiblePosts] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setVisiblePosts([]);
  }, [filterKey]);

  useEffect(() => {
    if (page > 1) {
      setVisiblePosts((prev) => mergeUniquePosts(prev, fetchedPosts));
    } else {
      setVisiblePosts(fetchedPosts);
    }
  }, [fetchedPosts, page]);

  useEffect(() => {
    if (!isFetching) {
      setLoadingMore(false);
    }
  }, [isFetching]);

  const showingSkeleton = loading || (isFetching && page === 1 && visiblePosts.length === 0);
  const posts = visiblePosts;

  function handleLoadMore() {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    setParams((prev) => ({ ...prev, page: (prev.page || 1) + 1 }));
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">{activeSearch ? 'Search Results' : 'Latest Stories'}</p>
          <h2 className="mt-3 text-3xl sm:text-4xl">
            {activeSearch ? `Results for "${activeSearch}"` : 'Stories with strong ideas and clean presentation'}
          </h2>
          <p className="editorial-copy mt-2 max-w-2xl">
            Browse thoughtful writing, practical walkthroughs, and product-minded essays from creators on the platform.
          </p>
        </div>
        <div className="rounded-full border border-slate-200/80 bg-white/75 px-4 py-2 text-sm text-slate-600 backdrop-blur dark:border-slate-700/80 dark:bg-slate-950/45 dark:text-slate-300">
          Showing {posts.length} of {pagination?.total || 0} stories
        </div>
      </div>

      <PostFeedFilters
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        activeCategory={activeCategory}
        onCategoryChange={(category) => updateRouteFilters({ category, tag: '' })}
        activeTag={activeTag}
        onTagChange={(tag) => updateRouteFilters({ tag, category: activeCategory })}
        tags={tags}
        categories={categories}
        hasActiveFilters={hasActiveFilters}
        filterSummary={filterSummary}
        onClear={clearFilters}
      />

      {showingSkeleton ? <BlogFeedSkeleton /> : null}

      {!showingSkeleton && error && posts.length === 0 ? (
        <EmptyState
          title="We couldn't load the story feed"
          message={error}
          ctaLabel="Try again"
          onCta={refetch}
        />
      ) : null}

      {!showingSkeleton && error && posts.length > 0 ? (
        <Alert
          variant="info"
          title="We couldn't load more stories"
          message={error}
          action={
            <Button variant="secondary" size="sm" onClick={refetch}>
              Try again
            </Button>
          }
        />
      ) : null}

      {!showingSkeleton && !error && posts.length === 0 ? (
        <EmptyState
          title="No stories found"
          message="Try a different keyword or clear the current search to explore more writing."
          ctaLabel={hasActiveFilters ? 'Clear filters' : undefined}
          onCta={hasActiveFilters ? clearFilters : undefined}
        />
      ) : null}

      {!showingSkeleton && !error && posts.length > 0 ? (
        <>
          <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
            <PostCard post={posts[0]} featured />
            <div className="grid gap-5">
              {posts.slice(1, 3).map((post) => (
                <PostCard key={post._id} post={post} compact />
              ))}
            </div>
          </div>

          {posts.length > 3 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {posts.slice(3).map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 rounded-[28px] border border-slate-200/80 bg-white/70 px-5 py-4 backdrop-blur dark:border-slate-700/80 dark:bg-slate-950/45 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Page {pagination?.page || 1} of {pagination?.pages || 1}
            </p>
            {hasMore ? (
              <Button
                variant="secondary"
                onClick={handleLoadMore}
                loading={loadingMore}
                loadingLabel="Loading more stories"
                rightIcon={<ArrowDown className="h-4 w-4" />}
              >
                Load more stories
              </Button>
            ) : (
              <span className="text-sm text-slate-500 dark:text-slate-400">
                You&apos;ve reached the end of the feed.
              </span>
            )}
          </div>
        </>
      ) : null}
    </section>
  );
}
