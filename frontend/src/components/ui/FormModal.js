'use client';

import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

export default function FormModal({
  open,
  title,
  subtitle,
  size = 'md',
  confirmLabel = 'Save changes',
  cancelLabel = 'Cancel',
  loading = false,
  onConfirm,
  onClose,
  children,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={subtitle}
      size={size}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button onClick={onConfirm} loading={loading} loadingLabel="Saving changes">
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  );
}
