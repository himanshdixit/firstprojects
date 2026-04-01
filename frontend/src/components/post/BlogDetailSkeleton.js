import Container from '@/components/ui/Container';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';

export default function BlogDetailSkeleton() {
  return (
    <Container size="reading" className="space-y-6 px-0 sm:px-0">
      <Card className="overflow-hidden" hover={false}>
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="mt-5 h-10 w-4/5 max-w-full" />
        <div className="mt-6 flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
        <Skeleton className="mt-6 h-72 w-full rounded-[28px] sm:h-[28rem]" />
        <div className="mt-8 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-10/12" />
        </div>
      </Card>

      <Card hover={false}>
        <Skeleton className="h-7 w-32" />
        <Skeleton className="mt-4 h-24 w-full rounded-[24px]" />
        <div className="mt-4 space-y-3">
          <Skeleton className="h-20 w-full rounded-[24px]" />
          <Skeleton className="h-20 w-full rounded-[24px]" />
        </div>
      </Card>
    </Container>
  );
}
