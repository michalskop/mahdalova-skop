// app/common/ArticlesGrid.tsx
'use client';
import { Container, Title, Space, Grid } from '@mantine/core';
import { ArticleCard } from '@/components/clanek/ArticleCard';
import type { Article } from './getArticles';

interface ArticlesGridProps {
 articles: Article[]; 
}

export function ArticlesGrid({ articles }: ArticlesGridProps) {
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
           <ArticleCard {...article} />
         </Grid.Col>
       ))}
     </Grid>
   </Container>
 );
}