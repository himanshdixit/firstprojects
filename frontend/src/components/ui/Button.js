'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function Button({
  children,
  className,
  variant = 'primary',
  type = 'button',
  ...props
}) {
  return (
    <motion.button
      whileHover={{ y: -1, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
      type={type}
      className={clsx(
        'inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary' &&
          'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400',
        variant === 'secondary' &&
          'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
        variant === 'danger' &&
          'bg-rose-600 text-white hover:bg-rose-700',
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
