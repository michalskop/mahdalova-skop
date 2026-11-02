// app/page.tsx – Data Journalism Studio homepage, laid out like DataTimes.cz:
// hero, then FeaturedHero bands (large lead card on the left, the next three
// as compact cards on the right, "More" → section listing).

import { Container } from '@mantine/core';
import { getArticles, withLeadText } from '@/components/common/getArticles';
import Testimonials from '@/components/common/Testimonials';
import HeroTitle from '@/components/frontpage/HeroTitle';
import { FeaturedHero } from '@/components/frontpage/FeaturedHero';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

export default async function HomePage() {
  // getArticles sorts newest first (date + hidden `time`); explicit `promoted`
  // would keep the 2024 evergreen pages on top, so it stays off.
  const articles_elections = await getArticles(8, 'work');
  const articles_context = await getArticles(8, 'blog');

  // The large card on the left gets follow-on text from the article body so
  // the excerpt fills the card height (see FeaturedHero).
  const withLead = <T extends Parameters<typeof withLeadText>[0]>(list: T[]) =>
    list.map((a, i) => (i === 0 ? withLeadText(a) : a));

  return (
    <Container
      size="lg"
      bg="background.2"
      maw="1200px"
      w="100%"
      p={0}
      m="0 auto"
    >
      <HeroTitle />

      {articles_elections.length > 0 ? (
        <FeaturedHero
          title="Elections"
          articles={withLead(articles_elections)}
          articleBasePath="/a"
          themeColor="brand"
          locale="en-GB"
          moreLink="/elections"
          moreLabel="More" />
      ) : null}

      {articles_context.length > 0 ? (
        <FeaturedHero
          title="Context"
          articles={withLead(articles_context)}
          articleBasePath="/a"
          themeColor="#5e66d5"
          locale="en-GB"
          moreLink="/context"
          moreLabel="More" />
      ) : null}

      <Testimonials />
    </Container>
  );
}
