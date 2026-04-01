import HomePageContent from '@/components/home/HomePageContent';
import { absoluteUrl } from '@/lib/seo';
import { HERO_SLIDES } from '@/lib/siteImages';

export const metadata = {
  title: 'Home',
  description: 'Discover elegant long-form stories, journals, and editorial essays on DraftSphere.',
  alternates: {
    canonical: absoluteUrl('/'),
  },
  openGraph: {
    title: 'DraftSphere',
    description: 'Discover elegant long-form stories, journals, and editorial essays on DraftSphere.',
    type: 'website',
    url: absoluteUrl('/'),
    images: [
      {
        url: HERO_SLIDES[0].image,
        width: 1800,
        height: 1200,
        alt: HERO_SLIDES[0].alt,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DraftSphere',
    description: 'Discover elegant long-form stories, journals, and editorial essays on DraftSphere.',
    images: [HERO_SLIDES[0].image],
  },
};

export default function HomePage() {
  return <HomePageContent />;
}
