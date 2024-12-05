// app/components/frontpage/FeaturedArticlesSection.tsx

import { Box, Group, Title, Stack, Paper } from '@mantine/core';
import { ArticlesGrid } from '@/components/common/ArticlesGrid';
import { Article } from '@/components/common/getArticles';
import { Arrow } from '@/components/common/Arrow';

interface FeaturedArticlesSectionProps {
  sectionTitle: string;
  articles: Article[];
  themeColor?: string;
}

export function FeaturedArticlesSection({
  sectionTitle,
  articles,
  themeColor = 'red'
}: FeaturedArticlesSectionProps) {
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
          <Title 
            order={2} 
            ta={{ base: 'left', sm: 'right' }}
            style={{ display: 'flex', alignItems: 'right', justifyContent: 'flex-start', gap: '5px' }}
          >
            {sectionTitle}
            <Arrow size={80} color="black" />
          </Title>
        </Stack>
        <Box flex={1}>
          <ArticlesGrid articles={articles} />
        </Box>
      </Group>
    </Paper>
  );
}