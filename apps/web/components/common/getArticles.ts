// components/common/getArticles.ts
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

export async function getArticles(
  limit: number = 9,
  filter?: string | string[],
  useExplicitPromotion: boolean = false,
  tag?: string
): Promise<Article[]> {
  const articlesDirectory = path.join(process.cwd(), 'app/clanek/_articles');
  const articleFolders = fs.readdirSync(articlesDirectory);
  const currentDate = new Date();

  const articles = articleFolders
    .map((folder) => {
      const fullPath = path.join(articlesDirectory, folder, 'index.md');
      // Skip folders that don't have an index.md to avoid ENOENT
      if (!fs.existsSync(fullPath)) return null;

      try {
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data } = matter(fileContents);
        const coverImage = data.coverImage
          ? `/clanek/_articles/${folder}/${data.coverImage}`
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
        // If any single article fails to parse, skip it gracefully
        return null;
      }
    })
    .filter((a): a is Article => a !== null);

  // Filter out future articles
  let filteredArticles = articles.filter(article => new Date(article.date) <= currentDate);

  // Apply content filters if specified
  if (filter) {
    filteredArticles = filteredArticles.filter(article => {
      const articleFilter = Array.isArray(article.filter) ? article.filter : [article.filter];
      const searchFilter = Array.isArray(filter) ? filter : [filter];
      return searchFilter.some(f => articleFilter.includes(f));
    });
  }

  // Apply tag filter if specified
  if (tag) {
    filteredArticles = filteredArticles.filter(article => 
      article.tags && article.tags.includes(tag)
    );
  }

  // Calculate promotion score for each article
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

  // Sort by promotion score and return limited results
  return articlesWithScore
    .sort((a, b) => b.promotedScore - a.promotedScore)
    .slice(0, limit)
    .map(({ promotedScore, ...article }) => article);
}