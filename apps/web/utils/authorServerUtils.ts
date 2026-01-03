// utils/authorServerUtils.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { normalizeAuthor, splitAuthors } from '@/utils/authorUtils';

export async function getAllAuthors(): Promise<Map<string, string>> {
  const articlesDirectory = path.join(process.cwd(), 'app/clanek/_articles');
  const authorMap = new Map<string, string>();

  try {
    const articleFolders = fs.readdirSync(articlesDirectory);

    articleFolders.forEach((folder) => {
      const fullPath = path.join(articlesDirectory, folder, 'index.md');
      if (!fs.existsSync(fullPath)) return;

      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      const authors = splitAuthors(data.author);
      authors.forEach((name) => {
        const normalized = normalizeAuthor(name);
        if (!normalized) return;
        if (!authorMap.has(normalized)) {
          authorMap.set(normalized, name);
        }
      });
    });
  } catch (err) {
    console.error('Error reading authors:', err);
  }

  return authorMap;
}
