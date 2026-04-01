'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Container from '@/components/ui/Container';
import { HERO_SLIDES } from '@/lib/siteImages';
import { getBrandBlurDataUrl } from '@/lib/imagePlaceholders';

const stats = [
  { label: 'Curated stories', value: '120+' },
  { label: 'Editorial workflows', value: '24/7' },
  { label: 'Private members', value: '8k' },
];

export default function HeroCarousel() {
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion || isPaused || HERO_SLIDES.length <= 1) {
      return undefined;
    }

    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % HERO_SLIDES.length);
    }, 6500);

    return () => clearInterval(timer);
  }, [isPaused, prefersReducedMotion]);

  useEffect(() => {
    if (typeof window === 'undefined' || HERO_SLIDES.length <= 1) {
      return;
    }

    const preloadTargets = [
      HERO_SLIDES[(activeIndex + 1) % HERO_SLIDES.length],
      HERO_SLIDES[(activeIndex + 2) % HERO_SLIDES.length],
    ];

    preloadTargets.forEach((slide) => {
      const image = new window.Image();
      image.src = slide.image;
    });
  }, [activeIndex]);

  const activeSlide = HERO_SLIDES[activeIndex];

  const showSlide = (index) => {
    setActiveIndex(index);
  };

  const goNext = () => {
    setActiveIndex((current) => (current + 1) % HERO_SLIDES.length);
  };

  const goPrev = () => {
    setActiveIndex((current) => (current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  return (
    <section className="pt-2">
      <Container size="wide">
        <div
          className="card-elevated relative overflow-hidden px-5 py-5 sm:px-6 sm:py-6 lg:px-7"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative min-h-[32rem] overflow-hidden rounded-[30px] sm:min-h-[36rem]">
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={activeSlide.id}
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 28 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -24 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src={activeSlide.image}
                  alt={activeSlide.alt}
                  fill
                  priority
                  quality={72}
                  placeholder="blur"
                  blurDataURL={getBrandBlurDataUrl('dark')}
                  sizes="(max-width: 1024px) 100vw, 90vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,5,5,0.9)_0%,rgba(6,5,5,0.74)_42%,rgba(6,5,5,0.36)_100%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,5,5,0.18),rgba(6,5,5,0.4))]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(183,146,87,0.24),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(183,146,87,0.12),transparent_28%)]" />
              </motion.div>
            </AnimatePresence>

            <div className="relative flex min-h-[32rem] flex-col justify-between p-6 sm:min-h-[36rem] sm:p-8 lg:p-10">
              <div className="max-w-3xl">
                <p className="inline-flex rounded-full border border-amber-300/40 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-100 shadow-[0_10px_24px_rgba(0,0,0,0.18)] backdrop-blur">
                  {activeSlide.eyebrow}
                </p>
                <h1 className="mt-5 max-w-3xl text-4xl leading-tight text-white drop-shadow-[0_10px_28px_rgba(0,0,0,0.34)] sm:text-5xl lg:text-6xl">
                  {activeSlide.title}
                </h1>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-white/92 drop-shadow-[0_8px_20px_rgba(0,0,0,0.28)] sm:text-base">
                  {activeSlide.description}
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={activeSlide.ctaHref}
                    className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#8f6b33,#d6b57e_58%,#f2e0bb)] px-5 py-3 text-sm font-semibold text-[#120d08] shadow-[0_16px_36px_rgba(143,107,51,0.34)] transition duration-200 hover:translate-y-[-1px] hover:shadow-[0_20px_42px_rgba(143,107,51,0.4)]"
                  >
                    {activeSlide.ctaLabel}
                  </Link>
                  <Link
                    href="/about"
                    className="inline-flex items-center justify-center rounded-full border border-white/16 bg-black/28 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(0,0,0,0.16)] backdrop-blur transition duration-200 hover:bg-black/38"
                  >
                    Discover the editorial world
                  </Link>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div className="grid gap-3 sm:grid-cols-3">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-[24px] border border-white/12 bg-white/10 px-4 py-4 backdrop-blur"
                    >
                      <p className="text-2xl font-semibold text-white">{stat.value}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-white/65">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <div className="flex items-center gap-2">
                    {HERO_SLIDES.map((slide, index) => (
                      <button
                        key={slide.id}
                        type="button"
                        onClick={() => showSlide(index)}
                        aria-label={`Show slide ${index + 1}`}
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          activeIndex === index ? 'w-9 bg-amber-300' : 'w-2.5 bg-white/45 hover:bg-white/70'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={goPrev}
                      className="rounded-full border border-white/16 bg-white/10 p-2.5 text-white backdrop-blur transition hover:bg-white/16"
                      aria-label="Previous slide"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      className="rounded-full border border-white/16 bg-white/10 p-2.5 text-white backdrop-blur transition hover:bg-white/16"
                      aria-label="Next slide"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
