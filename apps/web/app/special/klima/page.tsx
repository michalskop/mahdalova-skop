// app/special/klima/page.tsx
import { getArticles } from '@/components/common/getArticles';
import { ArticlesSection } from '@/components/common/ArticlesSection';
import { Container } from '@mantine/core';
import SubscribeNewsletter from '@/components/common/SubscribeNewsletter';
import SupportBanner from '@/components/common/SupportBanner';
import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.mahdalova-skop.cz';
const COVER = `${BASE_URL}/images/specials/klima.svg`;

export const metadata: Metadata = {
  title: 'Data o klimatu',
  description: 'Analýzy a datová žurnalistika o změnách klimatu, jejich dopadech a klimatické politice.',
  alternates: { canonical: '/special/klima' },
  openGraph: {
    title: 'Data o klimatu',
    description: 'Analýzy a datová žurnalistika o změnách klimatu, jejich dopadech a klimatické politice.',
    url: '/special/klima',
    type: 'website',
    images: [{ url: COVER, width: 1200, height: 630, alt: 'Data o klimatu' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Data o klimatu',
    description: 'Analýzy a datová žurnalistika o změnách klimatu, jejich dopadech a klimatické politice.',
    images: [COVER],
  },
};

export default async function KlimaPage() {
  const articles = await getArticles(100, 'klima');

  return (
    <Container size="lg" bg="background.2" maw="1200px" w="100%" p={0} m="0 auto">
      <ArticlesSection
        sectionTitle="Data o klimatu"
        articles={articles}
        themeColor="linear-gradient(135deg, #2a3f04, #639e0a)"
      />
      <SupportBanner />
      <SubscribeNewsletter actionUrl="https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088" />
    </Container>
  );
}
