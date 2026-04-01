import Card from './Card';
import Grid from './Grid';
import Section from './Section';
import Skeleton, { SkeletonAvatar, SkeletonText } from './Skeleton';

export function AuthPageSkeleton() {
  return (
    <Section size="wide" className="pt-2">
      <Grid cols="aside" gap="lg">
        <div className="space-y-4">
          {[0, 1, 2].map((item) => (
            <Card key={item} hover={false}>
              <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-8 w-48" />
                  <SkeletonText lines={2} />
                </div>
              </div>
            </Card>
          ))}
        </div>
        <Card hover={false} className="mx-auto max-w-xl">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
          <Skeleton className="mt-6 h-10 w-56" />
          <Skeleton className="mt-3 h-4 w-72 max-w-full" />
          <div className="mt-6 space-y-4">
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
        </Card>
      </Grid>
    </Section>
  );
}

export function WorkspacePageSkeleton({ titleWidth = 'w-72' }) {
  return (
    <Section size="wide" className="pt-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className={`mt-5 h-12 ${titleWidth}`} />
      <Skeleton className="mt-3 h-4 w-[32rem] max-w-full" />
      <Grid cols="aside" gap="lg" className="mt-8">
        <Card hover={false} className="max-w-4xl">
          <div className="flex items-center gap-4">
            <SkeletonAvatar size="lg" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-4 w-64 max-w-full" />
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-12 w-32 rounded-full" />
          </div>
        </Card>
        <div className="space-y-4">
          {[0, 1].map((item) => (
            <Card key={item} hover={false}>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-4 h-8 w-44" />
              <SkeletonText className="mt-4" lines={3} />
            </Card>
          ))}
        </div>
      </Grid>
    </Section>
  );
}
