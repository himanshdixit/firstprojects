'use client';

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import clsx from 'clsx';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { getModalMotion } from '@/lib/motion';
import { modalSizeClasses } from './styles';

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className = '',
  panelClassName = '',
  size = 'md',
  bodyClassName = '',
  headerClassName = '',
  footer,
  footerClassName = '',
  showCloseButton = true,
}) {
  const prefersReducedMotion = useReducedMotion();
  const modalMotion = getModalMotion(prefersReducedMotion);

  return (
    <AnimatePresence>
      {open ? (
        <Dialog open={open} onClose={onClose} className={clsx('relative z-50', className)}>
          <motion.div
            {...modalMotion.overlay}
            className="fixed inset-0 bg-[rgba(8,6,5,0.72)] backdrop-blur-[10px]"
            aria-hidden="true"
          />

          <div className="fixed inset-0 overflow-y-auto p-4 sm:p-6">
            <div className="flex min-h-full items-end justify-center sm:items-center">
              <DialogPanel
                as={motion.div}
                {...modalMotion.panel}
                className={clsx(
                  'w-full rounded-[32px] border border-amber-100/80 bg-[radial-gradient(circle_at_top_left,rgba(214,181,126,0.18),transparent_28%),linear-gradient(180deg,rgba(255,252,247,0.98),rgba(249,243,233,0.94))] p-6 shadow-[0_32px_90px_rgba(18,12,7,0.18)] backdrop-blur-xl dark:border-amber-300/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(210,178,122,0.14),transparent_30%),linear-gradient(180deg,rgba(18,14,11,0.98),rgba(10,8,6,0.96))] sm:p-7',
                  modalSizeClasses[size] || modalSizeClasses.md,
                  panelClassName
                )}
              >
                {title || description || showCloseButton ? (
                  <div className={clsx('flex items-start justify-between gap-4', headerClassName)}>
                    <div className="min-w-0 flex-1">
                      {title ? (
                        <DialogTitle className="font-display text-[2rem] leading-none text-slate-950 dark:text-white">
                          {title}
                        </DialogTitle>
                      ) : null}
                      {description ? (
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                          {description}
                        </p>
                      ) : null}
                    </div>
                    {showCloseButton ? (
                      <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border border-amber-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(251,246,238,0.86))] p-2 text-slate-500 shadow-[0_10px_22px_rgba(18,12,7,0.06)] transition hover:-translate-y-0.5 hover:border-amber-300/80 hover:text-slate-900 dark:border-amber-300/15 dark:bg-[linear-gradient(180deg,rgba(20,17,13,0.9),rgba(12,10,8,0.84))] dark:text-slate-400 dark:hover:text-white"
                        aria-label="Close modal"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                ) : null}

                <div className={clsx(title || description ? 'mt-5' : '', 'space-y-4', bodyClassName)}>
                  {children}
                </div>

                {footer ? (
                  <div
                    className={clsx(
                      'mt-6 flex items-center justify-end gap-3 border-t border-amber-100/70 pt-5 dark:border-amber-300/10',
                      footerClassName
                    )}
                  >
                    {footer}
                  </div>
                ) : null}
              </DialogPanel>
            </div>
          </div>
        </Dialog>
      ) : null}
    </AnimatePresence>
  );
}
