// app/vyber/page.tsx
import { getArticles } from '@/components/common/getArticles';
import { ArticlesSection } from '@/components/common/ArticlesSection';
import { Container } from '@mantine/core';
import SubscribeNewsletter from '@/components/common/SubscribeNewsletter';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Výběr',
  description: 'Výběr článků Mahdalová & Śkop – všechno, co by vám nemělo uniknout.',
  icons: {
    icon: [{ url: '/favicon.svg' }],
    apple: [{ url: '/favicon.svg' }],
  },
  metadataBase: new URL('https://www.mahdalova-skop.cz/'),
  alternates: {
    canonical: '/vyber',
  },
  openGraph: {
    title: 'Výběr',
    description: 'Výběr článků Mahdalová & Śkop – všechno, co by vám nemělo uniknout.',
    url: '/vyber',
    siteName: 'Mahdalová & Śkop - výběr',
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
};


export default async function VyberPage() {
  // Fetch a large number to effectively show all published articles
  const articles = await getArticles(1000);

  return (
    <Container 
      size="lg" 
      // py="xl"
      bg="background.2"
      maw="1200px"
      w="100%"
      p={0}
      m="0 auto"
    >
      <ArticlesSection 
        sectionTitle="Výběr"
        articles={articles}
        themeColor="brandRoyalBlue.3"
      />

      <SubscribeNewsletter actionUrl='https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088'/>
    </Container>
  );
}
