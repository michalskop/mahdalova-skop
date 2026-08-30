'use client';

import {
  Card,
  Text,
  Badge,
  Group,
  Center,
  useMantineTheme,
} from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import classes from './ArticleCard.module.css';

// Cílový poměr náhledu 5:4 a max. ořez, který ještě necháme „na plno“ (cover).
// Když by ořez do 5:4 ukrojil víc než tolik, obrázek se ukáže celý (contain)
// a okolo se doplní pruh barvy – ať se neztratí text/důležitá část obrázku.
const TARGET_RATIO = 5 / 4;
const MAX_COVER_CROP = 0.2;

function fitFor(naturalW: number, naturalH: number): 'cover' | 'contain' {
  if (!naturalW || !naturalH) return 'cover';
  const r = naturalW / naturalH;
  const crop = r > TARGET_RATIO ? 1 - TARGET_RATIO / r : 1 - r / TARGET_RATIO;
  return crop > MAX_COVER_CROP ? 'contain' : 'cover';
}

interface ArticleCardProps {
  title: string;
  excerpt: string;
  date: string;
  author: string;
  slug: string;
  coverImage: string | null;
  tags: string[];
  articleBasePath?: string;
  href?: string;
  locale?: string;
  /**
   * Barva pruhů, které doplní náhled do poměru 5:4, když obrázek není 5:4
   * (obrázek se nikdy neořízne – ukáže se celý a okolo se dobarví). Hodnota je
   * token palety ve tvaru "scale.index" (např. "brandNavy.9", "brandCoralRed.5")
   * nebo přímo hex ("#101432"). Autor ji vybírá nástrojem tools/cover-bg-picker.html.
   * Když není zadaná, použije se bílá (čistá pasparta jako v galerii).
   */
  coverBg?: string;
  /**
   * Jak náhled naložit s obrázkem, který není 5:4:
   *  - 'cover'   – vždy oříznout (pro obrázky navržené na ořez shora/zdola),
   *  - 'contain' – vždy ukázat celý + pruhy barvy,
   *  - 'auto' / neuvedeno – rozhodne se podle poměru (ořez do ~20 % → cover, jinak contain).
   */
  coverFit?: 'cover' | 'contain' | 'auto';
}

/** Přeloží token palety "scale.index" (nebo hex) na konkrétní hex barvu. */
function resolvePaletteColor(
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

export function ArticleCard({
  title,
  excerpt,
  date,
  author,
  slug,
  coverImage,
  tags,
  articleBasePath = '/clanek',
  href,
  locale = 'cs-CZ',
  coverBg,
  coverFit = 'auto',
}: ArticleCardProps) {
  const theme = useMantineTheme();
  const coverBgColor = resolvePaletteColor(theme, coverBg, '#ffffff');

  // U 'auto' se rozhodne podle skutečného poměru obrázku; 'cover'/'contain'
  // jsou pevně dané autorem.
  const [autoFit, setAutoFit] = useState<'cover' | 'contain'>('cover');
  const imgRef = useRef<HTMLImageElement | null>(null);
  const fit: 'cover' | 'contain' =
    coverFit === 'cover' || coverFit === 'contain' ? coverFit : autoFit;

  // Po mountu změř obrázek i pro případ, že se načetl z cache dřív, než stihl
  // proběhnout onLoad (jinak by u těchto obrázků zůstalo defaultní 'cover').
  useEffect(() => {
    if (coverFit !== 'auto') return;
    const el = imgRef.current;
    if (el && el.naturalWidth && el.naturalHeight) {
      setAutoFit(fitFor(el.naturalWidth, el.naturalHeight));
    }
  }, [coverImage, coverFit]);
  const normalizedBasePath = (() => {
    const base = articleBasePath?.trim() || '';
    if (!base) return '';
    const withLeadingSlash = base.startsWith('/') ? base : `/${base}`;
    return withLeadingSlash.endsWith('/') ? withLeadingSlash.slice(0, -1) : withLeadingSlash;
  })();

  const linkProps = { href: href || `${normalizedBasePath}/${slug}` };

  return (
    <Card withBorder radius="md" className={classes.card}>
      <Card.Section>
        {/* Náhled 5:4. Podle `fit`: buď se obrázek ořízne (cover), nebo se ukáže
            celý a okolo se doplní pruh barvy coverBgColor (contain).
            Obrázek NENÍ samostatný odkaz – proklik zajišťuje natažený odkaz
            z titulku (.title::after), takže je klikatelná celá karta. */}
        <div
          style={{
            display: 'block',
            aspectRatio: '5 / 4',
            background: fit === 'contain' ? coverBgColor : undefined,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={coverImage || '/placeholder-image.svg'}
            alt={title}
            loading="lazy"
            onLoad={(e) => {
              if (coverFit === 'auto') {
                const el = e.currentTarget;
                setAutoFit(fitFor(el.naturalWidth, el.naturalHeight));
              }
            }}
            style={{ width: '100%', height: '100%', objectFit: fit, display: 'block' }}
          />
        </div>
      </Card.Section>

      {tags.length > 0 && (
        <Badge
          key={tags[0]}
          className={classes.rating}
          variant="gradient"
          gradient={{ from: theme.colors.brand[3], to: theme.colors.brand[8] }}
        >
          {tags[0]}
        </Badge>
      )}

      <Text
        className={classes.title}
        fw={600}
        component="a"
        {...linkProps}
        size='lg'
      >
        {title}
      </Text>

      <Text fz="sm" c="brandNavy.9" lineClamp={4}>
        {excerpt}
      </Text>

      <Group justify="space-between" className={classes.footer}>
        <Center>
          <div>
            <Text
              fz="sm"
              inline
              c="brandNavy.9"
            >
              {new Date(date).toLocaleDateString(locale)}
            </Text>
          </div>
        </Center>

        <Group gap={8} mr={0}>
        </Group>
      </Group>
    </Card>
  );
}
