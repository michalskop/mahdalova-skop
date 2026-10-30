// app/fonts.ts
// Roboto Condensed for chart/map copy (axis labels, captions, footers),
// shared by components/charts/* (ported from apps/web / apps/datatimes-org).
import { Roboto_Condensed } from 'next/font/google';

export const robotoCondensed = Roboto_Condensed({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-roboto-condensed',
});
