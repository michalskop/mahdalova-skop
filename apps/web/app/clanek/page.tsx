// app/clanek/page.tsx
import { getArticles } from '@/components/common/getArticles';
import { ArticlesGrid } from '@/components/common/ArticlesGrid';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: '/clanek',
  },
};

export default async function ArticlesPage() {
  const articles = await getArticles();
  
  return <ArticlesGrid articles={articles} />;
}
