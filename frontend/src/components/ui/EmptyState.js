'use client';

import { Inbox, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from './Button';

export default function EmptyState({
  title,
  message,
  ctaLabel,
  onCta,
  secondaryCtaLabel,
  onSecondaryCta,
  eyebrow = 'Nothing Here',
  icon: Icon = Inbox,
  compact = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`card-elevated relative overflow-hidden text-center ${compact ? 'p-6 sm:p-7' : 'p-8 sm:p-10'}`}
    >
      <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/70 to-transparent dark:via-amber-300/40" />
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-amber-50 text-amber-800 shadow-[0_18px_40px_rgba(183,146,87,0.16)] dark:bg-amber-400/10 dark:text-amber-200">
        <Icon className="h-7 w-7" />
      </div>
      <p className="eyebrow mt-5 inline-flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5" />
        {eyebrow}
      </p>
      <h3 className="mt-3 text-2xl font-semibold">{title}</h3>
      <p className="editorial-copy mx-auto mt-3 max-w-xl">{message}</p>
      {ctaLabel && onCta ? (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={onCta}>{ctaLabel}</Button>
          {secondaryCtaLabel && onSecondaryCta ? (
            <Button variant="secondary" onClick={onSecondaryCta}>
              {secondaryCtaLabel}
            </Button>
          ) : null}
        </div>
      ) : null}
    </motion.div>
  );
}
