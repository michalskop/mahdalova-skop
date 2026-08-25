'use client';
import { Container, Space, Grid } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import { ArticleCard } from './ArticleCard';
import type { Article } from '../lib/getArticles';

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
}

const MIN_CARD = 230; // px – minimální šířka karty pro fluidní mřížku

export function ArticlesGrid({ articles, articleBasePath, locale, adaptiveRows }: ArticlesGridProps) {
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
}: {
  articles: Article[];
  articleBasePath?: string;
  locale?: string;
  rows: number;
}) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [cols, setCols] = useState(3);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const GAP = 16; // odpovídá gap: var(--mantine-spacing-md)
    // Stejný výpočet, jaký dělá CSS auto-fill: kolik sloupců minmax(MIN_CARD) se vejde.
    const compute = (w: number) => Math.max(1, Math.floor((w + GAP) / (MIN_CARD + GAP)));
    setCols(compute(el.clientWidth));
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? el.clientWidth;
      setCols(compute(w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Vyplň celé řádky; na úzkých displejích (málo sloupců) ukaž aspoň 3 karty.
  const effectiveRows = Math.max(rows, Math.ceil(3 / cols));
  const shown = articles.slice(0, cols * effectiveRows);

  return (
    <Container size="lg" py={0}>
      <Space h="md" />
      <div
        ref={gridRef}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${MIN_CARD}px), 1fr))`,
          gap: 'var(--mantine-spacing-md)',
        }}
      >
        {shown.map((article) => (
          <div key={article.slug} style={{ containerType: 'inline-size' }}>
            <ArticleCard {...article} articleBasePath={articleBasePath} locale={locale} />
          </div>
        ))}
      </div>
    </Container>
  );
}
