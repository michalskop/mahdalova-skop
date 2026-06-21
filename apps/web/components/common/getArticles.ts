// components/common/getArticles.ts
import path from 'path';
import { getArticles as _getArticles } from '@repo/ui/lib/getArticles';
import { getDpbpArticles } from './getDpbpArticles';

export type { Article } from '@repo/ui/lib/getArticles';

// These _articles/ folders are kept only as content sources (read via
// getArticleBySlug for their real page) — their /clanek/[slug] route is
// deliberately excluded from generateStaticParams() there (see
// app/clanek/[slug]/page.tsx EXCLUDED_SLUGS) because the canonical page
// lives under /specialy/. Card links must point there too, or `output:
// export` errors with "missing param" when someone clicks the card.
const ARTICLE_HREF_OVERRIDES: Record<string, string> = {
  'data-pro-budouci-premierku-02-demografie':
    '/specialy/data-pro-budouci-premierku/02-demografie',
  'data-pro-budouci-premierku-02-demografie-plodnost':
    '/specialy/data-pro-budouci-premierku/02-demografie/01-proc-klesa-plodnost',
};

export async function getArticles(
  limit: number = 9,
  filter?: string | string[],
  useExplicitPromotion: boolean = false,
  tag?: string
) {
  const articles = await _getArticles({
    articlesDir: path.join(process.cwd(), 'app/clanek/_articles'),
    coverImageBase: '/clanek/_articles',
    publicDir: path.join(process.cwd(), 'public'),
    limit,
    filter,
    useExplicitPromotion,
    tag,
    // dpbp articles have no `filter`/`tag` set, so they only surface in the
    // unfiltered homepage call (Výběr) — Analýzy/Kontext/Podcasty sections
    // (which pass an explicit filter) are unaffected until that's mapped.
    extraArticles: getDpbpArticles(),
  });

  return articles.map((article) =>
    ARTICLE_HREF_OVERRIDES[article.slug]
      ? { ...article, href: ARTICLE_HREF_OVERRIDES[article.slug] }
      : article
  );
}
