import clsx from 'clsx';

export default function Grid({
  children,
  className = '',
  cols = 'default',
  gap = 'md',
}) {
  return (
    <div
      className={clsx(
        'grid',
        gap === 'sm' && 'gap-4',
        gap === 'md' && 'gap-6',
        gap === 'lg' && 'gap-8',
        cols === 'default' && 'md:grid-cols-2 xl:grid-cols-3',
        cols === 'feature' && 'lg:grid-cols-[1.15fr_0.85fr]',
        cols === 'aside' && 'lg:grid-cols-[minmax(0,1.15fr)_340px]',
        cols === 'split' && 'lg:grid-cols-2',
        cols === 'triple' && 'lg:grid-cols-3',
        cols === 'admin' && 'xl:grid-cols-[1.6fr_1fr]',
        className
      )}
    >
      {children}
    </div>
  );
}
