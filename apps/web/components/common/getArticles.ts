// components/common/getArticles.ts
import path from 'path';
import { getArticles as _getArticles } from '@repo/ui/lib/getArticles';
import { getDpbpArticles } from './getDpbpArticles';

export type { Article } from '@repo/ui/lib/getArticles';

export async function getArticles(
  limit: number = 9,
  filter?: string | string[],
  useExplicitPromotion: boolean = false,
  tag?: string
) {
  return _getArticles({
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
}
