// components/common/getArticles.ts
import path from 'path';
import { getArticles as _getArticles } from '@repo/ui/lib/getArticles';

export type { Article } from '@repo/ui/lib/getArticles';

export async function getArticles(
  limit: number = 9,
  filter?: string | string[],
  useExplicitPromotion: boolean = false,
  tag?: string
) {
  return _getArticles({
    articlesDir: path.join(process.cwd(), 'app/a/_articles'),
    coverImageBase: '/a/_articles',
    limit,
    filter,
    useExplicitPromotion,
    tag,
  });
}
