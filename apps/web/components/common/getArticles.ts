// app/common/getArticles.ts
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
  useExplicitPromotion: boolean = false
): Promise<Article[]> {
  const articlesDirectory = path.join(process.cwd(), 'app/clanek/_articles');
  const articleFolders = fs.readdirSync(articlesDirectory);
  const currentDate = new Date();

  const articles = articleFolders.map((folder) => {
    const fullPath = path.join(articlesDirectory, folder, 'index.md');
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
      promoted: data.promoted || 0
    } as Article;
  });

  // Filter out future articles and apply content filters
  const filteredArticles = articles
    .filter(article => new Date(article.date) <= currentDate)
    .filter(article => {
      if (!filter) return true;
      const articleFilter = Array.isArray(article.filter) ? article.filter : [article.filter];
      const searchFilter = Array.isArray(filter) ? filter : [filter];
      return searchFilter.some(f => articleFilter.includes(f));
    });

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
    .map(({ promotedScore, ...article }) => article); // Remove the score before returning
}