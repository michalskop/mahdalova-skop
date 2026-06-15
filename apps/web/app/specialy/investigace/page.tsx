// app/special/investigace/page.tsx
import { getArticles } from '@/components/common/getArticles';
import { ArticlesSection } from '@/components/common/ArticlesSection';
import { Container } from '@mantine/core';
import SubscribeNewsletter from '@/components/common/SubscribeNewsletter';
import SupportBanner from '@/components/common/SupportBanner';
import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.mahdalova-skop.cz';
const COVER = `${BASE_URL}/images/specials/investigace.jpg`;

export const metadata: Metadata = {
  title: 'Investigace',
  description: 'InvestigativnÃ­ ÄlÃ¡nky MahdalovÃ¡ & Skop â€“ odhalujeme to, co zÅ¯stÃ¡vÃ¡ skrytÃ©.',
  alternates: { canonical: '/specialy/investigace' },
  openGraph: {
    title: 'Investigace',
    description: 'InvestigativnÃ­ ÄlÃ¡nky MahdalovÃ¡ & Skop â€“ odhalujeme to, co zÅ¯stÃ¡vÃ¡ skrytÃ©.',
    url: '/specialy/investigace',
    type: 'website',
    images: [{ url: COVER, width: 1200, height: 630, alt: 'Investigace' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Investigace',
    description: 'InvestigativnÃ­ ÄlÃ¡nky MahdalovÃ¡ & Skop â€“ odhalujeme to, co zÅ¯stÃ¡vÃ¡ skrytÃ©.',
    images: [COVER],
  },
};

export default async function InvestigacePage() {
  const articles = await getArticles(100, 'investigace');

  return (
    <Container
      size="lg"
      bg="background.2"
      maw="1200px"
      w="100%"
      p={0}
      m="0 auto"
    >
      <ArticlesSection
        sectionTitle="Investigace"
        articles={articles}
        themeColor="#351040"
      />
      <SupportBanner />
      <SubscribeNewsletter actionUrl="https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088" />
    </Container>
  );
}
