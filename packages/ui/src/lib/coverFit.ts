import type { useMantineTheme } from '@mantine/core';

// Cílový poměr náhledu 5:4 a max. ořez, který ještě necháme „na plno“ (cover).
// Když by ořez do 5:4 ukrojil víc než tolik, obrázek se ukáže celý (contain)
// a okolo se doplní pruh barvy – ať se neztratí text/důležitá část obrázku.
// Sdíleno mezi ArticleCard (homepage) a RelatedArticles (box „Doporučujeme“),
// aby náhledy vypadaly všude stejně.
export const TARGET_RATIO = 5 / 4;
export const MAX_COVER_CROP = 0.2;

export function fitFor(naturalW: number, naturalH: number): 'cover' | 'contain' {
  if (!naturalW || !naturalH) return 'cover';
  const r = naturalW / naturalH;
  const crop = r > TARGET_RATIO ? 1 - TARGET_RATIO / r : 1 - r / TARGET_RATIO;
  return crop > MAX_COVER_CROP ? 'contain' : 'cover';
}

/** Přeloží token palety "scale.index" (nebo hex) na konkrétní hex barvu. */
export function resolvePaletteColor(
  theme: ReturnType<typeof useMantineTheme>,
  value: string | undefined,
  fallback: string,
): string {
  if (!value) return fallback;
  if (value.startsWith('#')) return value;
  const [name, idxRaw] = value.split('.');
  const scale = (theme.colors as Record<string, readonly string[]>)[name];
  if (!scale) return fallback;
  const idx = idxRaw ? Number.parseInt(idxRaw, 10) : 6;
  return scale[idx] ?? scale[6] ?? fallback;
}
