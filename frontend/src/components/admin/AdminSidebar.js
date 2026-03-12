'use client';

import { BarChart3, FileText, Shield, Users } from 'lucide-react';
import clsx from 'clsx';

const items = [
  { key: 'overview', label: 'Overview', icon: BarChart3 },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'posts', label: 'Posts', icon: FileText },
];

export default function AdminSidebar({ activeTab, onChange }) {
  return (
    <aside className="card-surface h-fit p-3 sm:p-4">
      <div className="mb-4 flex items-center gap-2 px-2 py-2 text-sm font-semibold">
        <Shield className="h-4 w-4 text-emerald-600" />
        Admin Panel
      </div>

      <nav className="grid grid-cols-3 gap-2 md:grid-cols-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              className={clsx(
                'flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm transition md:justify-start',
                activeTab === item.key
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
