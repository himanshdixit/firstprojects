import ContactExperience from '@/components/contact/ContactExperience';
import { CONTACT_VISUAL } from '@/lib/siteImages';
import { absoluteUrl } from '@/lib/seo';

export const metadata = {
  title: 'Contact',
  description:
    'Get in touch with DraftSphere for editorial, product, collaboration, or publishing conversations.',
  alternates: {
    canonical: absoluteUrl('/contact'),
  },
  openGraph: {
    title: 'Contact DraftSphere',
    description:
      'Reach out for editorial, product, collaboration, or publishing conversations.',
    type: 'website',
    url: absoluteUrl('/contact'),
    images: [
      {
        url: CONTACT_VISUAL.image,
        width: 1600,
        height: 1200,
        alt: CONTACT_VISUAL.alt,
      },
    ],
  },
};

export default function ContactPage() {
  return <ContactExperience />;
}
