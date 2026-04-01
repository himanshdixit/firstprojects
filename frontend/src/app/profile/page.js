import ProfileCard from '@/components/profile/ProfileCard';
import Grid from '@/components/ui/Grid';
import InsightCard from '@/components/ui/InsightCard';
import Section from '@/components/ui/Section';
import { requireAuth } from '@/lib/routeProtection';

export default function ProfilePage() {
  requireAuth('/profile');
  return (
    <Section
      eyebrow="Profile"
      title="Your author profile and account settings"
      description="Manage your identity, avatar, and account details from a clean profile workspace that matches the editorial tone of the platform."
      size="wide"
      className="pt-2"
    >
      <Grid cols="aside" gap="lg">
        <ProfileCard />
        <div className="space-y-4">
          <InsightCard
            eyebrow="Identity"
            title="Keep your profile current"
            description="A clear name, polished avatar, and up-to-date email make the publishing experience feel more credible and personal."
          />
          <InsightCard
            eyebrow="Tip"
            title="Consistent branding matters"
            description="Readers trust creators more when profile presentation is as intentional as the writing itself."
          />
        </div>
      </Grid>
    </Section>
  );
}
