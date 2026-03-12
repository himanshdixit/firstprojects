'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Button from '@/components/ui/Button';
import useAuth from '@/hooks/useAuth';

function NavLink({ href, children }) {
  return (
    <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 360, damping: 24 }}>
      <Link className="rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800" href={href}>
        {children}
      </Link>
    </motion.div>
  );
}

export default function Header() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, logout, loading } = useAuth();

  useEffect(() => {
    router.prefetch('/');
    router.prefetch('/create-post');
    router.prefetch('/profile');
    router.prefetch('/admin');
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 24 }}
      className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90"
    >
      <div className="container-shell flex h-16 items-center justify-between">
        <motion.div whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 420, damping: 26 }}>
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold sm:text-base">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/codex-blog-logo.png" alt="Codex Blogging logo" className="h-7 w-7 rounded-lg object-cover" />
            <span>Codex Blogging</span>
          </Link>
        </motion.div>
        <nav className="flex items-center gap-2 sm:gap-3">
          <NavLink href="/create-post">Create</NavLink>
          <NavLink href="/profile">Profile</NavLink>
          {isAdmin ? <NavLink href="/admin">Admin</NavLink> : null}

          {!loading && !isAuthenticated ? (
            <>
              <NavLink href="/login">Login</NavLink>
              <NavLink href="/register">Register</NavLink>
            </>
          ) : null}

          {!loading && isAuthenticated ? (
            <Button variant="secondary" onClick={handleLogout}>Logout</Button>
          ) : null}

          <ThemeToggle />
        </nav>
      </div>
    </motion.header>
  );
}
