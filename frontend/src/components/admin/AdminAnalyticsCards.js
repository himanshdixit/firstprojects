import { Activity, FileText, Inbox, MessageSquareText, Users } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';

function MetricCard({ title, value, Icon, tone, helper, meta }) {
  return (
    <Card variant="dashboard" padding="sm" className="relative h-full overflow-hidden" hover={false}>
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(183,146,87,0.78)] to-transparent" />
      <Card.Header>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="font-display mt-4 text-[2.5rem] leading-none text-slate-950 dark:text-white">
            {value}
          </p>
        </div>
        <div className={`rounded-[22px] p-3 shadow-[0_14px_30px_rgba(18,12,7,0.08)] ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
      </Card.Header>
      <Card.Content className="mt-5">
        <p className="text-sm text-slate-500 dark:text-slate-400">{helper}</p>
        {meta ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {meta.map((item) => (
              <Badge key={item.label} variant={item.variant || 'default'} size="sm">
                {item.label}
              </Badge>
            ))}
          </div>
        ) : null}
      </Card.Content>
    </Card>
  );
}

export default function AdminAnalyticsCards({
  usersTotal = 0,
  postsTotal = 0,
  commentsTotal = 0,
  contactsTotal = 0,
  drafts = 0,
  published = 0,
  activityCount = 0,
  resolvedContacts = 0,
}) {
  const publishRate = postsTotal > 0 ? Math.round((published / postsTotal) * 100) : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-5">
      <MetricCard
        title="Platform Members"
        value={usersTotal}
        Icon={Users}
        tone="bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200"
        helper="Registered accounts that can access the blogging workspace."
        meta={[
          { label: 'Access', variant: 'brand' },
          { label: 'Admin ready', variant: 'muted' },
        ]}
      />
      <MetricCard
        title="Story Inventory"
        value={postsTotal}
        Icon={FileText}
        tone="bg-[#efe3cf] text-[#8f6b33] dark:bg-[#8f6b33]/18 dark:text-[#e2c996]"
        helper="Total stories across published articles and editorial drafts."
        meta={[
          { label: `${published} live`, variant: 'success' },
          { label: `${drafts} drafts`, variant: 'warning' },
        ]}
      />
      <MetricCard
        title="Community Activity"
        value={commentsTotal}
        Icon={MessageSquareText}
        tone="bg-stone-200 text-stone-700 dark:bg-stone-400/15 dark:text-stone-200"
        helper="Comment activity currently visible to moderators across the platform."
        meta={[
          { label: 'Discussion', variant: 'brand' },
          { label: 'Moderation', variant: 'outline' },
        ]}
      />
      <MetricCard
        title="Contact Inbox"
        value={contactsTotal}
        Icon={Inbox}
        tone="bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200"
        helper="Inbound inquiries captured through the public contact experience."
        meta={[
          { label: `${resolvedContacts} resolved`, variant: 'success' },
          { label: `${Math.max(contactsTotal - resolvedContacts, 0)} open`, variant: 'warning' },
        ]}
      />
      <MetricCard
        title="Editorial Pulse"
        value={activityCount}
        Icon={Activity}
        tone="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
        helper="Recent operational events surfaced in the live admin activity feed."
        meta={[
          { label: `${publishRate}% publish rate`, variant: 'default' },
          { label: published > drafts ? 'Healthy flow' : 'Review drafts', variant: published > drafts ? 'success' : 'warning' },
        ]}
      />
    </div>
  );
}
