'use client';
import { ArticlesSection as _ArticlesSection } from '@repo/ui/components/ArticlesSection';
import type { Article } from '@repo/ui/lib/getArticles';

interface ArticlesSectionProps {
  sectionTitle: string;
  sectionLink?: string;
  articles: Article[];
  themeColor?: string;
}

export function ArticlesSection(props: ArticlesSectionProps) {
  return <_ArticlesSection {...props} articleBasePath="/a" locale="en-US" />;
}
