'use client';

import { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, LayoutDashboard, LogOut, Menu as MenuIcon, Search, SquarePen, UserCircle2, X } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import useAuth from '@/hooks/useAuth';
import useToast from '@/hooks/useToast';
import { getButtonMotion } from '@/lib/motion';
import { getAvatar } from '@/lib/media';

function isRouteActive(pathname, href) {
  if (href === '/') {
    return pathname === '/';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ href, children, pathname }) {
  const active = isRouteActive(pathname, href);

  return (
    <Link
      aria-current={active ? 'page' : undefined}
      className={`group rounded-full px-3 py-2 text-sm font-medium transition ${
        active
          ? 'bg-[linear-gradient(135deg,#8f6b33,#d6b57e)] text-[#120d08] shadow-[0_10px_24px_rgba(143,107,51,0.16)] dark:bg-[linear-gradient(135deg,#8f6b33,#d6b57e)] dark:text-[#120d08]'
          : 'text-slate-600 hover:bg-amber-50/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-[#18130f] dark:hover:text-white'
      }`}
      href={href}
    >
      <span className="inline-flex items-center transition-transform duration-200 ease-out group-hover:-translate-y-0.5">
        {children}
      </span>
    </Link>
  );
}

function UserMenu({ isAdmin, onLogout, user, loggingOut }) {
  const avatarSrc = getAvatar(user);

  return (
    <Menu as="div" className="relative">
      <MenuButton className="inline-flex items-center gap-2 rounded-full border border-amber-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(251,246,238,0.86))] px-2 py-1.5 text-sm font-medium text-slate-700 shadow-[0_12px_28px_rgba(18,12,7,0.06)] backdrop-blur transition hover:border-amber-300/80 hover:bg-white hover:shadow-[0_16px_34px_rgba(18,12,7,0.08)] dark:border-amber-300/15 dark:bg-[linear-gradient(180deg,rgba(20,17,13,0.92),rgba(12,10,8,0.84))] dark:text-slate-100 dark:hover:bg-[#18130f]">
        <span className="relative h-8 w-8 overflow-hidden rounded-full border border-white/70 shadow-[0_8px_18px_rgba(18,12,7,0.08)]">
          <Image src={avatarSrc} alt={user?.name || 'User'} fill sizes="32px" className="object-cover" />
        </span>
        <span className="hidden sm:inline">{user?.name || 'Account'}</span>
        <ChevronDown className="h-4 w-4 opacity-70" />
      </MenuButton>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-2 scale-[0.97]"
        enterTo="opacity-100 translate-y-0 scale-100"
        leave="transition ease-in duration-140"
        leaveFrom="opacity-100 translate-y-0 scale-100"
        leaveTo="opacity-0 translate-y-1 scale-[0.98]"
      >
        <MenuItems className="absolute right-0 z-50 mt-3 w-64 overflow-hidden rounded-[28px] border border-amber-100/80 bg-[linear-gradient(180deg,rgba(255,252,247,0.98),rgba(249,243,233,0.94))] p-2 shadow-[0_28px_72px_rgba(18,12,7,0.16)] backdrop-blur-xl focus:outline-none dark:border-amber-300/10 dark:bg-[linear-gradient(180deg,rgba(18,14,11,0.98),rgba(10,8,6,0.96))]">
          <div className="rounded-[22px] border border-amber-100/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(250,245,236,0.72))] px-3 py-3 dark:border-amber-300/10 dark:bg-[linear-gradient(180deg,rgba(20,17,13,0.84),rgba(12,10,8,0.72))]">
            <div className="flex items-center gap-3">
              <span className="relative h-11 w-11 overflow-hidden rounded-full border border-white/70 shadow-[0_10px_20px_rgba(18,12,7,0.08)]">
                <Image src={avatarSrc} alt={user?.name || 'User'} fill sizes="44px" className="object-cover" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user?.name || 'User'}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email || 'Signed in'}</p>
              </div>
            </div>
            <div className="mt-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-800 dark:bg-amber-400/15 dark:text-amber-200">
              {isAdmin ? 'Admin access' : 'Member account'}
            </div>
          </div>
          <MenuItem>
            {({ focus }) => (
              <Link
                href="/profile"
                className={`mt-1 flex items-center gap-2 rounded-[20px] px-3 py-2.5 text-sm text-slate-700 transition dark:text-slate-100 ${focus ? 'bg-amber-50/80 dark:bg-[#18130f]' : ''}`}
              >
                <UserCircle2 className="h-4 w-4" />
                Profile
              </Link>
            )}
          </MenuItem>
          <MenuItem>
            {({ focus }) => (
              <Link
                href="/create-post"
                className={`flex items-center gap-2 rounded-[20px] px-3 py-2.5 text-sm text-slate-700 transition dark:text-slate-100 ${focus ? 'bg-amber-50/80 dark:bg-[#18130f]' : ''}`}
              >
                <SquarePen className="h-4 w-4" />
                Write a Post
              </Link>
            )}
          </MenuItem>
          {isAdmin ? (
            <MenuItem>
              {({ focus }) => (
                <Link
                  href="/admin"
                  className={`flex items-center gap-2 rounded-[20px] px-3 py-2.5 text-sm text-slate-700 transition dark:text-slate-100 ${focus ? 'bg-amber-50/80 dark:bg-[#18130f]' : ''}`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Admin Panel
                </Link>
              )}
            </MenuItem>
          ) : null}
          <div className="my-2 border-t border-amber-100/70 dark:border-amber-300/10" />
          <MenuItem>
            {({ focus }) => (
              <button
                type="button"
                onClick={onLogout}
                disabled={loggingOut}
                className={`flex w-full items-center gap-2 rounded-[20px] px-3 py-2.5 text-left text-sm text-rose-600 transition dark:text-rose-300 ${focus ? 'bg-rose-50 dark:bg-rose-950/30' : ''}`}
              >
                <LogOut className="h-4 w-4" />
                {loggingOut ? 'Signing out...' : 'Logout'}
              </button>
            )}
          </MenuItem>
        </MenuItems>
      </Transition>
    </Menu>
  );
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();
  const mobileButtonMotion = getButtonMotion(prefersReducedMotion);
  const { isAuthenticated, isAdmin, logout, loading, user } = useAuth();
  const toast = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    router.prefetch('/');
    router.prefetch('/create-post');
    router.prefetch('/profile');
    router.prefetch('/admin');
    router.prefetch('/contact');
  }, [router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, isAuthenticated]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await logout();
      toast.success('Signed out', 'Your session was closed successfully.');
      router.replace('/login');
    } catch (error) {
      toast.error('Logout failed', error?.message || 'Please try again.');
    } finally {
      setLoggingOut(false);
    }
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    const trimmed = search.trim();
    if (!trimmed) {
      router.push('/');
      return;
    }
    router.push(`/?search=${encodeURIComponent(trimmed)}`);
  }

  return (
    <motion.header
      initial={{ y: -18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 24 }}
      className="sticky top-0 z-50 border-b border-amber-200/50 bg-[rgba(244,239,230,0.76)] backdrop-blur-xl dark:border-amber-300/10 dark:bg-[rgba(6,5,5,0.82)]"
    >
      <Container className="py-3">
        <div className="card-surface overflow-visible px-4 py-3 sm:px-5">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <motion.span
                {...mobileButtonMotion}
                className="relative h-12 w-12 overflow-hidden rounded-2xl border border-amber-200/70 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.8),rgba(214,181,126,0.16))] shadow-[0_14px_30px_rgba(143,107,51,0.14)]"
              >
                <Image src="/draftsphere-logo.png" alt="DraftSphere logo" fill sizes="48px" className="object-contain" />
              </motion.span>
              <div className="min-w-0">
                <p className="font-display truncate text-[1.95rem] leading-none text-slate-900 dark:text-white">DraftSphere</p>
                <p className="hidden text-[11px] uppercase tracking-[0.28em] text-[var(--brand)] sm:block">
                  Black Label Editorial House
                </p>
              </div>
            </Link>

            <form onSubmit={handleSearchSubmit} className="hidden flex-1 lg:block">
              <div className="flex items-center gap-3 rounded-full border border-amber-200/70 bg-white/88 px-4 py-3 dark:border-amber-300/15 dark:bg-[#120f0c]/78">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search essays, journals, and themes"
                  className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </div>
            </form>

            <div className="ml-auto hidden items-center gap-2 lg:flex">
              <NavLink href="/" pathname={pathname}>Explore</NavLink>
              <NavLink href="/about" pathname={pathname}>About</NavLink>
              <NavLink href="/contact" pathname={pathname}>Contact</NavLink>
              <NavLink href="/create-post" pathname={pathname}>Write</NavLink>
              <ThemeToggle />
              {!loading && !isAuthenticated ? (
                <>
                  <NavLink href="/login" pathname={pathname}>Login</NavLink>
                  <Button onClick={() => router.push('/register')}>Get Started</Button>
                </>
              ) : null}
              {!loading && isAuthenticated ? (
                <UserMenu isAdmin={isAdmin} onLogout={handleLogout} user={user} loggingOut={loggingOut} />
              ) : null}
            </div>

            <div className="ml-auto flex items-center gap-2 lg:hidden">
              <ThemeToggle />
              <motion.button
                {...mobileButtonMotion}
                type="button"
                onClick={() => setMobileOpen((prev) => !prev)}
                className="rounded-full border border-amber-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(251,246,238,0.86))] p-2.5 shadow-[0_12px_28px_rgba(18,12,7,0.06)] dark:border-amber-300/15 dark:bg-[linear-gradient(180deg,rgba(20,17,13,0.9),rgba(12,10,8,0.84))]"
                aria-label="Toggle navigation"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
              </motion.button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {mobileOpen ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden lg:hidden"
              >
                <form onSubmit={handleSearchSubmit} className="mt-4">
                  <div className="flex items-center gap-3 rounded-full border border-amber-200/70 bg-white/88 px-4 py-3 dark:border-amber-300/15 dark:bg-[#120f0c]/78">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search stories"
                      className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
                    />
                  </div>
                </form>

                <div className="mt-4 grid gap-2">
                  <NavLink href="/" pathname={pathname}>Explore</NavLink>
                  <NavLink href="/about" pathname={pathname}>About</NavLink>
                  <NavLink href="/contact" pathname={pathname}>Contact</NavLink>
                  <NavLink href="/create-post" pathname={pathname}>Write</NavLink>
                  {isAuthenticated ? <NavLink href="/profile" pathname={pathname}>Profile</NavLink> : null}
                  {isAuthenticated && isAdmin ? <NavLink href="/admin" pathname={pathname}>Admin</NavLink> : null}
                  {!loading && !isAuthenticated ? <NavLink href="/login" pathname={pathname}>Login</NavLink> : null}
                  {!loading && !isAuthenticated ? <Button className="w-full" onClick={() => router.push('/register')}>Get Started</Button> : null}
                  {!loading && isAuthenticated ? (
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={handleLogout}
                      loading={loggingOut}
                      loadingLabel="Signing out"
                    >
                      Logout
                    </Button>
                  ) : null}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </Container>
    </motion.header>
  );
}
