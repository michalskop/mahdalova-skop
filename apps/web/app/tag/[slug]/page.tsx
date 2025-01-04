// app/tag/[slug]/page.tsx
import { getArticles } from '@/components/common/getArticles';
import { ArticlesSection } from '@/components/common/ArticlesSection';
import { Container } from '@mantine/core';
import SubscribeNewsletter from '@/components/common/SubscribeNewsletter';
import { getAllTags, normalizeTag } from '@/utils/tagUtils';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    slug: string;
  };
}

// This must be a named export
export async function generateStaticParams() {
  const tagMap = await getAllTags();
  const tags = Array.from(tagMap.keys());
  console.log('Generated static paths for tags:', tags);
  return tags.map((tag) => ({ slug: tag }));
}

// Default export for the page component
export default async function Page({ params }: PageProps) {
  const { slug } = params;
  
  const tagMap = await getAllTags();
  const originalTag = tagMap.get(slug);

  if (!originalTag) {
    notFound();
  }

  const allArticles = await getArticles(100);
  const articles = allArticles.filter(article => 
    article.tags?.some(tag => normalizeTag(tag) === slug)
  );

  if (!articles || articles.length === 0) {
    notFound();
  }

  return (
    <Container 
      size="lg"
      maw="1200px"
      w="100%"
      p={0}
      m="0 auto"
    >
      <>
        <ArticlesSection
          sectionTitle={`Články s tagem "${originalTag}"`}
          articles={articles}
          themeColor="brand"
        />
        <SubscribeNewsletter 
          actionUrl='https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088'
        />
      </>
    </Container>
  );
}