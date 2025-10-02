// app/page.tsx
// 'use client';

import { Container } from '@mantine/core';
import { getArticles } from '@/components/common/getArticles';
// import { ArticlesGrid } from '@/components/common/ArticlesGrid';
import Testimonials from '@/components/common/Testimonials';
import HeroTitle from '@/components/frontpage/HeroTitle';
// import Citation from '@/components/frontpage/Citation';
// import SubscribeHH from '@/components/frontpage/SubscribeHH';
import SubscribeNewsletter from '@/components/common/SubscribeNewsletter';
import { ArticlesSection } from '@/components/common/ArticlesSection';
// import { ContactsBlock } from '@/components/common/ContactsBlock';

export default async function HomePage() {
  const articles = await getArticles(3, undefined, true);
  const articles_analyses = await getArticles(3, "analýza");
  const articles_contexts = await getArticles(3, "kontext");

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
      <HeroTitle />

      {/* <Citation /> */}

      {/* <SubscribeHH /> */}

      <ArticlesSection 
        sectionTitle="Výběr"
        sectionLink="/vyber"
        articles={articles}
        themeColor="brandRoyalBlue.3" />

      <SubscribeNewsletter actionUrl='https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088'/>

      <ArticlesSection 
        sectionTitle="Analýzy"
        sectionLink="/analyzy"
        articles={articles_analyses}
        themeColor="brand" />

      <ArticlesSection 
        sectionTitle="Kontext"
        sectionLink="/kontext"
        articles={articles_contexts}
        themeColor="brandOrange.4" />

      <Testimonials />

      {/* <ContactsBlock /> */}
    </Container>
  );
}