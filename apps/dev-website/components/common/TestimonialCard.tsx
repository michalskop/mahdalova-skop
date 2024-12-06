// components/TestimonialCard.tsx
import { Paper, Text, Title } from '@mantine/core';

interface TestimonialCardProps {
  author: string;
  text: string;
  position: string;
  date: string;
}

export function TestimonialCard({ author, text, position, date }: TestimonialCardProps) {
  return (
    <>
    <Paper
      // shadow="sm"
      px="md"
      pt="md"
      radius="lg"
      bg="brandRoyalBlue.8"
      c="background.2"
      style={{
        height: '60%',
      }}
    >
      <div className="flex flex-col justify-between h-full">
        <Text size="sm" className="italic" style={{ textAlign: 'justify' }}>
          &ldquo;{text}&rdquo;
        </Text>
      </div>
    </Paper>
    <Paper
      p="lg"
      radius="lg"
      bg="brandRoyalBlue.8"
      c="background.2"
      mt={10}
      pt={10}
      style={{
        height: '25%',
      }}
    >
      <div className="mt-4"  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Title order={4}>{author}</Title>
        <Text size="sm" c="dimmed">{position} • {date}</Text>
      </div>
      {/* </div> */}
    </Paper>
    </>
  );
}