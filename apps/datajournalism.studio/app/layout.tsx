// app/layout.tsx
import "@mantine/core/styles.css";
import "./charts.css";
import "./globals.css";
import { robotoCondensed, robotoSlab } from "./fonts";
import { ColorSchemeScript } from '@mantine/core';
import Layout from '@/components/Layout';
import { ThemeProvider } from './providers/ThemeProvider';
import type { Metadata } from 'next';
import { MatomoAnalytics } from '@/components/common/MatomoAnalytics';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: {
    default: 'Data Journalism Studio',
    template: '%s | Data Journalism Studio',
  },
  description: 'We make data talk. Stories hidden in data - unique data and context journalism.',
  icons: {
    icon: [{ url: '/favicon.svg' }],
    apple: [{ url: '/favicon.svg' }],
  },
  metadataBase: new URL('https://www.datajournalism.studio/'),
  openGraph: {
    title: 'Data Journalism Studio',
    description: 'We make data talk. Stories hidden in data - unique data and context journalism.',
    url: 'https://www.datajournalism.studio/',
    siteName: 'Data Journalism Studio',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Data Journalism Studio',
      }
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Data Journalism Studio',
    description: 'We make data talk. Stories hidden in data - unique data and context journalism.',
    images: ['/images/twitter-image.png'],
    creator: '@data_zurnalist',
  },
  robots: {
    index: true,
    follow: true,
    // Google Discover shows a large image only with max-image-preview:large.
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
  // No site-wide canonical: each page sets its own (a root canonical would
  // point every page at the homepage).
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Data Journalism Studio"
          href="/rss.xml"
        />
        <Suspense fallback={null}>
          <MatomoAnalytics />
        </Suspense>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body className={`${robotoSlab.variable} ${robotoCondensed.variable}`} style={{ backgroundColor: '#fdfbf7' }}>
        <ThemeProvider>
          <Layout>
            {children}
          </Layout>
        </ThemeProvider>
      </body>
    </html>
  );
}
