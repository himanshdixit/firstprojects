'use client';

import dynamic from 'next/dynamic';
import PostCardSkeleton from '@/components/post/PostCardSkeleton';
import HeroCarousel from '@/components/home/HeroCarousel';
import FeaturedEditorialSection from '@/components/home/FeaturedEditorialSection';
import CategorySpotlightSection from '@/components/home/CategorySpotlightSection';
import AboutPreviewSection from '@/components/home/AboutPreviewSection';

function FeedFallback() {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
      <PostCardSkeleton />
      <div className="grid gap-5">
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    </div>
  );
}

const PostFeed = dynamic(() => import('@/components/post/PostFeed'), {
  loading: () => <FeedFallback />,
});

export default function HomePageContent() {
  return (
    <div className="space-y-8">
      <HeroCarousel />
      <FeaturedEditorialSection />
      <CategorySpotlightSection />
      <AboutPreviewSection />
      <PostFeed />
    </div>
  );
}
