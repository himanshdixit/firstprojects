import './globals.css';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import AppShell from '@/components/layout/AppShell';
import Providers from '@/components/layout/Providers';
import JsonLd from '@/components/seo/JsonLd';
import {
  absoluteUrl,
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
  getSiteUrl,
} from '@/lib/seo';

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
});

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  preload: true,
  weight: ['400', '500', '600', '700'],
});

export const metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: 'DraftSphere',
    template: '%s | DraftSphere',
  },
  description: 'DraftSphere is a premium editorial platform for thoughtful publishing, polished storytelling, and modern creator workflows.',
  icons: {
    icon: '/draftsphere-logo.png',
    shortcut: '/draftsphere-logo.png',
    apple: '/draftsphere-logo.png',
  },
  alternates: {
    canonical: absoluteUrl('/'),
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'DraftSphere',
    description: 'DraftSphere is a premium editorial platform for thoughtful publishing, polished storytelling, and modern creator workflows.',
    type: 'website',
    url: absoluteUrl('/'),
    siteName: 'DraftSphere',
    images: [
      {
        url: absoluteUrl('/draftsphere-logo.png'),
        width: 1200,
        height: 630,
        alt: 'DraftSphere',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DraftSphere',
    description: 'DraftSphere is a premium editorial platform for thoughtful publishing, polished storytelling, and modern creator workflows.',
    images: [absoluteUrl('/draftsphere-logo.png')],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${serif.variable}`}>
        <JsonLd data={[buildWebsiteJsonLd(), buildOrganizationJsonLd()]} />
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
