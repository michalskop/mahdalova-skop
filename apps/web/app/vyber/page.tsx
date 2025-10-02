// app/vyber/page.tsx
import { getArticles } from '@/components/common/getArticles';
import { ArticlesSection } from '@/components/common/ArticlesSection';
import { Container } from '@mantine/core';
import SubscribeNewsletter from '@/components/common/SubscribeNewsletter';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Výběr',
  description: 'Výběr článků Mahdalová & Śkop – všechno, co by vám nemělo uniknout.',
  alternates: {
    canonical: '/vyber',
  },
  openGraph: {
    title: 'Výběr',
    description: 'Výběr článků Mahdalová & Śkop – všechno, co by vám nemělo uniknout.',
    url: '/vyber',
    type: 'website',
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
