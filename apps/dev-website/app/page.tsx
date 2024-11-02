// app/page.tsx
// 'use client';

import { Container, Title, Text } from '@mantine/core';
import { getArticles } from '@/components/common/getArticles';
import { ArticlesGrid } from '@/components/common/ArticlesGrid';

export default async function HomePage() {
  const articles = await getArticles(3);

  return (
    <Container 
      size="lg" 
      py="xl"
      style={{ 
        margin: '0 auto',
        padding: 'var(--mantine-spacing-xl) var(--mantine-spacing-md)',
        maxWidth: '1200px',
        width: '100%'
      }}
    >
      <Title ta="center" mb="xl">Welcome to Our Website</Title>
      <Text mb="md">This is the home page content.</Text>
      <Text>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec 
        purus ac libero ultricies aliquam nec nec nunc. Nullam nec purus ac 
        libero ultricies aliquam nec nec nunc. Nullam nec purus ac libero 
        ultricies aliquam nec nec nunc. Nullam nec purus ac libero ultricies 
        aliquam nec nec nunc.
      </Text>
      <ArticlesGrid articles={articles} />
    </Container>
  );
}