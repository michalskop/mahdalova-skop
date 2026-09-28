// components/common/getArticles.ts
import path from 'path';
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
