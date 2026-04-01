'use client';

import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const toneMap = {
  error: {
    icon: AlertCircle,
    className:
      'border-rose-200/80 bg-rose-50/90 text-rose-700 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-200',
  },
  info: {
    icon: Info,
    className:
      'border-amber-200/80 bg-amber-50/90 text-amber-800 dark:border-amber-300/30 dark:bg-amber-950/30 dark:text-amber-100',
  },
  success: {
    icon: CheckCircle2,
    className:
      'border-amber-200/80 bg-amber-50/90 text-amber-800 dark:border-amber-300/30 dark:bg-amber-950/30 dark:text-amber-100',
  },
};

export default function Alert({
  title = 'Something went wrong',
  message,
  action,
  variant = 'error',
  icon: CustomIcon,
}) {
  const tone = toneMap[variant] || toneMap.error;
  const Icon = CustomIcon || tone.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`rounded-[24px] border p-4 shadow-sm backdrop-blur ${tone.className}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{title}</p>
          {message ? <p className="mt-1 text-sm leading-6">{message}</p> : null}
          {action ? <div className="mt-3">{action}</div> : null}
        </div>
      </div>
    </motion.div>
  );
}
