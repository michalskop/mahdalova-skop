// app/page.tsx
// 'use client';

import { Container, Title, Text } from '@mantine/core';
import { getArticles } from '@/components/common/getArticles';
import { ArticlesGrid } from '@/components/common/ArticlesGrid';
import Testimonials from '@/components/common/Testimonials';
import HeroTitle from '@/components/frontpage/HeroTitle';
import Citation from '@/components/frontpage/Citation';
import SubscribeHH from '@/components/frontpage/SubscribeHH';
import SubscribeNewsletter from '@/components/common/SubscribeNewsletter';
// import { ContactsBlock } from '@/components/common/ContactsBlock';

export default async function HomePage() {
  const articles = await getArticles(3);

  return (
    <Container 
      size="lg" 
      // py="xl"
      bg="background.2"
      maw="1200px"
      w="100%"
      p="xl md"
      m="0 auto"
    >
      <HeroTitle />

      <Citation />

      <SubscribeHH />

      <ArticlesGrid articles={articles} />

      <SubscribeNewsletter actionUrl='https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088'/>

      <Testimonials />

      {/* <ContactsBlock /> */}
    </Container>
  );
}