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
}

export async function getArticles(limit: number = 9, filter?: string | string[]): Promise<Article[]> {
  const articlesDirectory = path.join(process.cwd(), 'app/clanek/_articles');
  const articleFolders = fs.readdirSync(articlesDirectory);

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
      tags: data.tags || []
    } as Article;
  });

  const filteredArticles = filter 
    ? articles.filter(article => {
        const articleFilter = Array.isArray(article.filter) ? article.filter : [article.filter];
        const searchFilter = Array.isArray(filter) ? filter : [filter];
        return searchFilter.some(f => articleFilter.includes(f));
      })
    : articles;

  return filteredArticles
    .sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    })
    .slice(0, limit);
}