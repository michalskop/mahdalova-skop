// app/page.tsx
// 'use client';

import { Container } from '@mantine/core';
import { getArticles, getPublishedAt, comparePublishedAt, withLeadText } from '@/components/common/getArticles';
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

  // Volby 🔴 × Výběr 🔵 se automaticky prohazují: pás s aktuálnějším nejnovějším
  // článkem jde hned pod Speciály, druhý pod newsletter. Rozhoduje den, při
  // stejném dni skrytá hodina (frontmatter `time`), když ji mají oba články;
  // při remíze zůstávají nahoře Volby. Statický export → pořadí se přepočítá
  // při každém buildu (= každém deployi nového článku).
  // Velká karta vlevo dostane navazující text z těla článku, aby perex
  // vyplnil celou výšku karty a nevznikla díra (viz FeaturedHero).
  const withLead = <T extends Parameters<typeof withLeadText>[0]>(list: T[]) =>
    list.map((a, i) => (i === 0 ? withLeadText(a) : a));
  const electionsHero = (
    <FeaturedHero
      articles={withLead(articles_elections)}
      themeColor="brand"
      moreLink="/tag/volby" />
  );
  const selectionHero = (
    <FeaturedHero
      articles={withLead(articles)}
      themeColor="#5e66d5"
      moreLink="/vyber" />
  );
  const selectionFirst =
    articles.length > 0 &&
    (articles_elections.length === 0 ||
      comparePublishedAt(getPublishedAt(articles[0]), getPublishedAt(articles_elections[0])) > 0);
  const [upperHero, lowerHero] = selectionFirst
    ? [selectionHero, electionsHero]
    : [electionsHero, selectionHero];

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

      {/* Volby (červená „brand", → /tag/volby) a Výběr (modrá, → /vyber; nedubluje
          Volby) – styl The Nerve: velký hlavní článek vlevo, 3 nejnovější vpravo.
          Pořadí obou pásů je automatické, viz selectionFirst výše. */}
      {upperHero}

      <SubscribeNewsletter actionUrl='https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088'/>

      {lowerHero}

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
