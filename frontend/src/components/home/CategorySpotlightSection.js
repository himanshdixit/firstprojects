'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import Section from '@/components/ui/Section';
import EditorialImageCard from '@/components/ui/EditorialImageCard';
import Button from '@/components/ui/Button';
import { CATEGORY_SPOTLIGHTS } from '@/lib/siteImages';

export default function CategorySpotlightSection() {
  const railRef = useRef(null);

  function scrollRail(direction) {
    const rail = railRef.current;
    if (!rail) return;

    const amount = Math.max(rail.clientWidth * 0.82, 280);
    rail.scrollBy({
      left: direction === 'next' ? amount : -amount,
      behavior: 'smooth',
    });
  }

  return (
    <Section
      eyebrow="Category Worlds"
      title="Browse curated collections like a premium editorial product rail"
      description="Instead of a plain category grid, DraftSphere now presents collections as a horizontally browsable gallery with stronger visual atmosphere, smoother scanning, and a more product-grade rhythm on mobile first."
      size="wide"
      actions={
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => scrollRail('prev')}
            leftIcon={<ChevronLeft className="h-4 w-4" />}
          >
            Prev
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => scrollRail('next')}
            rightIcon={<ChevronRight className="h-4 w-4" />}
          >
            Next
          </Button>
        </div>
      }
    >
      <div className="card-elevated overflow-hidden p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl border border-amber-200/70 bg-amber-50/85 p-3 text-amber-700 dark:border-amber-300/15 dark:bg-amber-400/10 dark:text-amber-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-[1.95rem] leading-tight text-slate-900 dark:text-white">
                Category rail
              </h3>
              <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                Swipe on mobile or use the controls to move through collections with snap-based scrolling.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center rounded-full border border-amber-200/70 bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-800 shadow-[0_12px_30px_rgba(18,12,7,0.06)] dark:border-amber-300/10 dark:bg-[#120f0c]/80 dark:text-amber-200">
            Mobile-first discovery
          </div>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-5 bg-gradient-to-r from-[rgba(250,245,236,0.96)] to-transparent dark:from-[rgba(12,10,8,0.98)] sm:hidden" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-7 bg-gradient-to-l from-[rgba(250,245,236,0.98)] via-[rgba(250,245,236,0.72)] to-transparent dark:from-[rgba(12,10,8,0.98)] dark:via-[rgba(12,10,8,0.72)] sm:hidden" />

          <div
            ref={railRef}
            className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-3 pt-1 scroll-px-1"
          >
            {CATEGORY_SPOTLIGHTS.map((category) => (
              <div
                key={category.key}
                className="min-w-[calc(100%-1.15rem)] max-w-[20rem] snap-start sm:min-w-[24rem] lg:min-w-[21rem] xl:min-w-[22rem]"
              >
                <EditorialImageCard
                  href={category.href}
                  image={category.image}
                  alt={category.alt}
                  eyebrow="Collection"
                  title={category.title}
                  description={category.description}
                  ctaLabel="Open collection"
                  aspect="portrait"
                  className="h-full"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 rounded-[22px] border border-amber-100/70 bg-white/70 px-4 py-3 text-xs font-medium text-slate-600 shadow-[0_10px_24px_rgba(18,12,7,0.04)] dark:border-amber-300/10 dark:bg-[#120f0c]/72 dark:text-slate-300 sm:hidden">
          <span>Swipe horizontally to explore collections</span>
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-800 dark:bg-amber-400/10 dark:text-amber-200">
            Touch rail
          </span>
        </div>
      </div>
    </Section>
  );
}
