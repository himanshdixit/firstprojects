'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import useRequest from '@/hooks/useRequest';
import { getPosts } from '@/lib/api';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import Badge from '@/components/ui/Badge';
import { getPostCover } from '@/lib/media';
import { calculateReadingTime } from '@/lib/readingTime';

function buildQuery({ tag, category, exclude }) {
  const params = new URLSearchParams({
    limit: '3',
    exclude,
  });

  if (tag) {
    params.set('tag', tag);
  } else if (category) {
    params.set('category', category);
  }

  return params.toString();
}

export default function RelatedPosts({ post }) {
  const primaryTag = Array.isArray(post?.tags) && post.tags.length > 0 ? post.tags[0] : '';
  const category = post?.category || '';
  const lookupKey = primaryTag || category;

  const { data, loading, error, refetch } = useRequest(
    () => getPosts(buildQuery({ tag: primaryTag, category, exclude: post?._id || post?.slug || '' })),
    [post?._id, post?.slug, primaryTag, category]
  );

  const relatedPosts = data?.data?.items || [];

  if (!lookupKey) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div>
        <p className="eyebrow">Keep Reading</p>
        <h2 className="mt-3 text-3xl sm:text-4xl">Related stories</h2>
        <p className="editorial-copy mt-2 max-w-2xl">
          More posts connected by {primaryTag ? `the "${primaryTag}" tag` : `the "${category}" category`}.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <Card key={item} hover={false}>
              <Skeleton className="h-48 w-full rounded-[24px]" />
              <Skeleton className="mt-4 h-5 w-28" />
              <Skeleton className="mt-4 h-8 w-4/5" />
              <Skeleton className="mt-3 h-4 w-full" />
            </Card>
          ))}
        </div>
      ) : null}

      {!loading && error ? (
        <EmptyState
          eyebrow="Suggestions unavailable"
          title="We couldn't load related stories"
          message={error}
          ctaLabel="Try again"
          onCta={refetch}
          compact
        />
      ) : null}

      {!loading && !error && relatedPosts.length === 0 ? (
        <EmptyState
          eyebrow="No related posts"
          title="Nothing closely related yet"
          message="As more content is published under this topic, it will show up here automatically."
          compact
        />
      ) : null}

      {!loading && !error && relatedPosts.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {relatedPosts.map((relatedPost) => {
            const readingTime = calculateReadingTime(relatedPost.content);
            return (
              <Card key={relatedPost._id} className="overflow-hidden" hover={false}>
                <div className="relative h-48 overflow-hidden rounded-[24px]">
                  <Image
                    src={getPostCover(relatedPost)}
                    alt={relatedPost.title}
                    fill
                    loading="lazy"
                    sizes="(max-width: 1280px) 50vw, 33vw"
                    className="object-cover transition duration-500 hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Badge variant="brand">{relatedPost.category || 'general'}</Badge>
                  <Badge variant="default">{readingTime.label}</Badge>
                </div>
                <Link href={`/posts/${relatedPost.slug || relatedPost._id}`} className="group mt-4 block">
                  <h3 className="text-2xl leading-tight text-slate-900 transition group-hover:text-amber-700 dark:text-white dark:group-hover:text-amber-300">
                    {relatedPost.title}
                  </h3>
                  <div className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-amber-700 dark:text-amber-300">
                    Read next
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </Link>
              </Card>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
