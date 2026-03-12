'use client';

import Link from 'next/link';
import { CalendarDays, UserRound } from 'lucide-react';
import Card from '@/components/ui/Card';
import { getPostCover } from '@/lib/media';

export default function PostCard({ post }) {
  const cover = getPostCover(post);

  return (
    <Card>
      <div className="space-y-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cover} alt={post.title} className="h-44 w-full rounded-xl object-cover" />
        <p className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
          {post.status}
        </p>
        <Link href={`/posts/${post.slug || post._id}`} className="block text-xl font-semibold hover:text-emerald-600">
          {post.title}
        </Link>
        <p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{String(post.content || '').replace(/<[^>]+>/g, '')}</p>
        <div className="flex flex-wrap gap-2">
          {(post.tags || []).map((tag) => (
            <span key={tag} className="rounded-full border border-slate-300 px-2 py-0.5 text-xs dark:border-slate-700">
              #{tag}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1"><UserRound className="h-3.5 w-3.5" />{post.author?.name || 'Unknown author'}</span>
          <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </Card>
  );
}
