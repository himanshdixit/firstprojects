'use client';

import { useEffect } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';

export default function Error({ error, reset }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <Alert
      title="Unexpected application error"
      message={error?.message || 'Please try again.'}
      action={<Button onClick={reset}>Try again</Button>}
    />
  );
}
