'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';

export function useRequireAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, loading, router, pathname]);

  return { loading, isAuthenticated };
}

export function useRequireAdmin() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!loading && isAuthenticated && !isAdmin) {
      router.replace('/');
    }
  }, [isAuthenticated, isAdmin, loading, router, pathname]);

  return { loading, isAuthenticated, isAdmin };
}
