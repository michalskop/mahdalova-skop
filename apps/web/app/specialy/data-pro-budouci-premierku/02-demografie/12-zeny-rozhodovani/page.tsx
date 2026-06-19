import { getArticleBySlug } from '@/lib/articles';
import { ArticleRenderer } from '@/components/clanek/ArticleRenderer';
import type { Metadata } from 'next';

const SLUG = 'data-pro-budouci-premierku-02-demografie-12-zeny-rozhodovani';

export async function generateMetadata(): Promise<Metadata> {
  const article = await getArticleBySlug(SLUG);
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: '/specialy/data-pro-budouci-premierku/02-demografie/12-zeny-rozhodovani' },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: '/specialy/data-pro-budouci-premierku/02-demografie/12-zeny-rozhodovani',
      type: 'article',
    },
  };
}

export default async function ZenyRozhodovaniPage() {
  const article = await getArticleBySlug(SLUG);
  return <ArticleRenderer {...article} slug={SLUG} />;
}
