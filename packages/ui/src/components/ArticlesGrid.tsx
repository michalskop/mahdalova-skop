'use client';
import { Container, Space, Grid } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import { ArticleCard } from './ArticleCard';
import type { Article } from '../lib/getArticles';
import classes from './HomeArticles.module.css';

/**
 * Rozložení karet na homepage (dle The Nerve):
 *   'featured' (Výběr)  – 2 sloupce (2×2 karty) na desktopu, kolaps na 1 pod 640px
 *   'standard' (ostatní) – 3 sloupce na širokém desktopu, 2 od 640px, 1 pod 640px
 */
export type ArticlesGridVariant = 'featured' | 'standard';

interface ArticlesGridProps {
  articles: Article[];
  articleBasePath?: string;
  locale?: string;
  /**
   * Když je nastaveno, mřížka je plně fluidní a zobrazí jen tolik karet,
   * aby vyplnily celé řádky (počet sloupců podle šířky × tento počet řádků).
   * Žádné neúplné řádky ani prázdná místa. Bez tohoto propu zůstává původní
   * chování (pevná Mantine mřížka, všechny články) pro výpisy.
   */
  adaptiveRows?: number;
  /** Homepage varianta s pevnými zlomy podle The Nerve (viz výše). */
  variant?: ArticlesGridVariant;
}

const MIN_CARD = 300; // px – min. šířka karty; na širokém desktopu vyjdou 3 sloupce,
// při zúžení na 2 sloupce logika níže doplní 4. kartu (2+2, žádná osamocená v řádku)

export function ArticlesGrid({ articles, articleBasePath, locale, adaptiveRows, variant }: ArticlesGridProps) {
  if (variant) {
    return (
      <AdaptiveGrid
        articles={articles}
        articleBasePath={articleBasePath}
        locale={locale}
        rows={variant === 'featured' ? 2 : 1}
        variant={variant}
      />
    );
  }

  if (!adaptiveRows) {
    return (
      <Container size="lg" py={0}>
        <Space h="md" />
        <Grid gutter="md">
          {articles.map((article) => (
            <Grid.Col
              style={{ containerType: 'inline-size' }}
              key={article.slug}
              span={{ base: 12, sm: 6, md: 4 }}
            >
              <ArticleCard {...article} articleBasePath={articleBasePath} locale={locale} />
            </Grid.Col>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <AdaptiveGrid
      articles={articles}
      articleBasePath={articleBasePath}
      locale={locale}
      rows={adaptiveRows}
    />
  );
}

function AdaptiveGrid({
  articles,
  articleBasePath,
  locale,
  rows,
  variant,
}: {
  articles: Article[];
  articleBasePath?: string;
  locale?: string;
  rows: number;
  variant?: ArticlesGridVariant;
}) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [cols, setCols] = useState(variant === 'featured' ? 2 : 3);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    // Přečti skutečný počet CSS sloupců, které auto-fill vykreslil pro danou šířku.
    const measure = () => {
      const tracks = getComputedStyle(el)
        .gridTemplateColumns.split(' ')
        .filter((t) => t && t !== '0px').length;
      if (tracks > 0) setCols(tracks);
    };
    // Změř až po ustálení layoutu (dvojitý rAF), ať nechytneme přechodnou šířku.
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(measure);
    });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  // Vyplň celé řádky; na úzkých displejích (málo sloupců) ukaž aspoň 3 karty.
  const effectiveRows = Math.max(rows, Math.ceil(3 / cols));
  const shown = articles.slice(0, cols * effectiveRows);

  const grid = (
    <>
      {/* U homepage variant dává horní mezeru py sekce (16 px), ať je stejná jako dole. */}
      {!variant && <Space h="md" />}
      <div
        ref={gridRef}
        className={variant ? `${classes.grid} ${classes[variant]}` : undefined}
        style={
          variant
            ? undefined
            : {
                display: 'grid',
                gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${MIN_CARD}px), 1fr))`,
                gap: 'var(--mantine-spacing-md)',
              }
        }
      >
        {shown.map((article) => (
          <div key={article.slug} style={{ containerType: 'inline-size' }}>
            <ArticleCard {...article} articleBasePath={articleBasePath} locale={locale} />
          </div>
        ))}
      </div>
    </>
  );

  // Homepage varianty využívají plnou šířku sekce; legacy adaptivní režim
  // zůstává uvnitř Containeru jako dřív.
  return variant ? grid : <Container size="lg" py={0}>{grid}</Container>;
}
