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
}

const isAbsoluteUrl = (value: unknown): value is string => {
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
}: GetArticlesOptions): Promise<Article[]> {
  const articleFolders = fs.readdirSync(articlesDir);
  const currentDate = new Date();

  const articles = articleFolders
    .map((folder) => {
      const fullPath = path.join(articlesDir, folder, 'index.md');
      if (!fs.existsSync(fullPath)) return null;

      try {
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data } = matter(fileContents);
        const coverImage = data.coverImage
          ? (isAbsoluteUrl(data.coverImage) ? data.coverImage : `${coverImageBase}/${folder}/${data.coverImage}`)
          : null;

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
        } as Article;
      } catch {
        return null;
      }
    })
    .filter((a): a is Article => a !== null);

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
