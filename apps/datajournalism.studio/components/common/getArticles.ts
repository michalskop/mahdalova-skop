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

export type { Article, PublishedAt } from '@repo/ui/lib/getArticles';
export { comparePublishedAt } from '@repo/ui/lib/getArticles';

const ARTICLES_DIR = path.join(process.cwd(), 'app/a/_articles');

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

/** Public URL prefix of article pages on datajournalism.studio. */
export const ARTICLE_BASE_PATH = '/a';

export async function getArticles(
  limit: number = 9,
  filter?: string | string[],
  useExplicitPromotion: boolean = false,
  tag?: string
) {
  const articles = await _getArticles({
    articlesDir: ARTICLES_DIR,
    coverImageBase: '/a/_articles',
    publicDir: path.join(process.cwd(), 'public'),
    limit,
    filter,
    useExplicitPromotion,
    tag,
  });

  // Explicit href so every shared card (ArticleCard, RelatedArticles, RSS)
  // links to /a/<slug>, whatever its own default base path is.
  return articles.map((article) => ({
    ...article,
    href: article.href ?? `${ARTICLE_BASE_PATH}/${article.slug}`,
  }));
}
