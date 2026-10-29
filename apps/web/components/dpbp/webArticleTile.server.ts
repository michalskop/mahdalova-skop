import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Web articles (app/clanek/_articles/<slug>) included in a DPBP chapter as a
// tile with `"web": "<slug>"` in _meta.json. The article keeps its own URL –
// the tile only links to it, nothing is copied into the special.
const WEB_ARTICLES_DIR = path.join(process.cwd(), 'app/clanek/_articles');
const PUBLIC_DIR = path.join(process.cwd(), 'public');

export interface WebArticleTileData {
  title: string;
  excerpt: string;
  author: string;
  href: string;
  image?: string;
}

function resolveImage(slug: string, raw: unknown): string | undefined {
  if (!raw || typeof raw !== 'string') return undefined;
  if (/^(https?:)?\/\//.test(raw)) return raw;
  const folderRelative = path.posix.join('/clanek/_articles', slug, raw);
  if (fs.existsSync(path.join(PUBLIC_DIR, folderRelative))) return folderRelative;
  const siteRoot = raw.startsWith('/') ? raw : `/${raw}`;
  if (fs.existsSync(path.join(PUBLIC_DIR, siteRoot))) return siteRoot;
  // public/ is filled by copyImages.js on dev/build; fall back to the
  // folder-relative path, which is where that script puts it.
  return folderRelative;
}

export function loadWebArticleTile(slug: string): WebArticleTileData | null {
  const file = path.join(WEB_ARTICLES_DIR, slug, 'index.md');
  if (!fs.existsSync(file)) return null;
  const { data } = matter(fs.readFileSync(file, 'utf8'));
  return {
    title: String(data.title ?? slug),
    excerpt: String(data.excerpt ?? ''),
    author: String(data.author ?? ''),
    href: `/clanek/${slug}`,
    // Karty ve speciálu jsou na šířku → nejdřív podlouhlý OG cover (1200 × 630).
    image: resolveImage(slug, data.ogImage) ?? resolveImage(slug, data.homepageImage) ?? resolveImage(slug, data.coverImage),
  };
}
