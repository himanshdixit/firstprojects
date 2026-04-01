'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import Card from './Card';
import { cn } from './styles';
import { getBrandBlurDataUrl } from '@/lib/imagePlaceholders';

const aspectClasses = {
  wide: 'aspect-[16/9]',
  landscape: 'aspect-[5/4]',
  portrait: 'aspect-[4/5]',
  square: 'aspect-square',
};

export default function EditorialImageCard({
  href,
  image,
  alt,
  eyebrow,
  title,
  description,
  ctaLabel = 'Explore',
  aspect = 'landscape',
  className = '',
  priority = false,
}) {
  const Wrapper = href ? Link : 'div';
  const wrapperProps = href ? { href } : {};

  return (
    <Wrapper {...wrapperProps} className="group block h-full">
      <Card
        variant="blog"
        className={cn(
          'h-full overflow-hidden border border-white/60 bg-[linear-gradient(180deg,rgba(255,252,247,0.96),rgba(248,241,231,0.88))] p-3 dark:border-amber-300/10 dark:bg-[linear-gradient(180deg,rgba(18,14,11,0.96),rgba(10,8,6,0.92))]',
          className
        )}
      >
        <div className={cn('relative overflow-hidden rounded-[24px]', aspectClasses[aspect] || aspectClasses.landscape)}>
          <Image
            src={image}
            alt={alt}
            fill
            priority={priority}
            quality={70}
            placeholder="blur"
            blurDataURL={getBrandBlurDataUrl('light')}
            sizes={
              aspect === 'wide'
                ? '(max-width: 1024px) 100vw, 50vw'
                : aspect === 'portrait'
                  ? '(max-width: 768px) 100vw, 33vw'
                  : '(max-width: 768px) 100vw, 25vw'
            }
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,8,5,0.06),rgba(12,8,5,0.14))]" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
        </div>

        <div className="space-y-3 px-2 pb-2 pt-4">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <div>
            <h3 className="text-[1.95rem] leading-tight text-slate-900 transition-colors group-hover:text-amber-700 dark:text-white dark:group-hover:text-amber-300">
              {title}
            </h3>
            {description ? (
              <p className="editorial-copy mt-3 line-clamp-3 text-sm">
                {description}
              </p>
            ) : null}
          </div>

          {href ? (
            <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 transition-transform duration-200 ease-out group-hover:translate-x-0.5 dark:text-amber-300">
              {ctaLabel}
              <ArrowUpRight className="h-4 w-4" />
            </div>
          ) : null}
        </div>
      </Card>
    </Wrapper>
  );
}
