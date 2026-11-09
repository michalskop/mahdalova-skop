// lib/articles.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import { getArticles } from '@/components/common/getArticles';
import { ARTICLE_MDX_OPTIONS, loadArticleData, rankRelatedPool } from './articleData';

// Načítání dat a pluginy Markdownu jsou v lib/articleData.ts – sdílí je náhled konceptu v hubu (app/nahled).

const articlesDirectory = path.join(process.cwd(), 'app/clanek/_articles');

export async function getArticleBySlug(directorySlug: string) {
  const articleDir = path.join(articlesDirectory, directorySlug);
  const fullPath = path.join(articleDir, 'index.md');

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Article ${directorySlug} not found`);
  }

  // Read the main article content
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  const readFile = async (rel: string) => {
    const p = path.join(articleDir, rel);
    return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
  };
  const { htmlContent, scrollyContent, scope } = await loadArticleData(content, data, readFile, directorySlug);

  // Pre-fetch article pool for RelatedArticles MDX component
  // Pořadí podle příbuznosti: nejvíc společných tagů s tímto článkem první, jinak původní pořadí (stabilní řazení).
  // Z čela poolu bere RelatedArticles automatický výběr i doplnění dolního boxu na násobek tří.
  const relatedArticlesPool = await getArticles(9999, undefined, true);
  const filteredPool = rankRelatedPool(relatedArticlesPool, directorySlug, data.tags || []);

  const mdxSource = await serialize(content, {
    scope: { ...scope, relatedArticlesPool: filteredPool },
    mdxOptions: ARTICLE_MDX_OPTIONS,
  });

  // Use the directory name as the slug
  return {
    slug: directorySlug,
    mdxSource,
    scrollyContent,
    htmlContent,
    tags: data.tags || [],
    content,
    title: data.title || 'Untitled',
    date: data.date || '',
    author: data.author || 'Anonymous',
    translator: data.translator || '',
    excerpt: data.excerpt || '',
    coverImage: data.coverImage || null,
    ogImage: data.ogImage || null,
  };
}
