// app/context/page.tsx – analyses, explainers and comment (frontmatter filter "blog")
import { getArticles } from '@/components/common/getArticles';
import { ArticlesSection } from '@/components/common/ArticlesSection';
import { Container } from '@mantine/core';
// import SubscribeNewsletter from '@/components/common/SubscribeNewsletter';

export const metadata = { title: "Context" };

export default async function ArticlesPage() {
  const articles = await getArticles(100, "blog");
  
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
        sectionTitle="Context"
        articles={articles}
        themeColor="brandOrange.4"
      />
      
      {/* <SubscribeNewsletter actionUrl='https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088'/> */}
    </Container>
  );
}