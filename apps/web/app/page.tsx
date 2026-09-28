// app/page.tsx
// 'use client';

import { Container } from '@mantine/core';
import { getArticles } from '@/components/common/getArticles';
// import { ArticlesGrid } from '@/components/common/ArticlesGrid';
import Testimonials from '@/components/common/Testimonials';
import HeroTitle from '@/components/frontpage/HeroTitle';
import SpecialsHero from '@/components/frontpage/SpecialsHero';
// import Citation from '@/components/frontpage/Citation';
// import SubscribeHH from '@/components/frontpage/SubscribeHH';
import SubscribeNewsletter from '@/components/common/SubscribeNewsletter';
import { ArticlesSection } from '@/components/common/ArticlesSection';
import { FeaturedHero } from '@/components/frontpage/FeaturedHero';
import type { Metadata } from 'next';
// import { ContactsBlock } from '@/components/common/ContactsBlock';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

export default async function HomePage() {
  // Zásobník článků na sekci – adaptivní mřížka z nich zobrazí tolik,
  // aby vyplnily celé řádky podle šířky displeje (3 na běžném desktopu, více na širokém).
  // Volby: červený pás na homepage (styl The Nerve) – vše s tagem „volby".
  const articles_elections = await getArticles(8, undefined, false, "volby");
  // Modrý „Výběr" pás = vše, co nepatří do Voleb (tag „volby"), Kontextu ani
  // Podcastů, čistě podle data od nejnovějšího (bez ručního `promoted`).
  const inRubric = (a: { filter?: string | string[] }, name: string) =>
    ([] as string[]).concat(a.filter ?? []).some((f) => f.toLowerCase() === name);
  const articles = (await getArticles(1000))
    .filter((a) => !a.tags?.includes("volby") && !inRubric(a, "kontext") && !inRubric(a, "podcast"))
    .slice(0, 8);
  const articles_contexts = await getArticles(8, "kontext");
  const articles_podcasts = await getArticles(8, "podcast");

  return (
    <Container 
      size="lg" 
      // py="xl"
      bg="background.2"
      maw="1200px"
      w="100%"
      p={0}
      m="0 auto"
    >
      <HeroTitle />

      {/* <Citation /> */}

      {/* <SubscribeHH /> */}

      <SpecialsHero sectionLink="/specialy" />

      {/* Volby = hlavní blok hned pod speciály (styl The Nerve): velký hlavní
          článek vlevo, 3 nejnovější vpravo + vlnovková šipka „Více" → /tag/volby.
          Červená („brand") zůstává po původní rubrice Analýzy; rubrika Analýzy
          zůstává na /analyzy, na homepě ji nahrazují Volby. */}
      <FeaturedHero
        articles={articles_elections}
        themeColor="brand"
        moreLink="/tag/volby" />

      <SubscribeNewsletter actionUrl='https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088'/>

      {/* Výběr (styl The Nerve): hlavní článek vlevo, 3 nejnovější vpravo +
          „Více" → /vyber. Nedubluje články z rubriky Volby (viz filtr výše). */}
      <FeaturedHero
        articles={articles}
        themeColor="#5e66d5"
        moreLink="/vyber" />

      {/* Kontext: oranžový pás bez nadpisu (jako Volby / Výběr), 3+3 karty ve
          dvou řadách a dole „Více" → /kontext. */}
      <ArticlesSection
        sectionTitle="Kontext"
        sectionLink="/kontext"
        articles={articles_contexts}
        themeColor="brandOrange.4" variant="standard"
        adaptiveRows={2} moreBelow />

      <ArticlesSection
        sectionTitle="Podcasty"
        sectionLink="/podcasty"
        articles={articles_podcasts}
        themeColor="brandRoyalBlue.9" variant="standard" />

      <Testimonials />

      {/* <ContactsBlock /> */}
    </Container>
  );
}
