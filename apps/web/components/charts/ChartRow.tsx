'use client';

import { SimpleGrid } from '@mantine/core';

// Lays out several charts side by side on desktop, stacked on mobile — for
// small multiples that are meant to be compared directly (e.g. the same
// metric across country pairs), not read one after another like a normal
// article flow.
export default function ChartRow({ children, cols = 3 }: { children: React.ReactNode; cols?: number }) {
  return (
    <SimpleGrid cols={{ base: 1, md: cols }} spacing="md">
      {children}
    </SimpleGrid>
  );
}
