// app/components/frontpage/ArticlesSection.tsx
'use client';

import { Box, Group, Title, Stack, Paper, useMantineTheme } from '@mantine/core';
import { useState } from 'react';
import { ArticlesGrid } from '@/components/common/ArticlesGrid';
import { Article } from '@/components/common/getArticles';
import { Arrow } from '@/components/common/Arrow';

interface ArticlesSectionProps {
  sectionTitle: string;
  sectionLink?: string;
  articles: Article[];
  themeColor?: string;
}

export function ArticlesSection({
  sectionTitle,
  sectionLink = '#',
  articles,
  themeColor = 'red'
}: ArticlesSectionProps) {
  const theme = useMantineTheme();
  const [isTitleHovered, setIsTitleHovered] = useState(false);
  const shouldShowArrow = sectionTitle.length <= 14;
  return (
    <Paper py={20} bg={themeColor} radius={0}>
      <Group 
        gap={0}
        align="flex-start"
        wrap="wrap"
      >
        <Stack 
          w={{ base: '100%', md: 200 }}
          mb={{ base: 'xs', md: 0 }}
          pt={15}
          pl={{ base: 'md', md: 'md' }}
        >
          <a 
            href={sectionLink} // Set the link URL
            rel="noopener noreferrer" // Security measure for external links
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
              {shouldShowArrow ? <Arrow size={80} color={ theme.colors.background[0] } /> : null}
            </Title>
          </a>
        </Stack>
        <Box flex={1}>
          <ArticlesGrid articles={articles} />
        </Box>
      </Group>
    </Paper>
  );
}