// app/providers/ThemeProvider.tsx
'use client';

import { MantineProvider } from '@mantine/core';
import { useEffect, useState } from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Ensure no hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <MantineProvider
      defaultColorScheme="auto"
      theme={{
        fontFamily: inter.style.fontFamily,
        colors: {
          brand: [
            '#fff4f6',
            '#ffb3c0',
            '#ff8099',
            '#ff4d70',
            '#ff1a4a',
            '#f01745',
            '#de1743',
            '#c5143c',
            '#a81134',
            '#8b0e2b'
          ],
          background: [
            '#ffffff',
            '#fdfbf7',
            '#f8f6f0',
            '#f3f1e9',
            '#eeeae2',
            '#e9e9dd',
            '#e8e8dc',
            '#d4d4c8',
            '#c8c8bc',
            '#bcbcb0'
          ],
          brandYellow: [
            '#fffdf0',
            '#fff7d9',
            '#fff0b3',
            '#ffe680',
            '#ffdc33',
            '#ffd519',
            '#ffcf02', // Main yellow at index 6
            '#d6a404',
            '#bd9103',
            '#a47d03'],
          brandOrange: [
            '#fff4eb',
            '#ffe4cc',
            '#ffd4b3',
            '#ffb380',
            '#ff934d',
            '#ff7519',
            '#f76800', // Main orange at index 6
            '#c55300',
            '#ac4800',
            '#933e00'], 
        },
      }}
    >
      {children}
    </MantineProvider>
  );
}