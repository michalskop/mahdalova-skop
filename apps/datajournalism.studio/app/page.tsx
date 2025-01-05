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
  // const articles = await getArticles(3, undefined, true);
  const articles_featured = await getArticles(3, "work", true);
  const articles_blog = await getArticles(3, "blog");

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
{/* 
      <ArticlesSection 
        sectionTitle="Výběr"
        articles={articles}
        themeColor="brandRoyalBlue.3" /> */}

      {/* <SubscribeNewsletter actionUrl='https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088'/> */}

      <ArticlesSection 
        sectionTitle="Featured Work"
        sectionLink="/work"
        articles={articles_featured}
        themeColor="brand" />

      <ArticlesSection 
        sectionTitle="Articles"
        sectionLink="/blog"
        articles={articles_blog}
        themeColor="brandOrange.4" />

      <Testimonials />

      {/* <ContactsBlock /> */}
    </Container>
  );
}