// app/tag/not-found.tsx
import { Container } from '@mantine/core';

export default function NotFound() {
  return (
    <Container 
      size="lg"
      maw="1200px"
      w="100%"
      p={0}
      m="0 auto"
    >
      <div className="py-8">
        <h1 className="text-2xl font-bold mb-4">Tag nenalezen</h1>
        <p>Omlouváme se, ale hledaný tag neexistuje.</p>
      </div>
    </Container>
  );
}