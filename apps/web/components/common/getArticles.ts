// components/common/getArticles.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import {
  getArticles as _getArticles,
  readPublishedAt,
  type Article,
  type PublishedAt,
} from '@repo/ui/lib/getArticles';
import { getDpbpArticles } from './getDpbpArticles';

export type { Article, PublishedAt } from '@repo/ui/lib/getArticles';
export { comparePublishedAt } from '@repo/ui/lib/getArticles';

const ARTICLES_DIR = path.join(process.cwd(), 'app/clanek/_articles');

/** Skrytý okamžik publikace (date + frontmatter `time`) – jen pro řazení na
 * serveru, nikdy ho neposílat do komponent ani metadat. */
export function getPublishedAt(article: Pick<Article, 'slug' | 'date'>): PublishedAt {
  return readPublishedAt(ARTICLES_DIR, article.slug, article.date);
}

const LEAD_TEXT_MAX_CHARS = 1600;

/** Odstavec markdownu → čistý text (bez odkazů, zvýraznění a inline JSX). */
function plainParagraph(block: string): string {
  return block
    .replace(/<[^>]*\/>/g, '')                 // samostatné komponenty <X ... />
    .replace(/<\/?[A-Za-z][^>]*>/g, '')        // HTML/JSX tagy
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')      // obrázky
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')   // [text](url) → text
    .replace(/(\*\*|__|\*|_|`)/g, '')          // zvýraznění, kód
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Navazující text pro velkou kartu na homepage: první souvislé odstavce těla
 * článku jako čistý text (nadpisy, boxy, grafy, tabulky, seznamy a komponenty
 * se přeskakují). FeaturedHero ho připojí za perex a zkrátí na volné místo,
 * aby v kartě nevznikla díra. Jen pro lead (ne pro všechny karty – payload).
 */
export function withLeadText<T extends Article>(article: T): T & { leadText?: string } {
  const file = path.join(ARTICLES_DIR, article.slug, 'index.md');
  if (!fs.existsSync(file)) return article;
  const { content } = matter(fs.readFileSync(file, 'utf8'));
  const parts: string[] = [];
  let len = 0;
  let inFence = false;
  for (const raw of content.split(/\n\s*\n/)) {
    const block = raw.trim();
    if (!block) continue;
    const fences = (block.match(/^```/gm) || []).length;
    if (inFence || block.startsWith('```')) {
      if (fences % 2 === 1) inFence = !inFence;
      continue;
    }
    // Nadpisy, komponenty, tabulky, seznamy, citace, obrázky a výrazy přeskoč.
    if (/^(#|<|\||[-*+] |\d+\. |>|!\[|\{)/.test(block)) continue;
    const text = plainParagraph(block);
    if (text.length < 40) continue;
    parts.push(text);
    len += text.length;
    if (len >= LEAD_TEXT_MAX_CHARS) break;
  }
  return parts.length ? { ...article, leadText: parts.join(' ') } : article;
}

// These _articles/ folders are kept only as content sources (read via
// getArticleBySlug for their real page) – their /clanek/[slug] route is
// deliberately excluded from generateStaticParams() there (see
// app/clanek/[slug]/page.tsx EXCLUDED_SLUGS) because the canonical page
// lives under /specialy/. Card links must point there too, or `output:
// export` errors with "missing param" when someone clicks the card.
const ARTICLE_HREF_OVERRIDES: Record<string, string> = {
  'data-pro-budouci-premierku-02-demografie':
    '/specialy/data-pro-budouci-premierku/01-demografie',
  'data-pro-budouci-premierku-02-demografie-plodnost':
    '/specialy/data-pro-budouci-premierku/01-demografie/01-proc-klesa-plodnost',
};

export async function getArticles(
  limit: number = 9,
  filter?: string | string[],
  useExplicitPromotion: boolean = false,
  tag?: string
) {
  const articles = await _getArticles({
    articlesDir: ARTICLES_DIR,
    coverImageBase: '/clanek/_articles',
    publicDir: path.join(process.cwd(), 'public'),
    limit,
    filter,
    useExplicitPromotion,
    tag,
    // dpbp articles have no `filter`/`tag` set, so they only surface in the
    // unfiltered homepage call (Výběr) – Analýzy/Kontext/Podcasty sections
    // (which pass an explicit filter) are unaffected until that's mapped.
    extraArticles: getDpbpArticles(),
  });

  return articles.map((article) =>
    ARTICLE_HREF_OVERRIDES[article.slug]
      ? { ...article, href: ARTICLE_HREF_OVERRIDES[article.slug] }
      : article
  );
}
