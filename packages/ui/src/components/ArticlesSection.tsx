'use client';

import { Box, Group, Title, Stack, Paper, useMantineTheme } from '@mantine/core';
import { useState } from 'react';
import { ArticlesGrid, type ArticlesGridVariant } from './ArticlesGrid';
import type { Article } from '../lib/getArticles';
import { Arrow } from './Arrow';
import classes from './HomeArticles.module.css';

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
}: ArticlesSectionProps) {
  const theme = useMantineTheme();
  const [isTitleHovered, setIsTitleHovered] = useState(false);
  const shouldShowArrow = sectionTitle.length <= 14;

  return (
    <Paper py={16} bg={themeColor} radius={0}>
      <Group
        gap={0}
        align="flex-start"
        wrap="wrap"
      >
        <Stack
          className={variant ? classes.sideTitle : undefined}
          w={variant ? undefined : { base: '100%', md: 200 }}
          mb={variant ? undefined : { base: 'xs', md: 0 }}
          pt={15}
          pl="md"
        >
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
        </Stack>
        <Box flex={1} style={{ minWidth: 0 }}>
          <ArticlesGrid articles={articles} articleBasePath={articleBasePath} locale={locale} adaptiveRows={adaptiveRows} variant={variant} />
        </Box>
      </Group>
    </Paper>
  );
}
