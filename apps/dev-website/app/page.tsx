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
import { FeaturedArticlesSection } from '@/components/frontpage/FeaturedArticlesSection';
// import { ContactsBlock } from '@/components/common/ContactsBlock';

export default async function HomePage() {
  const articles = await getArticles(3);
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

      <FeaturedArticlesSection 
        sectionTitle="Výběr"
        articles={articles}
        themeColor="brandRoyalBlue.3" />

      <SubscribeNewsletter actionUrl='https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088'/>

      <FeaturedArticlesSection 
        sectionTitle="Analýzy"
        articles={articles_analyses}
        themeColor="brand" />

      <FeaturedArticlesSection 
        sectionTitle="Kontext"
        articles={articles_contexts}
        themeColor="brandOrange.4" />

      <Testimonials />

      {/* <ContactsBlock /> */}
    </Container>
  );
}