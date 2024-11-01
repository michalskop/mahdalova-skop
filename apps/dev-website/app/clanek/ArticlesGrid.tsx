// app/clanek/ArticlesGrid.tsx
'use client';

import { Container, Title, Space, Grid } from '@mantine/core';
import { ArticleCard } from '@/components/clanek/ArticleCard';
import type { Article } from './getArticles';

interface ArticlesGridProps {
  articles: Article[];
}

export function ArticlesGrid({ articles }: ArticlesGridProps) {
  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xl" ta="center">
        Latest Articles
      </Title>
      <Space h="md" />
      <Grid gutter="xl">
        {articles.map((article) => (
          <Grid.Col key={article.slug} span={{ base: 12, sm: 6, md: 4 }}>
            <ArticleCard {...article} />
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
}