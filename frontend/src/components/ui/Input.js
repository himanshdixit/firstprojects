import { forwardRef } from 'react';
import clsx from 'clsx';

const Input = forwardRef(function Input({ label, error, className, ...props }, ref) {
  return (
    <label className="block space-y-1.5">
      {label ? <span className="text-sm font-medium">{label}</span> : null}
      <input
        ref={ref}
        className={clsx(
          'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none ring-emerald-500 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-900',
          error && 'border-rose-500 ring-rose-500 focus:ring-2',
          className
        )}
        {...props}
      />
      {error ? <p className="text-xs text-rose-500">{error}</p> : null}
    </label>
  );
});

export default Input;
