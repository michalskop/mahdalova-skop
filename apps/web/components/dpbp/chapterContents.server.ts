import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { DPBP_CHAPTERS } from './chapterNavigation';

export type ChapterContents = Record<string, string[]>;

export function loadChapterContents(contentRoot: string): ChapterContents {
  return Object.fromEntries(
    DPBP_CHAPTERS.map(chapter => {
      const articlesDir = path.join(contentRoot, chapter.slug, 'articles');
      if (!fs.existsSync(articlesDir)) return [chapter.slug, []];

      const titles = fs.readdirSync(articlesDir)
        .filter(file => file.endsWith('.mdx'))
        .map(file => {
          const source = fs.readFileSync(path.join(articlesDir, file), 'utf8');
          const { data } = matter(source);
          return typeof data.title === 'string' ? data.title : null;
        })
        .filter((title): title is string => title !== null);

      return [chapter.slug, titles];
    })
  );
}
