import Link from 'next/link';
import Image from 'next/image';
import Container from '@/components/ui/Container';

export default function Footer() {
  return (
    <footer className="pb-10 pt-4">
      <Container>
        <div className="card-surface flex flex-col gap-4 px-6 py-5 text-sm text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="relative h-11 w-11 overflow-hidden rounded-2xl">
              <Image src="/draftsphere-logo.png" alt="DraftSphere logo" fill sizes="44px" className="object-contain" />
            </span>
            <div>
              <p className="font-display text-[1.7rem] leading-none text-slate-800 dark:text-slate-100">DraftSphere</p>
              <p className="mt-1">A premium editorial workspace for journals, stories, and polished publishing operations.</p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
              <Link href="/" className="transition hover:text-amber-700 dark:hover:text-amber-300">Explore</Link>
              <Link href="/about" className="transition hover:text-amber-700 dark:hover:text-amber-300">About</Link>
              <Link href="/contact" className="transition hover:text-amber-700 dark:hover:text-amber-300">Contact</Link>
            </div>
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--brand)]">Luxury Storytelling System</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
