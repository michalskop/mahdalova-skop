'use client';
import type { ComponentProps } from 'react';
import { ArticlesSection as _ArticlesSection } from '@repo/ui/components/ArticlesSection';

type ArticlesSectionProps = Omit<ComponentProps<typeof _ArticlesSection>, 'articleBasePath'> & {
  articleBasePath?: string;
};

// DJS wrapper: article links go to /a/<slug>, dates in British English.
export function ArticlesSection(props: ArticlesSectionProps) {
  return <_ArticlesSection articleBasePath="/a" locale="en-GB" {...props} />;
}
