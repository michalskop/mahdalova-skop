// types/article.ts
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import type { ScrollyContent } from './scrolly';

export interface ArticleProps {
  mdxSource: MDXRemoteSerializeResult;
  slug?: string;
  scrollyContent?: ScrollyContent | null;
  title?: string;
  date?: string;
  tags?: string[];
  content?: string;
  author?: string;
  excerpt?: string;
  coverImage?: string | null;
  backgroundColor?: string;
  textColor?: string;
  withContainer?: boolean;
}