import PostCardSkeleton from './PostCardSkeleton';
import Skeleton from '@/components/ui/Skeleton';

export default function BlogFeedSkeleton() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="h-11 w-[22rem] max-w-full" />
          <Skeleton className="h-4 w-[32rem] max-w-full" />
        </div>
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <PostCardSkeleton />
        <div className="grid gap-5">
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      </div>
    </section>
  );
}
