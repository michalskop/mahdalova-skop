'use client';
import { Container, Space, Grid } from '@mantine/core';
import { ArticleCard } from './ArticleCard';
import type { Article } from '../lib/getArticles';

interface ArticlesGridProps {
  articles: Article[];
  articleBasePath?: string;
  locale?: string;
}

export function ArticlesGrid({ articles, articleBasePath, locale }: ArticlesGridProps) {
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
