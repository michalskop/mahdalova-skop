// app/providers/ThemeProvider.tsx
'use client';

import { MantineProvider } from '@mantine/core';
import { useEffect, useState } from 'react';
import { Roboto_Slab } from 'next/font/google';

const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-roboto-slab',
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
        fontFamily: robotoSlab.style.fontFamily,
        colors: {
          // PRIMARY — crimson red. Use for: links, headings, tag badges, primary
          // buttons, Arrow component, section titles, InfoBox 'error' border.
          // Main shade: [6] = #de1743. Light tint: [0] = #fff4f6.
          brand: [
            '#fff4f6',
            '#ffb3c0',
            '#ff8099',
            '#ff4d70',
            '#ff1a4a',
            '#f01745',
            '#de1743', // [6] default — use for most brand-coloured elements
            '#c5143c',
            '#a81134',
            '#8b0e2b'
          ],
          // PAGE BACKGROUNDS — warm off-white scale. Use for: page bg [1],
          // card/paper bg [1], table header [2], text on dark surfaces [0].
          // Never use for text on light backgrounds (no contrast).
          background: [
            '#ffffff',  // [0] pure white — text colour on coloured backgrounds
            '#fdfbf7',  // [1] default page/paper background
            '#f8f6f0',  // [2] slightly darker — table headers, blockquotes
            '#f3f1e9',
            '#eeeae2',
            '#e9e9dd',
            '#e8e8dc',
            '#d4d4c8',
            '#c8c8bc',
            '#bcbcb0'
          ],
          // ACCENT YELLOW — use sparingly for highlights/decorative elements.
          // Main shade: [6] = #ffcf02.
          brandYellow: [
            '#fffdf0',
            '#fff7d9',
            '#fff0b3',
            '#ffe680',
            '#ffdc33',
            '#ffd519',
            '#ffcf02', // [6] main yellow
            '#d6a404',
            '#bd9103',
            '#a47d03'],
          // ACCENT ORANGE — use for: InfoBox 'warning' border/bg, warning states.
          // Main shade: [6] = #f76800. Light tint: [0] = #fff4eb.
          brandOrange: [
            '#fff4eb',  // [0] InfoBox warning background
            '#ffe4cc',
            '#ffd4b3',
            '#ffb380',
            '#ff934d',
            '#ff7519',
            '#f76800', // [6] InfoBox warning border
            '#c55300',
            '#ac4800',
            '#933e00'],
          // ROYAL BLUE — use for: testimonial card backgrounds (dark [8]).
          // Main shade: [6] = #4a51ab. Dark shade: [8] = #272a59.
          brandRoyalBlue: [
            "#e9ebfa", "#c9d0f5", "#a9b5f0", "#899aeb", "#697fe6", "#5e66d5",
            "#4a51ab", // [6] main
            "#383d82", "#272a59", // [8] testimonial card bg
            "#161730"
          ],
          // TEAL — use for: InfoBox 'success' border, subscribe button (color="teal"),
          // success states. Main shade: [6] = #0f6c78. Light tint: [0] = #e5f9fc.
          brandTeal: [
            "#e5f9fc", // [0] InfoBox success background
            "#b8eff6", "#8cdfef", "#5fcce6", "#33b9d9", "#1a9fbd",
            "#0f6c78", // [6] InfoBox success border, subscribe button
            "#0b5964", "#084650", "#06333c"],
          // FOREST GREEN — decorative accent. Not used in current components.
          // Main shade: [6] = #639e0a.
          brandForestGreen: [
            "#eaf7d6", "#cbeab1", "#acde8b", "#8dd265", "#6ec53f",
            "#639e0a", // [6] main
            "#507e08", "#3d5f06", "#2a3f04", "#172002"],
          // EMERALD MINT — decorative accent. Not used in current components.
          // Main shade: [6] = #12b886.
          brandEmeraldMint: [
            "#e8f9f4", "#c2f0e4", "#9be8d4", "#75dfc4", "#4fd6b4",
            "#12b886", // [6] main
            "#0e926a", "#0b6b4e", "#084533", "#042319"],
          // NAVY/PURPLE — use for: MediaBox background (light mode), InfoBox 'info'
          // border. Main shade: [6] = #6267a3. Light tint: [0] = #e9ecf4.
          brandNavy: [
            "#e9ecf4", "#d2d8e9", "#bcc4df", "#a6b0d4", "#8f9dc9", "#7889be",
            "#6267a3", // [6] MediaBox bg (light), InfoBox info border
            "#4c4f8e", "#2f325c", "#101432"],
          // DEEP RED — darker crimson variant. Decorative, not used in current components.
          // Main shade: [6] = #a03250.
          brandDeepRed: [
            "#fbe8eb", "#f5c4cd", "#efa0af", "#e87c91", "#d85a74", "#bb3a5d",
            "#a03250", // [6] main
            "#812840", "#621d30", "#431320"]
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