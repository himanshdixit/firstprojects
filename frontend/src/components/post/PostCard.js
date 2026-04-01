'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, CalendarDays, Clock3, UserRound } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { getPostCover, getPostCoverFallback, isBackendUploadUrl } from '@/lib/media';
import { calculateReadingTime } from '@/lib/readingTime';
import { getBrandBlurDataUrl } from '@/lib/imagePlaceholders';
import PostEngagementBar from './PostEngagementBar';

function plainText(content) {
  return String(content || '').replace(/<[^>]+>/g, '');
}

export default function PostCard({ post, featured = false, compact = false }) {
  const resolvedCover = useMemo(() => getPostCover(post), [post]);
  const fallbackCover = useMemo(() => getPostCoverFallback(post), [post]);
  const [cover, setCover] = useState(resolvedCover);
  const text = plainText(post.content);
  const readingTime = calculateReadingTime(post.content);
  const category = post.category || post.tags?.[0] || 'general';
  const coverClassName = featured
    ? 'h-72 sm:h-[24rem]'
    : compact
      ? 'aspect-[16/10] w-full sm:w-44 sm:shrink-0 sm:aspect-[4/5] lg:w-48'
      : 'h-56';
  const shouldBypassOptimizer = isBackendUploadUrl(cover);

  useEffect(() => {
    setCover(resolvedCover);
  }, [resolvedCover]);

  return (
    <Card variant="blog" className={featured ? 'p-4 sm:p-4' : ''}>
      <div className={`overflow-hidden ${compact ? 'sm:flex sm:gap-4' : 'space-y-4'}`}>
        <div className={`group relative overflow-hidden rounded-[24px] ${coverClassName}`}>
          <Image
            src={cover}
            alt={post.title}
            fill
            unoptimized={shouldBypassOptimizer}
            loading={featured ? 'eager' : 'lazy'}
            quality={72}
            placeholder="blur"
            blurDataURL={getBrandBlurDataUrl(shouldBypassOptimizer ? 'dark' : 'light')}
            sizes={
              featured
                ? '(max-width: 1024px) 100vw, 60vw'
                : compact
                  ? '(max-width: 640px) 100vw, 176px'
                  : '(max-width: 1280px) 50vw, 33vw'
            }
            onError={() => {
              if (cover !== fallbackCover) {
                setCover(fallbackCover);
              }
            }}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />
        </div>

        <div className={`min-w-0 ${compact ? 'mt-4 sm:mt-0 sm:flex-1' : 'space-y-4'}`}>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="brand">{category}</Badge>
            <Badge variant="default">{post.status}</Badge>
            {(post.tags || []).slice(0, compact ? 1 : 2).map((tag) => (
              <Badge key={tag} variant="default">
                {tag}
              </Badge>
            ))}
          </div>

          <Link href={`/posts/${post.slug || post._id}`} className="group mt-4 block">
            <h3 className={`${featured ? 'text-3xl sm:text-[2.5rem]' : compact ? 'text-2xl' : 'text-[1.8rem]'} leading-tight text-slate-900 transition group-hover:text-amber-700 dark:text-white dark:group-hover:text-amber-300`}>
              {post.title}
            </h3>
            <div className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-amber-700 transition-transform duration-200 ease-out group-hover:translate-x-0.5 dark:text-amber-300">
              Read story
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </Link>

          <p className={`mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300 ${compact ? 'line-clamp-3' : 'line-clamp-4'}`}>
            {text}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <UserRound className="h-3.5 w-3.5" />
              {post.author?.name || 'Unknown author'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5" />
              {readingTime.label}
            </span>
          </div>

          <PostEngagementBar
            post={post}
            compact
            commentsHref={`/posts/${post.slug || post._id}#post-comments`}
          />
        </div>
      </div>
    </Card>
  );
}
