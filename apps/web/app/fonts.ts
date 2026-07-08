// app/fonts.ts
// Single source of truth for the Roboto Slab webfont so the same next/font
// instance (and its generated @font-face) is shared between the root
// layout (which exposes --font-roboto-slab on <body>) and ThemeProvider
// (which feeds Mantine's default theme.fontFamily).
import { Roboto_Condensed, Roboto_Slab } from 'next/font/google';

export const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-roboto-slab',
});

// dpbp chart/map body copy (axis labels, captions, footers) uses Roboto Condensed –
// this was previously referenced as a bare CSS font-family string with no webfont
// actually loaded, so it silently fell back to Arial everywhere.
export const robotoCondensed = Roboto_Condensed({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-roboto-condensed',
});
