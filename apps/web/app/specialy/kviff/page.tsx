import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Anchor, Box, Container, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import SupportBanner from '@/components/common/SupportBanner';
import SubscribeNewsletter from '@/components/common/SubscribeNewsletter';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.mahdalova-skop.cz';
const COVER = `${BASE_URL}/images/specials/karlovy-vary.svg`;
const SOURCE_LINK = {
  color: 'var(--mantine-color-brand-7)',
  fontWeight: 700,
  textDecorationColor: 'var(--mantine-color-brand-4)',
  textUnderlineOffset: 3,
} as const;

export const metadata: Metadata = {
  title: 'Karlovy Vary v datech',
  description: 'Jak se z poválečné filmové přehlídky stal největší festival v Česku a komu dnes dává prostor, ceny a prestiž.',
  alternates: { canonical: '/specialy/kviff' },
  openGraph: {
    title: 'Karlovy Vary v datech',
    description: 'Jak se z poválečné filmové přehlídky stal největší festival v Česku a komu dnes dává prostor, ceny a prestiž.',
    url: '/specialy/kviff',
    type: 'website',
    images: [{ url: COVER, width: 1200, height: 630, alt: 'Karlovy Vary v datech' }],
  },
};

function StoryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Anchor component={Link} href={href} style={SOURCE_LINK}>
      {children}
    </Anchor>
  );
}

export default function KarlovyVarySpecialPage() {
  return (
    <Container size="lg" bg="background.1" maw={1200} w="100%" p={0} m="0 auto">
      <Box component="article">
        <Box component="header" bg="brandNavy.9" c="background.0">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing={0}>
            <Stack gap="lg" p={{ base: 24, md: 52 }} justify="center" mih={{ base: 0, md: 620 }}>
              <Text tt="uppercase" size="xs" fw={900} c="brand.4" style={{ letterSpacing: '0.12em' }}>
                Datový speciál
              </Text>
              <Title order={1} style={{ fontSize: 'clamp(2.8rem, 7vw, 6rem)', lineHeight: 0.94 }}>
                Karlovy Vary v datech
              </Title>
              <Text size="xl" maw={650} c="background.2" lh={1.55}>
                Festival za osmdesát let přežil státní propagandu, střídání s Moskvou, nejistotu po revoluci i pandemii. Jeho program a ceny dnes ukazují, odkud přichází evropský film a komu kulturní instituce přiznávají trvalou prestiž.
              </Text>
            </Stack>
            <Box
              role="img"
              aria-label="Logo speciálu Vary s piktogramem Křišťálového globusu"
              style={{
                minHeight: 'clamp(180px, 35vw, 360px)',
                backgroundImage: 'url(/images/specials/karlovy-vary.svg)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
              }}
            />
          </SimpleGrid>
        </Box>

        <Stack component="section" gap="xl" px={{ base: 20, md: 80 }} py={{ base: 42, md: 72 }} maw={940}>
          <Text size="xl" lh={1.7}>
            V červenci 2026 se v Karlových Varech konal 60. ročník festivalu. Od jeho založení přitom uplynulo osmdesát let. Rozdíl dvaceti ročníků nevznikl jednou dlouhou přestávkou: od roku 1959 se Vary střídaly s mezinárodním festivalem v Moskvě, v roce 1993 se přehlídka nekonala a novodobou každoroční řadu přerušila pandemie v roce 2020.
          </Text>
          <Text size="lg" lh={1.7}>
            První ročník začal v roce 1946 hlavně v Mariánských Lázních. Karlovy Vary byly zpočátku druhým dějištěm a festival ještě neměl soutěž. Křišťálový globus se poprvé uděloval v roce 1948, dva roky nato se přehlídka natrvalo přestěhovala do Varů a v roce 1956 získala od FIAPF kategorii A.
          </Text>
          <Text size="sm" c="dimmed">
            Zdroj: <Anchor href="https://www.kviff.com/en/about-us/festival-description" target="_blank" rel="noopener noreferrer" style={SOURCE_LINK}>oficiální historie KVIFF</Anchor>.
          </Text>
        </Stack>

        <Box component="section" bg="background.2" px={{ base: 20, md: 80 }} py={{ base: 42, md: 72 }}>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing={{ base: 'xl', md: 64 }}>
            <Stack gap="md">
              <Text fw={900} c="brand.7">1948–1990</Text>
              <Title order={2}>Cena sloužila filmu i státní politice</Title>
              <Text size="lg" lh={1.7}>
                Po únoru 1948 ovládla dramaturgii znárodněná kinematografie. Vedle hlavní ceny se udělovaly ceny míru, práce nebo sociálního pokroku. Ani tehdy však nevyhrávaly výhradně filmy sovětského bloku: hlavní cenu získaly také snímky z USA, Francie, Indie, Japonska či Austrálie.
              </Text>
              <Text size="lg" lh={1.7}>
                Od roku 1960 připadly Varům sudé roky a Moskvě liché. Toto politické rozhodnutí vysvětluje největší část rozdílu mezi stářím festivalu a počtem ročníků.
              </Text>
              <StoryLink href="/specialy/kviff/oceneni">Které filmy získaly Křišťálový globus a komu Vary dávají čestné ceny</StoryLink>
            </Stack>
            <Box style={{ borderLeft: '4px solid var(--mantine-color-brand-6)' }} pl={{ base: 20, md: 32 }}>
              <Text size="xl" lh={1.65}>
                Z šestadvaceti hlavních cen udělených do roku 1989 připadlo dvacet filmům ze sovětského bloku. Zbývajících šest připomíná, že ani státem řízený festival nebyl po celou dobu uzavřenou přehlídkou spojenců Moskvy.
              </Text>
            </Box>
          </SimpleGrid>
        </Box>

        <Stack component="section" gap="xl" px={{ base: 20, md: 80 }} py={{ base: 48, md: 80 }} maw={980}>
          <Text fw={900} c="brand.7">1994</Text>
          <Title order={2} style={{ fontSize: 'clamp(1.8rem, 4vw, 3.2rem)' }}>
            Bartoška a Zaoralová vrátili festivalu každoroční rytmus
          </Title>
          <Text size="xl" lh={1.7}>
            Po sametové revoluci zmizel ideologický dohled, nikoli organizační nejistota. V roce 1990 nebyla udělena hlavní cena a ročník 1993 se nekonal. O rok později převzal festival tým Jiřího Bartošky a Evy Zaoralové. Znovu se konal každoročně a začal systematicky budovat program, zahraniční kontakty i digitální archiv.
          </Text>
          <Text size="lg" lh={1.7}>
            Právě rok 1994 je předělem i pro tento speciál. U novodobých ročníků známe podstatně úplněji filmy, produkční země, projekce, hosty a prodané vstupenky. Starší katalogy proto nesrovnáváme se stejnou přesností.
          </Text>
          <StoryLink href="/specialy/kviff/filmy-a-svet">Jak se od devadesátých let změnily země zastoupené v programu</StoryLink>
        </Stack>

        <Box component="section" bg="brandRoyalBlue.8" c="background.0" px={{ base: 20, md: 80 }} py={{ base: 48, md: 76 }}>
          <Stack gap="lg" maw={860}>
            <Text fw={900} c="brand.3">2026</Text>
            <Title order={2}>Šedesátý ročník prodal 132 553 vstupenek</Title>
            <Text size="xl" c="background.2" lh={1.65}>
              Festival uvedl 179 filmů na 472 projekcích. Akreditovalo se 11 014 lidí, z toho 1 249 profesionálů filmového průmyslu a 598 novinářů. Prodané vstupenky nejsou počet unikátních návštěvníků: jeden člověk může navštívit více projekcí.
            </Text>
            <Text size="sm" c="background.3">
              Zdroj: <Anchor href="https://www.kviff.com/en/press/press-release/2026/517508.pdf" target="_blank" rel="noopener noreferrer" style={{ ...SOURCE_LINK, color: 'var(--mantine-color-brand-3)' }}>závěrečná zpráva 60. KVIFF</Anchor>.
            </Text>
            <StoryLink href="/specialy/kviff/festival-a-penize">Kdo festival financuje a co znamenají jeho návštěvnická čísla</StoryLink>
          </Stack>
        </Box>

        <Stack component="section" gap="lg" px={{ base: 20, md: 80 }} py={{ base: 48, md: 76 }} maw={900}>
          <Title order={2}>Tři otázky, které drží speciál pohromadě</Title>
          <Text size="lg" lh={1.7}>
            Kdo získává hlavní a čestné ceny? Odkud přicházejí filmy? A kdo platí provoz události, která na devět dní promění město? Odpovědi jsou rozdělené do tří analýz, protože každá stojí na jiných datech. Dohromady popisují festival jako program, instituci i veřejnou událost.
          </Text>
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
            <StoryLink href="/specialy/kviff/oceneni">Ocenění a prestiž</StoryLink>
            <StoryLink href="/specialy/kviff/filmy-a-svet">Filmy a svět</StoryLink>
            <StoryLink href="/specialy/kviff/festival-a-penize">Festival a peníze</StoryLink>
          </SimpleGrid>
        </Stack>
      </Box>

      <SupportBanner />
      <SubscribeNewsletter actionUrl="https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088" />
    </Container>
  );
}
