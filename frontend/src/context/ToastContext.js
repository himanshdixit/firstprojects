'use client';

import { createContext, useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const toneMap = {
  success: {
    icon: CheckCircle2,
    className:
      'border-amber-200/80 bg-white/95 text-slate-900 shadow-[0_22px_48px_rgba(143,107,51,0.16)] dark:border-amber-300/20 dark:bg-slate-900/95 dark:text-white',
    iconClassName: 'text-amber-700 dark:text-amber-300',
  },
  error: {
    icon: AlertCircle,
    className:
      'border-rose-200/80 bg-white/95 text-slate-900 shadow-[0_22px_48px_rgba(225,29,72,0.16)] dark:border-rose-500/20 dark:bg-slate-900/95 dark:text-white',
    iconClassName: 'text-rose-600 dark:text-rose-300',
  },
  info: {
    icon: Info,
    className:
      'border-amber-200/80 bg-white/95 text-slate-900 shadow-[0_22px_48px_rgba(143,107,51,0.14)] dark:border-amber-300/20 dark:bg-slate-900/95 dark:text-white',
    iconClassName: 'text-amber-700 dark:text-amber-300',
  },
};

function ToastViewport({ toasts, onDismiss }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[120] flex justify-center px-4 sm:top-6 sm:px-6">
      <div className="flex w-full max-w-md flex-col gap-3">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const tone = toneMap[toast.variant] || toneMap.info;
            const Icon = tone.icon;

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className={`pointer-events-auto rounded-3xl border p-4 backdrop-blur ${tone.className}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${tone.iconClassName}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{toast.title}</p>
                    {toast.message ? (
                      <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-300">{toast.message}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => onDismiss(toast.id)}
                    className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    aria-label="Dismiss notification"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    ({ title, message = '', variant = 'info', duration = 3600 }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [...prev, { id, title, message, variant }]);

      if (duration > 0) {
        window.setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast]
  );

  const value = useMemo(
    () => ({
      pushToast,
      success: (title, message) => pushToast({ title, message, variant: 'success' }),
      error: (title, message) => pushToast({ title, message, variant: 'error' }),
      info: (title, message) => pushToast({ title, message, variant: 'info' }),
      dismissToast,
    }),
    [pushToast, dismissToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export default ToastContext;
