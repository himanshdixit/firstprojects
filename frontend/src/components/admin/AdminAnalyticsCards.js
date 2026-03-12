import Card from '@/components/ui/Card';
import { FileText, Files, Users, WandSparkles } from 'lucide-react';

function MetricCard({ title, value, Icon, tone }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-semibold">{value}</p>
        </div>
        <div className={`rounded-xl p-3 ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

export default function AdminAnalyticsCards({
  usersTotal = 0,
  postsTotal = 0,
  drafts = 0,
  published = 0,
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        title="Total Users"
        value={usersTotal}
        Icon={Users}
        tone="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
      />
      <MetricCard
        title="Total Posts"
        value={postsTotal}
        Icon={FileText}
        tone="bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300"
      />
      <MetricCard
        title="Published"
        value={published}
        Icon={WandSparkles}
        tone="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
      />
      <MetricCard
        title="Drafts"
        value={drafts}
        Icon={Files}
        tone="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
      />
    </div>
  );
}
