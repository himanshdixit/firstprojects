'use client';

import { motion } from 'framer-motion';
import PostFeed from '@/components/post/PostFeed';
import { FadeIn } from '@/components/ui/Motion';
import { HERO_IMAGE } from '@/lib/media';

export default function HomePage() {
  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24 }}
        className="card-surface relative overflow-hidden p-6 sm:p-8"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_IMAGE}
          alt="Editorial inspiration"
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/55 dark:from-slate-900/85 dark:to-slate-900/55" />
        <div className="relative z-10">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">Editorial Platform</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Write. Publish. Scale your stories.</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
          A modern, role-based blogging UI with robust workflows for creators and admins.
        </p>
        </div>
      </motion.section>

      <FadeIn delay={0.08}>
        <PostFeed />
      </FadeIn>
    </div>
  );
}
