// app/tag/utils.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export function normalizeTag(tag: string): string {
  return tag
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function getAllTags() {
  const articlesDirectory = path.join(process.cwd(), 'app/clanek/_articles');
  const tagMap = new Map<string, string>();

  try {
    const articleFolders = fs.readdirSync(articlesDirectory);

    articleFolders.forEach((folder) => {
      const fullPath = path.join(articlesDirectory, folder, 'index.md');
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      if (data.tags && Array.isArray(data.tags)) {
        data.tags.forEach((tag: string) => {
          if (tag && typeof tag === 'string') {
            const normalizedTag = normalizeTag(tag);
            tagMap.set(normalizedTag, tag);
          }
        });
      }
    });
  } catch (err) {
    console.error('Error reading tags:', err);
  }

  return tagMap;
}