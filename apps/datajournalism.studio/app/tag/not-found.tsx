// app/tag/not-found.tsx
import { Container, Title, Text } from '@mantine/core';

export default function NotFound() {
  return (
    <Container size="md" py="xl">
      <Title order={1} mb="md">Tag not found</Title>
      <Text>Sorry, this tag does not exist.</Text>
    </Container>
  );
}
