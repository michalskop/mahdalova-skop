// app/podcasty/page.tsx
import { getArticles } from '@/components/common/getArticles';
import { ArticlesSection } from '@/components/common/ArticlesSection';
import { Container } from '@mantine/core';
import SubscribeNewsletter from '@/components/common/SubscribeNewsletter';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Podcasty',
  description: 'Podcasty Mahdalová & Śkop – rozhovory a vysvětlení v audio/video formátu.',
  alternates: {
    canonical: '/podcasty',
  },
  openGraph: {
    title: 'Podcasty',
    description: 'Podcasty Mahdalová & Śkop – rozhovory a vysvětlení v audio/video formátu.',
    url: '/podcasty',
    type: 'website',
  },
};

export default async function PodcastyPage() {
  const articles = await getArticles(100, 'podcast');

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
      <ArticlesSection sectionTitle="Podcasty" articles={articles} themeColor="brandRoyalBlue.9" />

      <SubscribeNewsletter actionUrl='https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088'/>
    </Container>
  );
}
