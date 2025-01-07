// app/specials/page.tsx
'use client';

import { Container, Title, Text } from '@mantine/core';
import DonateForm from '@/components/common/DonateForm';

export default function SpecialsPage() {
  return (
    <Container size="lg" py="xl">
      <Title>Specials</Title>
      <Text>Special content will be displayed here.</Text>
      <DonateForm />
    </Container>
  );
}