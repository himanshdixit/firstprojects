'use client';

import Link from 'next/link';
import clsx from 'clsx';
import { Bookmark, Heart, MessageCircleMore } from 'lucide-react';
import Button from '@/components/ui/Button';
import usePostEngagement from '@/hooks/usePostEngagement';

function formatCount(count, singular, plural = `${singular}s`) {
  const safeCount = Number(count || 0);
  return `${safeCount} ${safeCount === 1 ? singular : plural}`;
}

export default function PostEngagementBar({
  post,
  commentCount,
  commentsHref,
  compact = false,
  className = '',
  hydrateOnMount = false,
}) {
  const { engagement, pending, toggleLike, toggleBookmark } = usePostEngagement(post, {
    hydrateOnMount,
  });
  const resolvedCommentCount = Number(
    commentCount ?? engagement.commentCount ?? post?.commentCount ?? 0
  );
  const resolvedCommentsHref =
    commentsHref || `/posts/${post?.slug || post?._id}#post-comments`;

  return (
    <div
      className={clsx(
        'flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-slate-200/80 bg-slate-50/80 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900/45',
        compact ? 'mt-5' : 'mt-6',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={engagement.likedByCurrentUser ? 'soft' : 'ghost'}
          size="sm"
          className="rounded-full px-3"
          onClick={toggleLike}
          disabled={pending.like}
          loading={pending.like}
          loadingLabel="Updating like"
        >
          <Heart className={clsx('h-4 w-4', engagement.likedByCurrentUser && 'fill-current')} />
          {formatCount(engagement.likeCount, 'like')}
        </Button>

        <Link
          href={resolvedCommentsHref}
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
        >
          <MessageCircleMore className="h-4 w-4" />
          {formatCount(resolvedCommentCount, 'comment')}
        </Link>
      </div>

      <Button
        variant={engagement.bookmarkedByCurrentUser ? 'soft' : 'ghost'}
        size="sm"
        className="rounded-full px-3"
        onClick={toggleBookmark}
        disabled={pending.bookmark}
        loading={pending.bookmark}
        loadingLabel="Updating bookmark"
      >
        <Bookmark
          className={clsx(
            'h-4 w-4',
            engagement.bookmarkedByCurrentUser && 'fill-current'
          )}
        />
        {engagement.bookmarkedByCurrentUser ? 'Saved' : compact ? 'Save' : 'Bookmark'}
      </Button>
    </div>
  );
}
