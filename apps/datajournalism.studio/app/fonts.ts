// app/fonts.ts
// Roboto Condensed for chart/map copy (axis labels, captions, footers),
// shared by components/charts/* (ported from apps/web / apps/datatimes-org).
import { IBM_Plex_Sans, IBM_Plex_Serif, Roboto_Condensed, Roboto_Slab } from 'next/font/google';

// Roboto Slab – secondary display face shared with DataTimes.cz (exposed as
// --font-roboto-slab on <body>, used by a few ported components).
export const robotoSlab = Roboto_Slab({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-roboto-slab',
});

export const robotoCondensed = Roboto_Condensed({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-roboto-condensed',
});

// IBM Plex Serif (body) + IBM Plex Sans (headings) – the DataTimes.cz type pair,
// used site-wide via ThemeProvider (see packages/ui/DESIGN.md → Typography).
export const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-serif',
});

export const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans',
});
