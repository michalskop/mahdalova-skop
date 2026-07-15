// app/tag/[slug]/page.tsx
import { getArticles } from '@/components/common/getArticles';
import { ArticlesSection } from '@/components/common/ArticlesSection';
import { Container } from '@mantine/core';
import SubscribeNewsletter from '@/components/common/SubscribeNewsletter';
import { normalizeTag } from '@/utils/tagUtils';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    slug: string;
  };
}

// This must be a named export
export async function generateStaticParams() {
  const articles = await getArticles(Number.POSITIVE_INFINITY);
  const tags = Array.from(
    new Set(
      articles.flatMap((article) =>
        article.tags?.map((tag) => normalizeTag(tag)).filter(Boolean) ?? []
      )
    )
  );
  console.log('Generated static paths for tags:', tags);
  return tags.map((tag) => ({ slug: tag }));
}

// Default export for the page component
export default async function Page({ params }: PageProps) {
  const { slug } = params;
  
  const allArticles = await getArticles(Number.POSITIVE_INFINITY);
  const originalTag = allArticles
    .flatMap((article) => article.tags ?? [])
    .find((tag) => normalizeTag(tag) === slug);
  const articles = allArticles.filter(article => 
    article.tags?.some(tag => normalizeTag(tag) === slug)
  );

  if (!originalTag || !articles || articles.length === 0) {
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
          sectionTitle={`${originalTag}`}
          articles={articles}
          themeColor="brandRoyalBlue.3"
        />
        <SubscribeNewsletter 
          actionUrl='https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088'
        />
      </>
    </Container>
  );
}
