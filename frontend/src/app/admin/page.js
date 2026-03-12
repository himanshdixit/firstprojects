import AdminOverview from '@/components/admin/AdminOverview';
import { requireAdmin } from '@/lib/routeProtection';

export default function AdminDashboardPage() {
  requireAdmin('/admin');
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">Manage users and review all content.</p>
      <AdminOverview />
    </div>
  );
}
