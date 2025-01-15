// app/providers/ThemeProvider.tsx
'use client';

import { MantineProvider } from '@mantine/core';
import { useEffect, useState } from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

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
      defaultColorScheme="light"
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
            brandRoyalBlue: [
              "#e9ebfa", "#c9d0f5", "#a9b5f0", "#899aeb", "#697fe6", "#5e66d5", "#4a51ab", "#383d82", "#272a59", "#161730"
            ],
            brandTeal: ["#e5f9fc", "#b8eff6", "#8cdfef", "#5fcce6", "#33b9d9", "#1a9fbd", "#0f6c78", "#0b5964", "#084650", "#06333c"],
            brandForestGreen: ["#eaf7d6", "#cbeab1", "#acde8b", "#8dd265", "#6ec53f", "#639e0a", "#507e08", "#3d5f06", "#2a3f04", "#172002"],
            brandEmeraldMint: ["#e8f9f4", "#c2f0e4", "#9be8d4", "#75dfc4", "#4fd6b4", "#12b886", "#0e926a", "#0b6b4e", "#084533", "#042319"],
            brandNavy: ["#e9ecf4", "#d2d8e9", "#bcc4df", "#a6b0d4", "#8f9dc9", "#7889be", "#6267a3", "#4c4f8e", "#2f325c", "#101432"],
            brandDeepRed:["#fbe8eb", "#f5c4cd", "#efa0af", "#e87c91", "#d85a74", "#bb3a5d", "#a03250", "#812840", "#621d30", "#431320"]
        },
        // Force light mode colors
        white: '#ffffff',
        black: '#000000',
        // Explicitly set dark mode components to use light mode colors
        components: {
          Paper: {
            styles: {
              root: {
                '&[data-mantine-color-scheme="dark"]': {
                  backgroundColor: '#ffffff'
                }
              }
            }
          },  // /Paper
        }
      }}
    >
      {children}
    </MantineProvider>
  );
}
