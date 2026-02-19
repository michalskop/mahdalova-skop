'use client';
import { ArticlesGrid as _ArticlesGrid } from '@repo/ui/components/ArticlesGrid';
import type { Article } from '@repo/ui/lib/getArticles';

export type { Article } from '@repo/ui/lib/getArticles';

interface ArticlesGridProps {
  articles: Article[];
}

export function ArticlesGrid({ articles }: ArticlesGridProps) {
  return <_ArticlesGrid articles={articles} articleBasePath="/a" locale="en-US" />;
}
