import Link from 'next/link';
import Image from 'next/image';
import Section from '@/components/ui/Section';
import Grid from '@/components/ui/Grid';
import Button from '@/components/ui/Button';
import { ABOUT_VISUALS } from '@/lib/siteImages';
import { getBrandBlurDataUrl } from '@/lib/imagePlaceholders';

export default function AboutPreviewSection() {
  return (
    <Section
      eyebrow="About DraftSphere"
      title="A modern editorial product with a luxury publishing mood"
      description="DraftSphere was designed to make creators, readers, and moderators feel like they are operating inside a polished editorial studio rather than a generic content dashboard."
      size="wide"
    >
      <Grid cols="split" gap="lg" className="items-center">
        <div className="space-y-5">
          <div className="card-surface p-5 sm:p-6">
            <p className="eyebrow">Why it feels different</p>
            <p className="mt-4 text-base leading-8 text-slate-700 dark:text-slate-200">
              We combined modern SaaS clarity with the warmth of magazine art direction: better typography, calmer surfaces, carefully chosen imagery, and layouts that stay elegant on both mobile and desktop.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button as={Link} href="/about">
                Visit About Page
              </Button>
              <Button as={Link} href="/" variant="secondary">
                Explore the stories
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1.05fr_0.95fr]">
          <div className="relative min-h-[22rem] overflow-hidden rounded-[30px] border border-white/60 shadow-[0_24px_54px_rgba(18,12,7,0.12)]">
            <Image
              src={ABOUT_VISUALS.hero.image}
              alt={ABOUT_VISUALS.hero.alt}
              fill
              quality={70}
              placeholder="blur"
              blurDataURL={getBrandBlurDataUrl('light')}
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </div>

          <div className="grid gap-4">
            {ABOUT_VISUALS.collage.map((visual) => (
              <div
                key={visual.id}
                className="relative min-h-[10.5rem] overflow-hidden rounded-[26px] border border-white/60 shadow-[0_18px_40px_rgba(18,12,7,0.1)]"
              >
                <Image
                  src={visual.image}
                  alt={visual.alt}
                  fill
                  quality={68}
                  placeholder="blur"
                  blurDataURL={getBrandBlurDataUrl('light')}
                  sizes="(max-width: 1024px) 100vw, 22vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,10,7,0.08),rgba(15,10,7,0.18))]" />
              </div>
            ))}
          </div>
        </div>
      </Grid>
    </Section>
  );
}
