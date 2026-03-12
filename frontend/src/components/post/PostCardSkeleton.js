import Skeleton from '@/components/ui/Skeleton';

export default function PostCardSkeleton() {
  return (
    <div className="card-surface p-5 sm:p-6">
      <Skeleton className="h-6 w-20" />
      <Skeleton className="mt-4 h-7 w-2/3" />
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-5/6" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );
}
