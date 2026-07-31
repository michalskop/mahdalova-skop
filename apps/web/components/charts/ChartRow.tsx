'use client';

import { SimpleGrid } from '@mantine/core';
import { useMemo, useState } from 'react';
import ChartCard from './ChartCard';
import ChartGroupContext from './ChartGroupContext';

export interface ChartRowProps {
  children: React.ReactNode;
  cols?: number;
  title?: string;
  subtitle?: string;
  source?: string;
}

// Lays out several charts side by side on desktop, stacked on mobile — for
// small multiples meant to be compared directly (e.g. the same metric
// across several countries), not read one after another like normal article
// flow. When `subtitle`/`source` are given, the whole row renders as ONE
// shared ChartCard (one subtitle, one footer): every VegaChart underneath
// picks up `bare` via ChartGroupContext (own title only, no repeated
// card/subtitle/footer/signature) instead of N nearly-identical cards
// stacked side by side.
export default function ChartRow({ children, cols = 3, title, subtitle, source }: ChartRowProps) {
  const hasSharedHeader = Boolean(title || subtitle || source);
  const [hoverRatio, setHoverRatio] = useState<number | null>(null);
  const group = useMemo(
    () => ({ bare: hasSharedHeader, hoverRatio, setHoverRatio }),
    [hasSharedHeader, hoverRatio],
  );

  const grid = (
    <ChartGroupContext.Provider value={group}>
      <SimpleGrid cols={{ base: 1, md: cols }} spacing="md">
        {children}
      </SimpleGrid>
    </ChartGroupContext.Provider>
  );

  if (!hasSharedHeader) return grid;

  return (
    <ChartCard title={title} subtitle={subtitle} source={source}>
      {grid}
    </ChartCard>
  );
}
