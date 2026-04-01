import { LockKeyhole, PenSquare, Sparkles } from 'lucide-react';
import Section from '@/components/ui/Section';
import Grid from '@/components/ui/Grid';

const highlights = [
  {
    icon: PenSquare,
    title: 'Write with clarity',
    description: 'Create long-form stories, manage drafts, and publish with a clean editorial workflow.',
  },
  {
    icon: Sparkles,
    title: 'Modern reading experience',
    description: 'Responsive layouts, dark mode, comments, and discovery features built for real readers.',
  },
  {
    icon: LockKeyhole,
    title: 'Secure account flow',
    description: 'JWT cookie auth, protected routes, and role-based access designed with production patterns.',
  },
];

export default function AuthSplitLayout({ eyebrow, title, description, children }) {
  return (
    <Section eyebrow={eyebrow} title={title} description={description} size="wide" className="pt-2">
      <Grid cols="aside" gap="lg">
        <div className="space-y-4">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="card-surface flex items-start gap-4 p-5 sm:p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl leading-tight">{item.title}</h2>
                  <p className="editorial-copy mt-2">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div>{children}</div>
      </Grid>
    </Section>
  );
}
