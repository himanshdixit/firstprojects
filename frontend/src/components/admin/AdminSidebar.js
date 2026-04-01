'use client';

import { ChevronLeft, ChevronRight, PanelLeftClose, Shield, X } from 'lucide-react';
import clsx from 'clsx';
import Badge from '@/components/ui/Badge';

export default function AdminSidebar({
  activeTab,
  items = [],
  onChange,
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
  user,
}) {
  const sidebarContent = (
    <aside
      className={clsx(
        'card-surface flex h-full flex-col gap-5 overflow-y-auto p-3 sm:gap-6 sm:p-4 lg:min-h-[calc(100vh-8rem)]',
        collapsed ? 'lg:px-2.5' : 'lg:px-4'
      )}
    >
      <div
      className={clsx(
          'rounded-[28px] border border-amber-100/70 bg-[radial-gradient(circle_at_top_left,rgba(214,181,126,0.16),transparent_34%),linear-gradient(180deg,rgba(255,251,245,0.9),rgba(255,247,238,0.7))] p-3 shadow-[0_18px_40px_rgba(18,12,7,0.06)] backdrop-blur dark:border-amber-300/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(210,178,122,0.14),transparent_34%),linear-gradient(180deg,rgba(18,14,11,0.94),rgba(10,8,6,0.84))]',
          collapsed ? 'lg:px-2.5' : 'lg:p-4'
        )}
      >
        <div className={clsx('flex items-center gap-3', collapsed && 'lg:justify-center')}>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#8f6b33,#d6b57e)] text-[#120d08] shadow-[0_14px_30px_rgba(143,107,51,0.28)]">
            <Shield className="h-5 w-5" />
          </div>
          <div className={clsx('min-w-0 flex-1', collapsed && 'lg:hidden')}>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-amber-700 dark:text-amber-300">
              DraftSphere Suite
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
              Editorial Control Room
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden rounded-xl border border-slate-200 bg-white/80 p-2 text-slate-500 transition hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white lg:inline-flex"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onCloseMobile}
            className="inline-flex rounded-xl border border-slate-200 bg-white/80 p-2 text-slate-500 transition hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className={clsx('mt-4 space-y-3', collapsed && 'lg:hidden')}>
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3 dark:border-slate-800 dark:bg-slate-900/70">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              Signed in
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
              {user?.name || 'Administrator'}
            </p>
            <div className="mt-2">
              <Badge variant="brand" size="sm">
                {user?.role === 'admin' ? 'Admin access' : 'Limited access'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <nav className="grid gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                onChange(item.key);
                onCloseMobile?.();
              }}
              className={clsx(
                'group flex items-center gap-3 rounded-[22px] px-3 py-3.5 text-left transition duration-300 ease-out',
                collapsed ? 'lg:justify-center lg:px-2.5' : 'justify-start',
                isActive
                  ? 'bg-[linear-gradient(135deg,#8f6b33,#d6b57e)] text-[#120d08] shadow-[0_18px_36px_rgba(143,107,51,0.24)]'
                  : 'text-slate-600 hover:bg-amber-50/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-[#18130f] dark:hover:text-white'
              )}
            >
              <span
                className={clsx(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl',
                  isActive
                    ? 'bg-white/25 text-[#120d08]'
                    : 'bg-slate-100 text-slate-600 group-hover:bg-white dark:bg-slate-900 dark:text-slate-300 dark:group-hover:bg-slate-800'
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className={clsx('min-w-0 flex-1', collapsed && 'lg:hidden')}>
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-semibold">{item.label}</span>
                  {typeof item.count === 'number' ? (
                    <Badge
                      variant={isActive ? 'default' : 'muted'}
                      size="sm"
                      className={clsx(isActive && 'border-white/30 bg-white/35 text-[#120d08]')}
                    >
                      {item.count}
                    </Badge>
                  ) : null}
                </div>
                {item.description ? (
                  <p
                    className={clsx(
                      'mt-1 text-xs leading-5',
                      isActive ? 'text-[#120d08]/75' : 'text-slate-500 dark:text-slate-400'
                    )}
                  >
                    {item.description}
                  </p>
                ) : null}
              </div>
            </button>
          );
        })}
      </nav>

      <div
        className={clsx(
          'mt-auto rounded-[24px] border border-amber-200/70 bg-amber-50/80 p-4 text-sm text-amber-900 dark:border-amber-300/15 dark:bg-amber-400/10 dark:text-amber-100',
          collapsed && 'lg:hidden'
        )}
      >
        <div className="flex items-center gap-2 font-semibold">
          <PanelLeftClose className="h-4 w-4" />
          Moderation tools
        </div>
        <p className="mt-2 text-xs leading-5 text-amber-800/80 dark:text-amber-100/80">
          Review writers, stories, and discussions from one responsive admin workspace built for production operations.
        </p>
      </div>
    </aside>
  );

  return (
    <>
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
          onClick={onCloseMobile}
        >
          <div
            className="absolute inset-y-0 left-0 w-[calc(100%-1rem)] max-w-[360px] translate-x-0 p-2.5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:p-3"
            onClick={(event) => event.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      ) : null}

      <div className="hidden lg:sticky lg:top-24 lg:block lg:self-start">{sidebarContent}</div>
    </>
  );
}
