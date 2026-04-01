import clsx from 'clsx';

export default function Container({ children, className = '', size = 'default' }) {
  return (
    <div
      className={clsx(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        size === 'default' && 'max-w-7xl',
        size === 'wide' && 'max-w-[92rem]',
        size === 'reading' && 'max-w-4xl',
        className
      )}
    >
      {children}
    </div>
  );
}
