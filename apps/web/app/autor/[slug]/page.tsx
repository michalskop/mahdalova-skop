// app/autor/[slug]/page.tsx
import { getArticles } from '@/components/common/getArticles';
import { ArticlesSection } from '@/components/common/ArticlesSection';
import { Container } from '@mantine/core';
import SubscribeNewsletter from '@/components/common/SubscribeNewsletter';
import { getAllAuthors } from '@/utils/authorServerUtils';
import { normalizeAuthor, splitAuthors } from '@/utils/authorUtils';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const authorMap = await getAllAuthors();
  const authors = Array.from(authorMap.keys());
  console.log('Generated static paths for authors:', authors);
  return authors.map((author) => ({ slug: author }));
}

export default async function Page({ params }: PageProps) {
  const { slug } = params;

  const authorMap = await getAllAuthors();
  const originalAuthor = authorMap.get(slug);

  if (!originalAuthor) {
    notFound();
  }

  const allArticles = await getArticles(100);
  const articles = allArticles.filter((article) =>
    splitAuthors(article.author).some((a) => normalizeAuthor(a) === slug)
  );

  if (!articles || articles.length === 0) {
    notFound();
  }

  return (
    <Container size="lg" maw="1200px" w="100%" p={0} m="0 auto">
      <>
        <ArticlesSection sectionTitle={`${originalAuthor}`} articles={articles} themeColor="brandRoyalBlue.3" />
        <SubscribeNewsletter actionUrl='https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088' />
      </>
    </Container>
  );
}
