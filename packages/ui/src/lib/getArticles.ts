// lib/getArticles.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface Article {
  title: string;
  excerpt: string;
  date: string;
  author: string;
  slug: string;
  coverImage: string | null;
  filter?: string | string[];
  tags: string[];
  promoted?: number;
  topic?: string;
  readingTime?: number;
  embedHtml?: string;
  /** Full link override. When set, ArticleCard links here instead of `${articleBasePath}/${slug}`. */
  href?: string;
}

interface ArticleWithScore extends Article {
  promotedScore: number;
}

interface GetArticlesOptions {
  articlesDir: string;
  coverImageBase: string;
  limit?: number;
  filter?: string | string[];
  useExplicitPromotion?: boolean;
  tag?: string;
  /** Pre-built articles from another content source (e.g. a different folder layout), merged in before scoring/sorting. */
  extraArticles?: Article[];
  /** Absolute path to the app's `public/` dir. When set, any local cover image that doesn't exist on disk falls back to null (→ ArticleCard's placeholder) instead of rendering a broken image. */
  publicDir?: string;
}

const isExternalUrl = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('//');
};

export async function getArticles({
  articlesDir,
  coverImageBase,
  limit = 9,
  filter,
  useExplicitPromotion = false,
  tag,
  extraArticles = [],
  publicDir,
}: GetArticlesOptions): Promise<Article[]> {
  const articleFolders = fs.readdirSync(articlesDir);
  const currentDate = new Date();

  function resolveCoverImage(raw: unknown, folder: string): string | null {
    if (!raw || typeof raw !== 'string') return null;
    if (isExternalUrl(raw)) return raw;
    // Convention across the corpus: `coverImage` is always relative to the
    // article's own folder, even when authored with a leading "/" (e.g.
    // "/images/foo.webp" meaning "foo.webp inside this article's images/
    // subfolder"). path.posix.join collapses the resulting double slash.
    const resolved = path.posix.join(coverImageBase, folder, raw);
    if (publicDir) {
      const onDisk = path.join(publicDir, resolved.replace(/^\//, ''));
      if (!fs.existsSync(onDisk)) return null;
    }
    return resolved;
  }

  const folderArticles = articleFolders
    .map((folder) => {
      const fullPath = path.join(articlesDir, folder, 'index.md');
      if (!fs.existsSync(fullPath)) return null;

      try {
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data } = matter(fileContents);
        const coverImage = resolveCoverImage(data.coverImage, folder);

        return {
          title: data.title || 'Untitled',
          excerpt: data.excerpt || '',
          date: data.date || '',
          author: data.author || 'Anonymous',
          slug: folder,
          coverImage,
          filter: data.filter || [],
          tags: data.tags || [],
          promoted: data.promoted || 0,
          topic: data.topic ?? undefined,
          readingTime: data.readingTime ?? undefined,
          embedHtml: data.embedHtml ?? undefined,
        } as Article;
      } catch {
        return null;
      }
    })
    .filter((a): a is Article => a !== null);

  const articles = [...folderArticles, ...extraArticles];

  let filteredArticles = articles.filter(article => new Date(article.date) <= currentDate);

  if (filter) {
    filteredArticles = filteredArticles.filter(article => {
      const articleFilter = Array.isArray(article.filter) ? article.filter : [article.filter];
      const searchFilter = Array.isArray(filter) ? filter : [filter];
      return searchFilter.some(f => articleFilter.includes(f));
    });
  }

  if (tag) {
    filteredArticles = filteredArticles.filter(article =>
      article.tags && article.tags.includes(tag)
    );
  }

  const articlesWithScore = filteredArticles.map(article => {
    const articleDate = new Date(article.date);
    const ageInDays = Math.floor((currentDate.getTime() - articleDate.getTime()) / (1000 * 60 * 60 * 24));
    const monthsOld = ageInDays / 30;
    const timeScore = 50 * Math.pow(0.5, monthsOld);
    const explicitPromotionScore = useExplicitPromotion ? (article.promoted || 0) : 0;

    return {
      ...article,
      promotedScore: explicitPromotionScore + timeScore
    } as ArticleWithScore;
  });

  return articlesWithScore
    .sort((a, b) => b.promotedScore - a.promotedScore)
    .slice(0, limit)
    .map(({ promotedScore, ...article }) => article);
}
