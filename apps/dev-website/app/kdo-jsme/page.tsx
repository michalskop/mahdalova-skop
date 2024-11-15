// app/about/page.tsx
import { Container, Title, Text } from '@mantine/core';
import { Testimonials } from '@/components/common/Testimonials';

export default function AboutPage() {
  return (
    <Container size="lg" py="xl">
      <Title>About Us</Title>
      <Text>Information about us will be displayed here.</Text>

      <Testimonials />

    </Container>
  );
}