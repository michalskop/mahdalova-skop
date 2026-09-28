// lib/getArticles.ts
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
  instagramImage?: string | null;
  /** Barva pruhů kolem náhledu (poměr 5:4), když obrázek není 5:4. Token palety
   * "scale.index" (např. "brandNavy.9") nebo hex. Viz ArticleCard. */
  coverBg?: string;
  /** Chování náhledu: 'cover' (ořez), 'contain' (celý + pruhy), 'auto' (dle poměru). */
  coverFit?: 'cover' | 'contain' | 'auto';
  filter?: string | string[];
  tags: string[];
  promoted?: number;
  topic?: string;
  readingTime?: number;
  embedHtml?: string;
  /** Full link override. When set, ArticleCard links here instead of `${articleBasePath}/${slug}`. */
  href?: string;
}

interface ArticleWithScore extends Article {
  promotedScore: number;
  publishedAt: number;
}

/** Okamžik publikace pro řazení. `time` je skryté frontmatter pole ("HH:MM",
 * pražský čas; doplňuje ho git hook scripts/git-hooks/pre-commit). NIKDY ho
 * nevracíme v objektu Article – ten jde do klientských komponent (RSC payload
 * v HTML), JSON-LD i RSS, a čas publikace má zůstat neveřejný. Hodnota je
 * „pražský čas na zdi“ zakódovaný jako UTC ms – časové pásmo se tak při
 * porovnávání vyruší (a stejně se porovnává hlavně v rámci jednoho dne). */
export interface PublishedAt {
  ms: number;
  hasTime: boolean;
}

export function parsePublishedAt(date: unknown, time?: unknown): PublishedAt {
  const d = typeof date === 'string' ? date.trim().match(/^(\d{4})-(\d{2})-(\d{2})/) : null;
  if (!d) {
    const ms = date instanceof Date ? date.getTime() : new Date(String(date ?? '')).getTime();
    return { ms: Number.isNaN(ms) ? 0 : ms, hasTime: false };
  }
  const t = typeof time === 'string' ? time.trim().match(/^(\d{1,2}):(\d{2})$/) : null;
  const ms = Date.UTC(+d[1], +d[2] - 1, +d[3], t ? +t[1] : 0, t ? +t[2] : 0);
  return { ms, hasTime: !!t };
}

/** Přečte skrytý čas publikace z `<articlesDir>/<slug>/index.md`; když složka
 * neexistuje (např. dpbp články), použije jen `fallbackDate`. */
export function readPublishedAt(articlesDir: string, slug: string, fallbackDate = ''): PublishedAt {
  const fullPath = path.join(articlesDir, slug, 'index.md');
  if (!fs.existsSync(fullPath)) return parsePublishedAt(fallbackDate);
  try {
    const { data } = matter(fs.readFileSync(fullPath, 'utf8'));
    return parsePublishedAt(data.date || fallbackDate, data.time);
  } catch {
    return parsePublishedAt(fallbackDate);
  }
}

/** Porovná dva okamžiky publikace: > 0 když je `a` novější. Hodina rozhoduje
 * jen tehdy, když ji mají oba; jinak se porovnává jen den (remíza = 0). */
export function comparePublishedAt(a: PublishedAt, b: PublishedAt): number {
  if (a.hasTime && b.hasTime) return a.ms - b.ms;
  const DAY = 24 * 60 * 60 * 1000;
  return Math.floor(a.ms / DAY) - Math.floor(b.ms / DAY);
}

interface GetArticlesOptions {
  articlesDir: string;
  coverImageBase: string;
  limit?: number;
  filter?: string | string[];
  useExplicitPromotion?: boolean;
  tag?: string;
  /** Pre-built articles from another content source (e.g. a different folder layout), merged in before scoring/sorting. */
  extraArticles?: Article[];
  /** Absolute path to the app's `public/` dir. When set, any local cover image that doesn't exist on disk falls back to null (→ ArticleCard's placeholder) instead of rendering a broken image. */
  publicDir?: string;
}

const isExternalUrl = (value: string): boolean => {
  return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('//');
};

export async function getArticles({
  articlesDir,
  coverImageBase,
  limit = 9,
  filter,
  useExplicitPromotion = false,
  tag,
  extraArticles = [],
  publicDir,
}: GetArticlesOptions): Promise<Article[]> {
  const articleFolders = fs.readdirSync(articlesDir);
  const currentDate = new Date();

  function resolveCoverImage(raw: unknown, folder: string): string | null {
    if (!raw || typeof raw !== 'string') return null;
    if (isExternalUrl(raw)) return raw;

    // The corpus uses the same syntax ("/images/foo.ext") for two different
    // things depending on the article: most commonly "foo.ext inside this
    // article's own images/ subfolder", but some older articles really mean
    // a genuine site-root file under public/images/. Without publicDir we
    // can't tell them apart, so default to the more common folder-relative
    // reading. With publicDir, try folder-relative first, then site-root,
    // then give up (→ ArticleCard's placeholder) – whichever actually
    // exists on disk wins.
    const folderRelative = path.posix.join(coverImageBase, folder, raw);
    if (!publicDir) return folderRelative;

    const folderRelativeOnDisk = path.join(publicDir, folderRelative.replace(/^\//, ''));
    if (fs.existsSync(folderRelativeOnDisk)) return folderRelative;

    const siteRoot = raw.startsWith('/') ? raw : `/${raw}`;
    const siteRootOnDisk = path.join(publicDir, siteRoot.replace(/^\//, ''));
    if (fs.existsSync(siteRootOnDisk)) return siteRoot;

    return null;
  }

  const folderArticles = articleFolders
    .map((folder) => {
      const fullPath = path.join(articlesDir, folder, 'index.md');
      if (!fs.existsSync(fullPath)) return null;

      try {
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data } = matter(fileContents);
        const homepageImage = resolveCoverImage(data.homepageImage, folder);
        const coverImage = homepageImage || resolveCoverImage(data.coverImage, folder);

        return {
          title: data.title || 'Untitled',
          excerpt: data.excerpt || '',
          date: data.date || '',
          author: data.author || 'Anonymous',
          slug: folder,
          coverImage,
          instagramImage: resolveCoverImage(data.instagramImage, folder),
          coverBg: data.coverBg ?? undefined,
          coverFit: homepageImage ? 'cover' : data.coverFit ?? undefined,
          filter: data.filter || [],
          tags: data.tags || [],
          promoted: data.promoted || 0,
          topic: data.topic ?? undefined,
          readingTime: data.readingTime ?? undefined,
          embedHtml: data.embedHtml ?? undefined,
        } as Article;
      } catch {
        return null;
      }
    })
    .filter((a): a is Article => a !== null);

  const articles = [...folderArticles, ...extraArticles];

  let filteredArticles = articles.filter(article => new Date(article.date) <= currentDate);

  if (filter) {
    filteredArticles = filteredArticles.filter(article => {
      const articleFilter = Array.isArray(article.filter) ? article.filter : [article.filter];
      const searchFilter = Array.isArray(filter) ? filter : [filter];
      return searchFilter.some(f => articleFilter.includes(f));
    });
  }

  if (tag) {
    filteredArticles = filteredArticles.filter(article =>
      article.tags && article.tags.includes(tag)
    );
  }

  const articlesWithScore = filteredArticles.map(article => {
    const articleDate = new Date(article.date);
    const ageInDays = Math.floor((currentDate.getTime() - articleDate.getTime()) / (1000 * 60 * 60 * 24));
    const monthsOld = ageInDays / 30;
    const timeScore = 50 * Math.pow(0.5, monthsOld);
    const explicitPromotionScore = useExplicitPromotion ? (article.promoted || 0) : 0;

    return {
      ...article,
      promotedScore: explicitPromotionScore + timeScore,
      publishedAt: readPublishedAt(articlesDir, article.slug, article.date).ms,
    } as ArticleWithScore;
  });

  // Články ze stejného dne mají stejné skóre → rozhodne skrytý čas publikace.
  return articlesWithScore
    .sort((a, b) => b.promotedScore - a.promotedScore || b.publishedAt - a.publishedAt)
    .slice(0, limit)
    .map(({ promotedScore, publishedAt, ...article }) => article);
}
