import Section from '@/components/ui/Section';
import Grid from '@/components/ui/Grid';
import EditorialImageCard from '@/components/ui/EditorialImageCard';
import { FEATURED_EDITORIAL_PANELS } from '@/lib/siteImages';

export default function FeaturedEditorialSection() {
  return (
    <Section
      eyebrow="Curated Visual Features"
      title="A publishing experience shaped like a premium magazine product"
      description="The imagery across DraftSphere now follows the same black, ivory, and gold editorial language as the rest of the interface, so the reading experience feels designed instead of decorated."
      size="wide"
    >
      <Grid cols="triple" gap="md">
        {FEATURED_EDITORIAL_PANELS.map((panel) => (
          <EditorialImageCard
            key={panel.id}
            href={panel.href}
            image={panel.image}
            alt={panel.alt}
            eyebrow={panel.eyebrow}
            title={panel.title}
            description={panel.description}
            ctaLabel={panel.ctaLabel}
          />
        ))}
      </Grid>
    </Section>
  );
}
