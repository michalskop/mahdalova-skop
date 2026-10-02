// app/specialy/komunalni-a-senatni-volby-2026/page.tsx – speciál k volbám 2026
import { getArticles, type Article } from '@/components/common/getArticles';
import { ArticlesSection } from '@/components/common/ArticlesSection';
import { Box, Container, Text, Title } from '@mantine/core';
import SubscribeNewsletter from '@/components/common/SubscribeNewsletter';
import SupportBanner from '@/components/common/SupportBanner';
import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.mahdalova-skop.cz';
const PATH = '/specialy/komunalni-a-senatni-volby-2026';
const TITLE = 'Komunální a senátní volby 2026';
const DESCRIPTION = 'Vše podstatné o letošních volbách, data & kontext, Volební kalkulačky, analýzy, predikce';
const OG_IMAGE = `${BASE_URL}/images/specials/komunalni-a-senatni-volby-2026-og.png`;
const INK = '#101432';

// Do speciálu patří vše, co nese aspoň jeden z těchto tagů.
const TAGS = ['volby 2026', 'komunální volby 2026', 'senátní volby 2026'];

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PATH,
    type: 'website',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default async function Volby2026Page() {
  // getArticles umí jen jeden tag → načteme každý zvlášť, sloučíme a necháme pořadí podle data.
  const lists = await Promise.all(TAGS.map((tag) => getArticles(100, undefined, false, tag)));
  const bySlug = new Map<string, Article>();
  for (const list of lists) for (const a of list) bySlug.set(a.slug, a);
  const articles = Array.from(bySlug.values()).sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  return (
    <Container size="lg" bg="background.2" maw="1200px" w="100%" p={0} m="0 auto">
      <Box bg={INK} px={{ base: 'md', md: 'xl' }} py={{ base: 28, md: 40 }}>
        <Title order={1} style={{ color: '#ffffff', fontFamily: "'Roboto Slab', Georgia, serif", fontWeight: 600 }}>
          {TITLE}
        </Title>
        <Text mt="sm" maw={720} style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.125rem', lineHeight: 1.5 }}>
          {DESCRIPTION}
        </Text>
        <a
          href="https://www.volebnikalkulacka.cz"
          target="_blank"
          rel="noopener noreferrer"
          className="vk-cta"
          style={{
            display: 'inline-block',
            marginTop: 20,
            padding: '10px 18px',
            borderRadius: 8,
            background: 'linear-gradient(135deg, #0070F4, #D04646)',
            color: '#ffffff',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Volební kalkulačka ↗
        </a>
      </Box>
      <ArticlesSection sectionTitle="Články a analýzy"articles={articles} themeColor={INK} />
      <SupportBanner />
      <SubscribeNewsletter actionUrl="https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088" />
    </Container>
  );
}
