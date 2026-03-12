'use client';

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import Button from '@/components/ui/Button';

export default function FormModal({
  open,
  title,
  subtitle,
  confirmLabel = 'Save changes',
  cancelLabel = 'Cancel',
  loading = false,
  onConfirm,
  onClose,
  children,
}) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 overflow-y-auto p-4">
        <div className="flex min-h-full items-center justify-center">
          <DialogPanel className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
            {subtitle ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p> : null}

            <div className="mt-5 space-y-4">{children}</div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={onClose} disabled={loading}>
                {cancelLabel}
              </Button>
              <Button onClick={onConfirm} disabled={loading}>
                {loading ? 'Saving...' : confirmLabel}
              </Button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
