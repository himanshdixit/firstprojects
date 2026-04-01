'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock3 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Container from '@/components/ui/Container';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import {
  getAvatar,
  getAvatarFallback,
  getPostCover,
  getPostCoverFallback,
  isBackendUploadUrl,
} from '@/lib/media';
import { ensureRichTextHtml } from '@/lib/richText';
import { calculateReadingTime } from '@/lib/readingTime';
import PostEngagementBar from './PostEngagementBar';

const RelatedPosts = dynamic(() => import('./RelatedPosts'), {
  ssr: false,
  loading: () => (
    <Card hover={false}>
      <Skeleton className="h-7 w-40" />
      <Skeleton className="mt-4 h-5 w-80 max-w-full" />
      <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="space-y-4">
            <Skeleton className="h-48 w-full rounded-[24px]" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-7 w-4/5" />
          </div>
        ))}
      </div>
    </Card>
  ),
});

const PostComments = dynamic(() => import('./PostComments'), {
  ssr: false,
  loading: () => (
    <Card hover={false}>
      <Skeleton className="h-7 w-32" />
      <Skeleton className="mt-5 h-24 w-full rounded-[24px]" />
      <div className="mt-4 space-y-3">
        <Skeleton className="h-20 w-full rounded-[24px]" />
        <Skeleton className="h-20 w-full rounded-[24px]" />
      </div>
    </Card>
  ),
});

export default function PostDetail({ post }) {
  const router = useRouter();

  if (!post) {
    return (
      <EmptyState
        title="Post not found"
        message="This story may have been removed, unpublished, or the link is no longer valid."
        ctaLabel="Browse latest stories"
        onCta={() => router.push('/')}
      />
    );
  }

  const resolvedCover = useMemo(() => getPostCover(post), [post]);
  const fallbackCover = useMemo(() => getPostCoverFallback(post), [post]);
  const resolvedAuthorAvatar = useMemo(() => getAvatar(post.author), [post.author]);
  const fallbackAuthorAvatar = useMemo(() => getAvatarFallback(post.author), [post.author]);
  const readingTime = calculateReadingTime(post.content);
  const category = post.category || post.tags?.[0] || 'general';
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const [coverSrc, setCoverSrc] = useState(resolvedCover);
  const [authorAvatarSrc, setAuthorAvatarSrc] = useState(resolvedAuthorAvatar);

  useEffect(() => {
    setCommentCount(post.commentCount || 0);
  }, [post._id, post.commentCount]);

  useEffect(() => {
    setCoverSrc(resolvedCover);
  }, [resolvedCover]);

  useEffect(() => {
    setAuthorAvatarSrc(resolvedAuthorAvatar);
  }, [resolvedAuthorAvatar]);

  return (
    <Container size="reading" className="space-y-6 px-0 sm:px-0">
      <article className="card-elevated overflow-hidden p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="brand">{category}</Badge>
          <Badge variant="default">{post.status}</Badge>
        </div>
        <h1 className="mt-4 text-4xl leading-tight sm:text-5xl">{post.title}</h1>

        <div className="mt-6 flex flex-wrap items-center gap-4 border-y border-slate-200/80 py-4 text-sm text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-full">
              <Image
                src={authorAvatarSrc}
                alt={post.author?.name || 'Author'}
                fill
                sizes="44px"
                unoptimized={isBackendUploadUrl(authorAvatarSrc)}
                onError={() => {
                  if (authorAvatarSrc !== fallbackAuthorAvatar) {
                    setAuthorAvatarSrc(fallbackAuthorAvatar);
                  }
                }}
                className="object-cover"
              />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">{post.author?.name || 'Unknown'}</p>
              <p className="text-xs uppercase tracking-[0.18em]">Published insight</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 uppercase tracking-[0.16em]">
            <CalendarDays className="h-3.5 w-3.5" />
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
          <span className="inline-flex items-center gap-2 uppercase tracking-[0.16em]">
            <Clock3 className="h-3.5 w-3.5" />
            {readingTime.label}
          </span>
          <div className="flex flex-wrap gap-2">
            {(post.tags || []).map((tag) => (
              <Badge key={tag} variant="default">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="relative mt-6 h-72 w-full overflow-hidden rounded-[28px] sm:h-[28rem]">
          <Image
            src={coverSrc}
            alt={post.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 900px"
            unoptimized={isBackendUploadUrl(coverSrc)}
            onError={() => {
              if (coverSrc !== fallbackCover) {
                setCoverSrc(fallbackCover);
              }
            }}
            className="object-cover"
          />
        </div>
        <PostEngagementBar
          post={post}
          commentCount={commentCount}
          commentsHref="#post-comments"
          className="mt-6"
          hydrateOnMount
        />
        <div
          className="rich-content mt-8 text-[15px] leading-8 text-slate-700 dark:text-slate-200 sm:text-base"
          dangerouslySetInnerHTML={{ __html: ensureRichTextHtml(post.content) }}
        />
      </article>
      <RelatedPosts post={post} />
      <PostComments postRef={post.slug || post._id} onCountChange={setCommentCount} />
    </Container>
  );
}
