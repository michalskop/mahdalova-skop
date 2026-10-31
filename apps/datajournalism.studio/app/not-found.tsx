// app/not-found.tsx
import { Container, Title, Text, Anchor } from '@mantine/core';

export default function NotFound() {
  return (
    <Container size="md" py="xl">
      <Title order={1} mb="md">Page not found</Title>
      <Text mb="md">Sorry, the page you are looking for does not exist or has moved.</Text>
      <Text>
        <Anchor href="/">Back to the homepage</Anchor>
        {' · '}
        <Anchor href="/search">Search the articles</Anchor>
      </Text>
    </Container>
  );
}
