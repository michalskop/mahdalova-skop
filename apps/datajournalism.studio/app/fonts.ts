// app/fonts.ts
// Roboto Condensed for chart/map copy (axis labels, captions, footers),
// shared by components/charts/* (ported from apps/web / apps/datatimes-org).
import { IBM_Plex_Sans, IBM_Plex_Serif, Roboto_Condensed } from 'next/font/google';

export const robotoCondensed = Roboto_Condensed({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-roboto-condensed',
});

// IBM Plex Serif (body) + IBM Plex Sans (headings) – the DataTimes.cz type pair.
// Scoped to the /about and /support pages (ported from apps/web) via
// app/about/pageFonts.module.css, so the rest of the site keeps Work Sans.
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
