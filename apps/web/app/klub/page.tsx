// app/klub/page.tsx
import type { Metadata } from 'next';
import KlubPage from './KlubPage';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.mahdalova-skop.cz';
const TITLE = 'Klub DataTimes';
const DESCRIPTION =
  'Naše analýzy jsou a zůstanou zdarma a bez paywallu. Klub je způsob, jak držet v české debatě hlas, který stojí na datech.';
const COVER = `${BASE_URL}/images/og-image.png`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/klub' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/klub',
    type: 'website',
    images: [{ url: COVER, width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [COVER],
  },
};

export default function Page() {
  return <KlubPage />;
}
