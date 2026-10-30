// app/tag/[slug]/page.tsx
import { getArticles } from '@/components/common/getArticles';
import { ArticlesSection } from '@/components/common/ArticlesSection';
import { Container } from '@mantine/core';
import { normalizeTag } from '@/utils/tagUtils';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    alternates: {
      canonical: `/tag/${params.slug}`,
    },
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
        {/* Elections get the same red band as on the homepage; other tags stay
            blue. Heading with a capital first letter (as on DataTimes.cz). */}
        <ArticlesSection
          sectionTitle={originalTag.charAt(0).toUpperCase() + originalTag.slice(1)}
          articles={articles}
          themeColor={slug === 'elections' ? 'brand' : 'brandRoyalBlue.3'}
        />
      </>
    </Container>
  );
}
