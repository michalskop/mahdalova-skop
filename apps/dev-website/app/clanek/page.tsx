// app/clanek/page.tsx
import { getArticles } from './getArticles';
import { ArticlesGrid } from './ArticlesGrid';

export default async function ArticlesPage() {
  const articles = await getArticles();
  
  return <ArticlesGrid articles={articles} />;
}