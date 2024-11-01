// lib/articles.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export async function getArticleBySlug(slug: string) {
  const articlesDirectory = path.join(process.cwd(), 'app/articles/_articles');
  const fullPath = path.join(articlesDirectory, `${slug}/index.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const { data, content } = matter(fileContents);

  return {
    slug,
    content,
    ...data,
  };
}