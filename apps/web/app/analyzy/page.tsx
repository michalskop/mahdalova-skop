// app/analyzy/page.tsx
import { getArticles } from '@/components/common/getArticles';
import { ArticlesSection } from '@/components/common/ArticlesSection';
import { Container } from '@mantine/core';
import SubscribeNewsletter from '@/components/common/SubscribeNewsletter';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analýzy',
  description: 'Analytické články Mahdalová & Śkop – hlubší pohled do dat a souvislostí.',
  alternates: {
    canonical: '/analyzy',
  },
  openGraph: {
    title: 'Analýzy',
    description: 'Analytické články Mahdalová & Śkop – hlubší pohled do dat a souvislostí.',
    url: '/analyzy',
    type: 'website',
  },
};

export default async function ArticlesPage() {
  const articles = await getArticles(100, "analýza");
  
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
      <>
        <ArticlesSection 
          sectionTitle="Analýzy"
          articles={articles}
          themeColor="brand"
        />
        
        <SubscribeNewsletter actionUrl='https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088'/>
      </>
    </Container>
  );
}