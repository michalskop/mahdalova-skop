// app/clanek/[slug]/page.tsx
import { getArticleBySlug } from '@/lib/articles';
import { ArticleRenderer } from '@/components/clanek/ArticleRenderer';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function ArticlePage({ params }: PageProps) {
  try {
    const article = await getArticleBySlug(params.slug);
    return <ArticleRenderer {...article} />;
  } catch (error) {
    console.error('Error in ArticlePage:', error);
    notFound();
  }
}