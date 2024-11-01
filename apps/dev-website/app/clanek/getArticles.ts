// app/clanek/getArticles.ts
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
  tags: string[];
}

export async function getArticles(): Promise<Article[]> {
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
      tags: data.tags || []
    } as Article;
  });

  return articles
    .sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    })
    .slice(0, 10);
}