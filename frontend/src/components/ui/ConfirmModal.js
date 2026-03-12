'use client';

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import Button from '@/components/ui/Button';

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'danger',
  loading = false,
  onConfirm,
  onClose,
}) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/45" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{description}</p>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              {cancelLabel}
            </Button>
            <Button variant={confirmVariant} onClick={onConfirm} disabled={loading}>
              {loading ? 'Please wait...' : confirmLabel}
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
