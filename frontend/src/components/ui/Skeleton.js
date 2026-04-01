import clsx from 'clsx';

export function SkeletonText({ className = '', lines = 3 }) {
  return (
    <div className={clsx('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={`skeleton-line-${index}`}
          variant="text"
          className={clsx(index === lines - 1 && lines > 1 ? 'w-4/5' : 'w-full', 'h-4')}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ className = '', size = 'md' }) {
  return (
    <Skeleton
      variant="avatar"
      className={clsx(
        size === 'sm' && 'h-10 w-10',
        size === 'md' && 'h-12 w-12',
        size === 'lg' && 'h-16 w-16',
        className
      )}
    />
  );
}

export function SkeletonCard({ className = '' }) {
  return <Skeleton variant="card" className={clsx('h-48 w-full', className)} />;
}

export default function Skeleton({
  as: Component = 'div',
  animate = true,
  className = '',
  variant = 'default',
}) {
  return (
    <Component
      aria-hidden="true"
      className={clsx(
        animate && 'animate-pulse',
        variant === 'default' && 'rounded-xl bg-slate-200 dark:bg-slate-800',
        variant === 'text' && 'rounded-full bg-slate-200/85 dark:bg-slate-800/85',
        variant === 'avatar' && 'rounded-full bg-slate-200 dark:bg-slate-800',
        variant === 'card' && 'rounded-[24px] bg-slate-200/80 dark:bg-slate-800/80',
        className
      )}
    />
  );
}
