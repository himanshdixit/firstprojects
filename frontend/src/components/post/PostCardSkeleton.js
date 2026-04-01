import Skeleton from '@/components/ui/Skeleton';

export default function PostCardSkeleton() {
  return (
    <div className="card-surface overflow-hidden p-5 sm:p-6">
      <Skeleton className="h-52 w-full rounded-[24px]" />
      <Skeleton className="mt-5 h-6 w-24" />
      <Skeleton className="mt-4 h-8 w-3/4" />
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-5/6" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="mt-5 flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  );
}
