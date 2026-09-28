'use client';

import { Box, Title, Paper, useMantineTheme } from '@mantine/core';
import { useState } from 'react';
import { ArticlesGrid, type ArticlesGridVariant } from './ArticlesGrid';
import type { Article } from '../lib/getArticles';
import { Arrow } from './Arrow';

interface ArticlesSectionProps {
  sectionTitle: string;
  sectionLink?: string;
  articles: Article[];
  themeColor?: string;
  articleBasePath?: string;
  locale?: string;
  /**
   * Když je nastaveno (např. na homepage), sekce zobrazí jen tolik karet,
   * aby vyplnily celé řádky podle šířky. Bez tohoto propu (výpisy rubrik,
   * autor, tag…) se zobrazí VŠECHNY předané články.
   */
  adaptiveRows?: number;
  /**
   * Homepage rozložení dle The Nerve ('featured' = Výběr 2×2, 'standard' = 3 sloupce).
   * Zapíná zároveň skrytí bočního nadpisu na užších displejích (nadpis se
   * nikdy nepřesune nad karty – místo toho zmizí).
   */
  variant?: ArticlesGridVariant;
  /**
   * Homepage pás bez nadpisu rubriky (jako Volby / Výběr): karty lícují
   * s horním okrajem pásu a místo nadpisu je dole „Více" + šipka → sectionLink.
   */
  moreBelow?: boolean;
  moreLabel?: string;
}

export function ArticlesSection({
  sectionTitle,
  sectionLink = '#',
  articles,
  themeColor = 'red',
  articleBasePath,
  locale,
  adaptiveRows,
  variant,
  moreBelow = false,
  moreLabel = 'Více',
}: ArticlesSectionProps) {
  const theme = useMantineTheme();
  const [isTitleHovered, setIsTitleHovered] = useState(false);
  const shouldShowArrow = sectionTitle.length <= 14;

  if (moreBelow) {
    const light = theme.colors.background[0];
    // Stejný „Více" jako u FeaturedHero (Volby, Výběr): velký sans nadpis +
    // vlnovková šipka u levého okraje pásu, odkaz na výpis rubriky.
    return (
      <Paper py={16} bg={themeColor} radius={0}>
        <ArticlesGrid articles={articles} articleBasePath={articleBasePath} locale={locale} adaptiveRows={adaptiveRows} variant={variant} />
        <Box px="md" mt="md" style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <a
            href={sectionLink}
            onMouseEnter={() => setIsTitleHovered(true)}
            onMouseLeave={() => setIsTitleHovered(false)}
            style={{ display: 'inline-flex', textDecoration: 'none' }}
          >
            <Title
              order={2}
              c={light}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '5px',
                maxWidth: '100%',
                textDecoration: isTitleHovered ? 'underline' : 'none',
              }}
            >
              {moreLabel}
              <Arrow size={80} color={light} />
            </Title>
          </a>
        </Box>
      </Paper>
    );
  }

  {/* Nadpis rubriky (Volby, Analýzy, Kontext, Výběr…) je nově NAD kartami přes
      celou šířku – dřívější boční 200px pás zmizel, takže trojice karet pod ním
      využijí plnou šíři stránky. px="md" lícuje s vnitřním paddingem mřížky. */}
  const titleHeader = (
    <Box px="md" pb={8}>
      <a
        href={sectionLink}
        rel="noopener noreferrer"
        onMouseEnter={() => setIsTitleHovered(true)}
        onMouseLeave={() => setIsTitleHovered(false)}
        style={{
          textDecoration: isTitleHovered ? 'underline' : 'none',
          display: 'inline-flex',
          maxWidth: '100%',
          color: theme.colors.background[0]
        }}
      >
        <Title
          order={2}
          ta="left"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '5px', maxWidth: '100%' }}
          c={theme.colors.background[0]}
        >
          {sectionTitle}
          {shouldShowArrow ? <Arrow size={80} color={theme.colors.background[0]} /> : null}
        </Title>
      </a>
    </Box>
  );

  return (
    <Paper py={16} bg={themeColor} radius={0}>
      {/* Mřížka i nadpis mají stejný vodorovný okraj (px="md" = 16px = mezera
          mezi kartami), takže nadpis lícuje s levým okrajem prvního sloupce. */}
      {titleHeader}

      <ArticlesGrid articles={articles} articleBasePath={articleBasePath} locale={locale} adaptiveRows={adaptiveRows} variant={variant} />
    </Paper>
  );
}
