import Image from 'next/image';
import Grid from '@/components/ui/Grid';
import Section from '@/components/ui/Section';
import Card from '@/components/ui/Card';
import { ABOUT_VISUALS, FEATURED_EDITORIAL_PANELS } from '@/lib/siteImages';
import { getBrandBlurDataUrl } from '@/lib/imagePlaceholders';
import { absoluteUrl } from '@/lib/seo';

export const metadata = {
  title: 'About',
  description:
    'Learn about DraftSphere, a premium editorial blogging platform designed with modern SaaS precision and a luxury publishing visual language.',
  alternates: {
    canonical: absoluteUrl('/about'),
  },
  openGraph: {
    title: 'About DraftSphere',
    description:
      'A premium editorial blogging platform designed with modern SaaS precision and a luxury publishing visual language.',
    type: 'website',
    url: absoluteUrl('/about'),
    images: [
      {
        url: ABOUT_VISUALS.hero.image,
        width: 1600,
        height: 1200,
        alt: ABOUT_VISUALS.hero.alt,
      },
    ],
  },
};

const pillars = [
  {
    title: 'Editorial Calm',
    description:
      'Typography, spacing, and imagery are designed to help readers slow down and stay with the content.',
  },
  {
    title: 'Product Discipline',
    description:
      'Admin tools, search, comments, and publishing flows follow a cleaner SaaS logic so the platform stays usable as it scales.',
  },
  {
    title: 'Visual Restraint',
    description:
      'Every image is chosen to support the brand mood: polished, minimal, modern, and never noisy.',
  },
];

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <Section
        eyebrow="About"
        title="DraftSphere is a premium editorial environment for modern creators"
        description="The platform blends magazine-inspired art direction with product-grade UX so publishing, browsing, and moderation all feel more intentional."
        size="wide"
      >
        <Grid cols="split" gap="lg" className="items-start">
          <div className="relative min-h-[28rem] overflow-hidden rounded-[32px] border border-white/60 shadow-[0_28px_64px_rgba(18,12,7,0.14)]">
            <Image
              src={ABOUT_VISUALS.hero.image}
              alt={ABOUT_VISUALS.hero.alt}
              fill
              priority
              quality={72}
              placeholder="blur"
              blurDataURL={getBrandBlurDataUrl('light')}
              sizes="(max-width: 1024px) 100vw, 48vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,6,5,0.12),rgba(8,6,5,0.32))]" />
          </div>

          <div className="space-y-4">
            <Card variant="elevated" className="p-6 sm:p-7" hover={false}>
              <p className="eyebrow">Our point of view</p>
              <p className="mt-4 text-base leading-8 text-slate-700 dark:text-slate-200">
                DraftSphere was created for thoughtful publishing. Instead of treating blog content as generic feed material, we frame it like an editorial object: readable, atmospheric, and worthy of time.
              </p>
            </Card>

            <Grid cols="default" gap="sm" className="md:grid-cols-2 xl:grid-cols-2">
              {ABOUT_VISUALS.collage.map((visual) => (
                <div
                  key={visual.id}
                  className="relative min-h-[14rem] overflow-hidden rounded-[26px] border border-white/60 shadow-[0_18px_40px_rgba(18,12,7,0.1)]"
                >
                  <Image
                    src={visual.image}
                    alt={visual.alt}
                    fill
                    quality={68}
                    placeholder="blur"
                    blurDataURL={getBrandBlurDataUrl('light')}
                    sizes="(max-width: 1024px) 100vw, 24vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,6,5,0.08),rgba(8,6,5,0.22))]" />
                </div>
              ))}
            </Grid>
          </div>
        </Grid>
      </Section>

      <Section
        eyebrow="Design Principles"
        title="What shapes the product"
        description="These principles guide both the reading experience and the application design system."
        size="wide"
      >
        <Grid cols="triple" gap="md">
          {pillars.map((pillar) => (
            <Card key={pillar.title} variant="blog" className="h-full" hover={false}>
              <p className="eyebrow">Principle</p>
              <h2 className="mt-4 text-[2rem] leading-tight">{pillar.title}</h2>
              <p className="editorial-copy mt-3">{pillar.description}</p>
            </Card>
          ))}
        </Grid>
      </Section>

      <Section
        eyebrow="Image Direction"
        title="The image language behind DraftSphere"
        description="We use premium, calm photography to reinforce the black, ivory, and gold identity without crowding the interface."
        size="wide"
      >
        <Grid cols="triple" gap="md">
          {FEATURED_EDITORIAL_PANELS.map((panel) => (
            <div
              key={panel.id}
              className="relative min-h-[20rem] overflow-hidden rounded-[30px] border border-white/60 shadow-[0_22px_52px_rgba(18,12,7,0.12)]"
            >
              <Image
                src={panel.image}
                alt={panel.alt}
                fill
                quality={68}
                placeholder="blur"
                blurDataURL={getBrandBlurDataUrl('light')}
                sizes="(max-width: 1024px) 100vw, 30vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,6,5,0.08),rgba(8,6,5,0.44))]" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200">
                  {panel.eyebrow}
                </p>
                <h3 className="mt-3 text-[2rem] leading-tight">{panel.title}</h3>
              </div>
            </div>
          ))}
        </Grid>
      </Section>
    </div>
  );
}
