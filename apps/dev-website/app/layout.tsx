// app/layout.tsx
import "@mantine/core/styles.css";
import { ColorSchemeScript } from '@mantine/core';
import Layout from '@/components/Layout';
import { ThemeProvider } from './providers/ThemeProvider';
import type { Metadata } from 'next';
import { MatomoAnalytics } from '@/components/common/MatomoAnalytics';

export const metadata: Metadata = {
  title: {
    default: 'Mahdalová & Śkop',
    template: '%s | Mahdalová & Śkop',
  },
  description: 'Příběhy ukryté v datech - unikátní datová a kontextová žurnalistika.',
  icons: {
    icon: [{ url: '/favicon.svg' }],
    apple: [{ url: '/favicon.svg' }],
  },
  metadataBase: new URL('https://www.mahdalova-skop.cz/'),
  openGraph: {
    title: 'Mahdalová & Škop',
    description: 'Příběhy ukryté v datech - unikátní datová a kontextová žurnalistika.',
    url: 'https://www.mahdalova-skop.cz/',
    siteName: 'Mahdalová & Śkop',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Mahdalová & Śkop',
      }
    ],
    locale: 'cs_CZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mahdalová & Škop',
    description: 'Příběhy ukryté v datech - unikátní datová a kontextová žurnalistika.',
    images: ['/images/twitter-image.png'],
    creator: '@data_zurnalist',
  },
  robots: {
    index: true,
    follow: true
  },
  alternates: {
    canonical: 'https://www.mahdalova-skop.cz/',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <head>
        <MatomoAnalytics />
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <ThemeProvider>
          <Layout>
            {children}
          </Layout>
        </ThemeProvider>
      </body>
    </html>
  );
}
