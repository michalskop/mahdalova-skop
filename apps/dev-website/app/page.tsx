// app/page.tsx
'use client';

import { Container, Title, Text } from '@mantine/core';

export default function HomePage() {
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
    </Container>
  );
}