import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { DPBP_CHAPTERS } from './chapterNavigation';

export interface ChapterArticleItem {
  slug: string;
  title: string;
  href: string;
}

export type ChapterContents = Record<string, ChapterArticleItem[]>;

export function loadChapterContents(contentRoot: string): ChapterContents {
  return Object.fromEntries(
    DPBP_CHAPTERS.map(chapter => {
      const chapterDir = path.join(contentRoot, chapter.slug);
      const metaPath = path.join(chapterDir, '_meta.json');
      const articlesDir = path.join(chapterDir, 'articles');

      const articleSlugs: string[] = [];

      if (fs.existsSync(metaPath)) {
        try {
          const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
          if (meta.openerArticle && typeof meta.openerArticle === 'string') {
            articleSlugs.push(meta.openerArticle);
          }
          if (Array.isArray(meta.tiles)) {
            meta.tiles.forEach((tile: any) => {
              if (tile && typeof tile.slug === 'string') articleSlugs.push(tile.slug);
            });
          }
          if (Array.isArray(meta.postSupportTiles)) {
            meta.postSupportTiles.forEach((tile: any) => {
              if (tile && typeof tile.slug === 'string') articleSlugs.push(tile.slug);
            });
          }
        } catch {
          // ignore parse error
        }
      }

      if (articleSlugs.length === 0 && fs.existsSync(articlesDir)) {
        const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.mdx') || f.endsWith('.html'));
        files.forEach(f => articleSlugs.push(f.replace(/\.(mdx|html)$/, '')));
      }

      const uniqueSlugs = Array.from(new Set(articleSlugs));

      const articles: ChapterArticleItem[] = uniqueSlugs.map(articleSlug => {
        const mdxPath = path.join(articlesDir, `${articleSlug}.mdx`);
        const htmlPath = path.join(articlesDir, `${articleSlug}.html`);
        let title = articleSlug;

        if (fs.existsSync(mdxPath)) {
          const source = fs.readFileSync(mdxPath, 'utf8');
          const { data } = matter(source);
          if (typeof data.title === 'string' && data.title.trim()) {
            title = data.title.trim();
          }
        } else if (fs.existsSync(htmlPath)) {
          const source = fs.readFileSync(htmlPath, 'utf8');
          const titleMatch = source.match(/<h1[^>]*>(.*?)<\/h1>/i) || source.match(/title:\s*["']?([^"'\n]+)/i);
          if (titleMatch?.[1]) {
            title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
          }
        }

        return {
          slug: articleSlug,
          title,
          href: `/specialy/data-pro-budouci-premierku/${chapter.slug}/${articleSlug}`,
        };
      });

      return [chapter.slug, articles];
    })
  );
}
