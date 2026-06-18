// app/specialy/data-pro-budouci-premierku/02-demografie/03-svet-populace/page.tsx
import { getArticleBySlug } from '@/lib/articles';
import { ArticleRenderer } from '@/components/clanek/ArticleRenderer';
import type { Metadata } from 'next';

const SLUG = 'data-pro-budouci-premierku-02-demografie-svet-populace';

export async function generateMetadata(): Promise<Metadata> {
  const article = await getArticleBySlug(SLUG);
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: '/specialy/data-pro-budouci-premierku/02-demografie/03-svet-populace' },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: '/specialy/data-pro-budouci-premierku/02-demografie/03-svet-populace',
      type: 'article',
    },
  };
}

export default async function SvetPopulacePage() {
  const article = await getArticleBySlug(SLUG);
  return <ArticleRenderer {...article} slug={SLUG} />;
}
