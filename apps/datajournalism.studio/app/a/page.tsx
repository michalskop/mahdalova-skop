// app/a/page.tsx
import { getArticles } from '@/components/common/getArticles';
import { ArticlesGrid } from '@/components/common/ArticlesGrid';

export default async function ArticlesPage() {
  const articles = await getArticles();
  
  return <ArticlesGrid articles={articles} />;
}