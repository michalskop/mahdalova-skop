// app/clanek/page.tsx
import { getArticles } from '@/components/common/getArticles';
import { ArticlesSection } from '@/components/common/ArticlesSection';
import { Container } from '@mantine/core';

export default async function ArticlesPage() {
  const articles = await getArticles(100, "kontext");
  
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
        sectionTitle="Kontext"
        articles={articles}
        themeColor="brandOrange.4"
      />
    </Container>
  );
}