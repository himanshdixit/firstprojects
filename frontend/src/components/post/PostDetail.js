'use client';

import useRequest from '@/hooks/useRequest';
import { getPostById } from '@/lib/api';
import Alert from '@/components/ui/Alert';
import Skeleton from '@/components/ui/Skeleton';
import Card from '@/components/ui/Card';
import { getPostCover, getAvatar } from '@/lib/media';

export default function PostDetail({ slug }) {
  const { data, loading, error } = useRequest(() => getPostById(slug), [slug]);
  const post = data?.data?.post || null;

  if (loading) {
    return (
      <Card>
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="mt-3 h-4 w-36" />
        <Skeleton className="mt-5 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-11/12" />
      </Card>
    );
  }

  if (error) {
    return <Alert title="Unable to load post" message={error} />;
  }

  if (!post) {
    return <Alert title="Post not found" message="This post may have been removed or is still a draft." />;
  }

  const cover = getPostCover(post);
  const authorAvatar = getAvatar(post.author);

  return (
    <article className="card-surface p-6 sm:p-8">
      <p className="text-xs uppercase tracking-wide text-emerald-600">{post.status}</p>
      <h1 className="mt-2 text-3xl font-semibold">{post.title}</h1>
      <div className="mt-3 flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={authorAvatar} alt={post.author?.name || 'Author'} className="h-9 w-9 rounded-full object-cover" />
        <p>
          By {post.author?.name || 'Unknown'} on {new Date(post.createdAt).toLocaleDateString()}
        </p>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={cover} alt={post.title} className="mt-6 h-64 w-full rounded-xl object-cover" />
      <div
        className="mt-6 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-200"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}
