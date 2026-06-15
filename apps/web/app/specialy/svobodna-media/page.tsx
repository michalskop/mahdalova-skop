// app/special/svobodna-media/page.tsx
import { getArticles } from '@/components/common/getArticles';
import { ArticlesSection } from '@/components/common/ArticlesSection';
import { Container } from '@mantine/core';
import SubscribeNewsletter from '@/components/common/SubscribeNewsletter';
import SupportBanner from '@/components/common/SupportBanner';
import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.mahdalova-skop.cz';
const COVER = `${BASE_URL}/images/specials/svobodna-media.svg`;

export const metadata: Metadata = {
  title: 'SvobodnÃ¡ mÃ©dia',
  description: 'ÄŒlÃ¡nky MahdalovÃ¡ & Skop o svobodÄ› mÃ©diÃ­, jejich vlastnictvÃ­ a nezÃ¡vislosti.',
  alternates: { canonical: '/specialy/svobodna-media' },
  openGraph: {
    title: 'SvobodnÃ¡ mÃ©dia',
    description: 'ÄŒlÃ¡nky MahdalovÃ¡ & Skop o svobodÄ› mÃ©diÃ­, jejich vlastnictvÃ­ a nezÃ¡vislosti.',
    url: '/specialy/svobodna-media',
    type: 'website',
    images: [{ url: COVER, width: 1200, height: 630, alt: 'SvobodnÃ¡ mÃ©dia' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SvobodnÃ¡ mÃ©dia',
    description: 'ÄŒlÃ¡nky MahdalovÃ¡ & Skop o svobodÄ› mÃ©diÃ­, jejich vlastnictvÃ­ a nezÃ¡vislosti.',
    images: [COVER],
  },
};

export default async function SvobodnaMediaPage() {
  const articles = await getArticles(100, 'svobodnÃ¡-mÃ©dia');

  return (
    <Container size="lg" bg="background.2" maw="1200px" w="100%" p={0} m="0 auto">
      <ArticlesSection
        sectionTitle="SvobodnÃ¡ mÃ©dia"
        articles={articles}
        themeColor="#812840"
      />
      <SupportBanner />
      <SubscribeNewsletter actionUrl="https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088" />
    </Container>
  );
}
