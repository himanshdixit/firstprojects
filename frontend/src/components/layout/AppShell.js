'use client';

import { Suspense, useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Container from '@/components/ui/Container';
import { getPageTransition } from '@/lib/motion';

function HeaderFallback() {
  return <div className="h-[92px] sm:h-[98px]" />;
}

function clearLingeringUiOverlays() {
  if (typeof document === 'undefined') {
    return;
  }

  const hasOpenDialog = document.querySelector('[role="dialog"]');
  if (hasOpenDialog) {
    return;
  }

  document.documentElement.style.removeProperty('overflow');
  document.documentElement.style.removeProperty('padding-right');
  document.body.style.removeProperty('overflow');
  document.body.style.removeProperty('padding-right');

  Array.from(document.body.children).forEach((child) => {
    if (child.hasAttribute('inert')) {
      child.removeAttribute('inert');
    }
  });

  document.querySelectorAll('[data-headlessui-portal]').forEach((portal) => {
    if (!portal.querySelector('[role="dialog"]')) {
      portal.remove();
    }
  });
}

export default function AppShell({ children }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const pageTransition = getPageTransition(prefersReducedMotion);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    clearLingeringUiOverlays();

    const handleWindowFocus = () => {
      clearLingeringUiOverlays();
    };

    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [pathname]);

  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[linear-gradient(135deg,#8f6b33,#d6b57e)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#120d08]"
      >
        Skip to content
      </a>
      <Suspense fallback={<HeaderFallback />}>
        <Header />
      </Suspense>
      <main id="main-content" className="pb-16 pt-6 sm:pt-8">
        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={pathname}
            layout="position"
            initial={pageTransition.initial}
            animate={pageTransition.animate}
            exit={pageTransition.exit}
            transition={pageTransition.transition}
          >
            <Container>{children}</Container>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
