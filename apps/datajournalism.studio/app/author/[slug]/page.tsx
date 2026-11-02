// app/author/[slug]/page.tsx
import { getArticles } from '@/components/common/getArticles';
import { ArticlesSection } from '@/components/common/ArticlesSection';
import { Container } from '@mantine/core';
import AuthorProfileCard from '@/components/common/AuthorProfileCard';
import { getAllAuthors } from '@/utils/authorServerUtils';
import { normalizeAuthor, splitAuthors } from '@/utils/authorUtils';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const authorMap = await getAllAuthors();
  const authorName = authorMap.get(params.slug);

  if (!authorName) {
    return {};
  }

  const description = `Articles by ${authorName} on Data Journalism Studio.`;

  return {
    title: authorName,
    description,
    alternates: {
      canonical: `/author/${params.slug}`,
    },
    openGraph: {
      title: authorName,
      description,
      url: `/author/${params.slug}`,
      type: 'profile',
    },
  };
}

export async function generateStaticParams() {
  const articles = await getArticles(Number.POSITIVE_INFINITY);
  const authors = Array.from(
    new Set(
      articles.flatMap((article) =>
        splitAuthors(article.author).map((author) => normalizeAuthor(author)).filter(Boolean)
      )
    )
  );
  return authors.map((author) => ({ slug: author }));
}

export default async function Page({ params }: PageProps) {
  const { slug } = params;

  const authorMap = await getAllAuthors();
  const originalAuthor = authorMap.get(slug);

  if (!originalAuthor) {
    notFound();
  }

  const allArticles = await getArticles(Number.POSITIVE_INFINITY);
  const articles = allArticles.filter((article) =>
    splitAuthors(article.author).some((a) => normalizeAuthor(a) === slug)
  );

  if (!articles || articles.length === 0) {
    notFound();
  }

  return (
    <Container size="lg" maw="1200px" w="100%" p={0} m="0 auto">
      <>
        <AuthorProfileCard name={originalAuthor} />
        {/* The person card above already carries the name, so the section
            heading is a neutral "Articles". */}
        <ArticlesSection sectionTitle="Articles" articles={articles} themeColor="brandRoyalBlue.3" />
      </>
    </Container>
  );
}
