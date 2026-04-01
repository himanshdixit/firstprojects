import CreatePostForm from '@/components/post/CreatePostForm';
import Grid from '@/components/ui/Grid';
import InsightCard from '@/components/ui/InsightCard';
import Section from '@/components/ui/Section';
import { requireAuth } from '@/lib/routeProtection';

export default function CreatePostPage() {
  requireAuth('/create-post');
  return (
    <Section
      eyebrow="Compose"
      title="Create a story with calm, editorial structure"
      description="Draft, refine, and publish from a focused composer designed for clean writing workflows and strong presentation."
      size="wide"
      className="pt-2"
    >
      <Grid cols="aside" gap="lg">
        <CreatePostForm />
        <div className="space-y-4">
          <InsightCard eyebrow="Workflow" title="Publishing checklist">
            <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li>Write a clear headline that communicates the value of the story.</li>
              <li>Use tags strategically so readers can discover the post later.</li>
              <li>Keep drafts private until content, cover image, and structure feel complete.</li>
            </ul>
          </InsightCard>
          <InsightCard
            eyebrow="Guidance"
            title="Premium content habits"
            description="Strong blog posts usually open with context, maintain crisp structure, and close with a practical takeaway for readers."
          />
        </div>
      </Grid>
    </Section>
  );
}
