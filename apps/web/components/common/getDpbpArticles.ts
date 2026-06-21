// components/common/getDpbpArticles.ts
// Reads articles from the dpbp (Data pro budoucí premiérku) content system
// (_content/{chapter}/articles/*.mdx) so they can be merged into the
// site-wide homepage article feed alongside the older _articles/ system.
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { Article } from '@repo/ui/lib/getArticles';

const CONTENT_ROOT = path.join(
  process.cwd(),
  'app/specialy/data-pro-budouci-premierku/_content'
);

// Chapter 02-demografie uses the older app/clanek/_articles/ system already
// scanned elsewhere — skip it here to avoid duplicate cards.
const SKIP_CHAPTERS = new Set(['02-demografie']);

const SPECIAL_NAME = 'Data pro budoucí premiérku';

// Short, human-readable chapter label for the first tag/badge — hand-curated
// because deriving it from the slug (e.g. "08-nedostupnost-bydleni" → first
// word "nedostupnost") produces awkward results.
const CHAPTER_LABELS: Record<string, string> = {
  '01-energie-a-energeticka-bezpecnost': 'Energetika',
  '03-zdravotnictvi-a-pece': 'Zdravotnictví',
  '04-klimaticka-zmena': 'Klima',
  '05-bezpecnost-a-konflikty': 'Bezpečnost',
  '06-ai-a-trh-prace': 'AI a práce',
  '07-oligarchizace-a-korupce': 'Korupce',
  '08-nedostupnost-bydleni': 'Bydlení',
  '09-ekonomicka-nerovnost': 'Nerovnost',
  '10-digitalizace-a-inovace': 'Digitalizace',
  '11-uroven-vzdelavani': 'Vzdělávání',
  '12-medialni-manipulace': 'Média',
};

interface ChapterMetaLite {
  title?: string;
}

function chapterLabel(chapterSlug: string, meta: ChapterMetaLite | null): string {
  return CHAPTER_LABELS[chapterSlug] ?? meta?.title ?? chapterSlug;
}

export function getDpbpArticles(): Article[] {
  if (!fs.existsSync(CONTENT_ROOT)) return [];

  const result: Article[] = [];

  for (const chapter of fs.readdirSync(CONTENT_ROOT)) {
    if (SKIP_CHAPTERS.has(chapter)) continue;
    const chapterDir = path.join(CONTENT_ROOT, chapter);
    if (!fs.statSync(chapterDir).isDirectory()) continue;

    let meta: ChapterMetaLite | null = null;
    const metaPath = path.join(chapterDir, '_meta.json');
    if (fs.existsSync(metaPath)) {
      try {
        meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      } catch {
        meta = null;
      }
    }
    const label = chapterLabel(chapter, meta);

    const articlesDir = path.join(chapterDir, 'articles');
    if (!fs.existsSync(articlesDir)) continue;

    for (const file of fs.readdirSync(articlesDir)) {
      if (!file.endsWith('.mdx')) continue;
      const slug = file.replace(/\.mdx$/, '');
      if (slug === 'one-pager') continue; // summary tile, not a standalone homepage card

      const raw = fs.readFileSync(path.join(articlesDir, file), 'utf8');
      const { data } = matter(raw);

      result.push({
        title: data.title || 'Untitled',
        excerpt: data.excerpt || '',
        date: data.date || '',
        author: data.author || 'Kateřina Mahdalová & Michal Škop',
        slug: `${chapter}-${slug}`,
        coverImage: null,
        filter: [],
        tags: [label, SPECIAL_NAME],
        promoted: 0,
        href: `/specialy/data-pro-budouci-premierku/${chapter}/${slug}`,
      });
    }
  }

  return result;
}
