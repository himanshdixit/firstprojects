'use client';

import clsx from 'clsx';

const dotSizeClasses = {
  xs: 'h-1.5 w-1.5',
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
};

const gapSizeClasses = {
  xs: 'gap-1',
  sm: 'gap-1.5',
  md: 'gap-2',
  lg: 'gap-2.5',
};

const textSizeClasses = {
  xs: 'text-xs',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-sm',
};

const dotToneClasses = {
  brand: 'bg-amber-600 dark:bg-amber-300',
  neutral: 'bg-slate-400 dark:bg-slate-500',
  inverse: 'bg-white',
  danger: 'bg-rose-500 dark:bg-rose-300',
};

const labelToneClasses = {
  brand: 'text-amber-800 dark:text-amber-200',
  neutral: 'text-slate-500 dark:text-slate-400',
  inverse: 'text-white',
  danger: 'text-rose-600 dark:text-rose-300',
};

export default function Loader({
  className = '',
  inline = false,
  label = 'Loading',
  showLabel = false,
  size = 'md',
  variant = 'brand',
}) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={clsx(
        'inline-flex items-center',
        gapSizeClasses[size] || gapSizeClasses.md,
        !inline && 'justify-center',
        className
      )}
    >
      <span className={clsx('inline-flex items-center', gapSizeClasses[size] || gapSizeClasses.md)}>
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className={clsx(
              'inline-block rounded-full animate-[pulse_1.1s_ease-in-out_infinite]',
              dotSizeClasses[size] || dotSizeClasses.md,
              dotToneClasses[variant] || dotToneClasses.brand
            )}
            style={{ animationDelay: `${index * 140}ms` }}
          />
        ))}
      </span>
      {showLabel ? (
        <span
          className={clsx(
            'font-medium',
            textSizeClasses[size] || textSizeClasses.md,
            labelToneClasses[variant] || labelToneClasses.brand
          )}
        >
          {label}
        </span>
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </span>
  );
}
