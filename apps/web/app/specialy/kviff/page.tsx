import type { Metadata } from 'next';
import Link from 'next/link';
import { Anchor, Badge, Box, Button, Container, Group, Paper, SimpleGrid, Stack, Text, Title, Tooltip } from '@mantine/core';
import SupportBanner from '@/components/common/SupportBanner';
import SubscribeNewsletter from '@/components/common/SubscribeNewsletter';
import {
  comparison2025,
  current2026,
  formatNumber,
} from './stats';
import { honoraryCrystalGlobeRecipients, honoraryDoubleWomanYears, honoraryGenderCounts, honoraryTotal, honoraryWomenShare } from './honors';
import { completeBreakdownRows, filmCountAvailableRows, filmScaleByPeriod, firstScreeningsPerFilm, latestClosedFilmYear, latestScreeningsPerFilm, peakFilmYear } from './films';
import { countryHistory } from './countries-history';
import HonoraryTimeline from './HonoraryTimeline';
import ProgramBreakdownChart from './ProgramBreakdownChart';
import FilmScreeningsChart from './FilmScreeningsChart';
import FilmOriginsDashboard from './FilmOriginsDashboard';
import FilmOriginsTreemap from './FilmOriginsTreemap';
import HistoryScrolly from './HistoryScrolly';
import ContinentStackedChart from './ContinentStackedChart';
import { CommunistEraGrandPrix, PostRevolutionGrandPrix } from './GrandPrixHistory';
import { grandPrixCommunistEra, grandPrixPostRevolution } from './grandPrix';
import { partnerCapitalLabels, partnerCapitalTotals, partnerExchangeRows } from './partners';
import ChartFrame, { CHART_TRACK_BG, NUM_FONT } from './ChartFrame';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.mahdalova-skop.cz';
const COVER = `${BASE_URL}/images/specials/karlovy-vary.svg`;
const SOURCE_LINK = {
  color: 'var(--mantine-color-brandNavy-7)',
  fontWeight: 700,
  textDecorationColor: 'var(--mantine-color-brandNavy-4)',
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

function formatPercent(value: number) {
  return `${value.toString().replace('.', ',')} %`;
}

function DataBar({ label, value, max, color = 'var(--mantine-color-brandNavy-6)', suffix = '' }: { label: string; value: number; max: number; color?: string; suffix?: string }) {
  const width = Math.min(100, Math.round((value / max) * 1000) / 10);
  const display = suffix ? `${value.toString().replace('.', ',')} ${suffix}` : formatNumber(value);

  return (
    <Box style={{ display: 'grid', gridTemplateColumns: '104px 1fr 96px', gap: 12, alignItems: 'center', margin: '10px 0' }}>
      <Text fw={800}>{label}</Text>
      <Box h={16} bg={CHART_TRACK_BG} style={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box h="100%" w={`${width}%`} style={{ background: color, borderRadius: 3 }} />
      </Box>
      <Text ta="right" style={NUM_FONT} fw={800}>{display}</Text>
    </Box>
  );
}

function SectionKicker({ children }: { children: React.ReactNode }) {
  return (
    <Text tt="uppercase" size="xs" fw={900} c="brandNavy.7" style={{ letterSpacing: '0.1em' }}>
      {children}
    </Text>
  );
}

// ---- Ocenění a prestiž ------------------------------------------------

function HonoraryDotTimeline() {
  return (
    <ChartFrame
      title="Oceněné osobnosti v Karlových Varech"
      subtitle="Každá kostička je jedna oceněná osobnost, 1995–2026."
      source="Oficiální archiv KVIFF, ročník po ročníku"
      fullWidth
    >
      <HonoraryTimeline recipients={honoraryCrystalGlobeRecipients} />
      <Text mt="md" size="sm">
        Graf sleduje jedinou čestnou kategorii: Křišťálový globus za mimořádný umělecký přínos světové kinematografii. Soutěžní cenu pro film uděluje hlavní porota; tuto cenu dostávají osobnosti za dlouhodobou práci.
      </Text>
    </ChartFrame>
  );
}

function AwardsSection() {
  return (
    <Box component="section" id="oceneni" px={{ base: 20, md: 80 }} py={{ base: 48, md: 76 }}>
      <Stack gap="xl" maw={980}>
        <SectionKicker>Ceny a prestiž</SectionKicker>
        <Title order={2} style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>Kdo získal Křišťálový globus</Title>
        <Text size="xl" lh={1.7} maw={780}>
          Grand Prix – Křišťálový globus uděluje hlavní porota nejlepšímu filmu. Křišťálový globus za mimořádný umělecký přínos světové kinematografii dostávají herci, režiséři a další tvůrci za dlouhodobou práci. Jsou to dvě různé ceny se stejným jménem.
        </Text>

        <Title order={3} size="1.35rem" mt="md">Čestný Křišťálový globus častěji získávají muži</Title>
        <Text size="xl" lh={1.7} maw={780}>
          Od roku 1995 dostalo čestný Křišťálový globus {honoraryTotal} osobností. Žen bylo {honoraryGenderCounts.woman} z {honoraryTotal}, tedy {formatPercent(honoraryWomenShare)}. Ve většině ročníků nebyla mezi oceněnými ani jedna; dvě ženy najednou cenu dostaly jen v letech {honoraryDoubleWomanYears.join(', ')}.
        </Text>
        <HonoraryDotTimeline />
        <Text size="sm" c="dimmed" maw={780}>
          U každé osobnosti uvádíme rok, zemi, profesi a veřejně doložený gender. Tooltip doplňuje zdůvodnění ceny, pokud je festival nebo dobový tisk zveřejnil.
        </Text>

        <Title order={3} size="1.35rem" mt="lg">Grand Prix: od sovětské nadvlády k otevřené soutěži</Title>
        <Text size="lg" lh={1.7} maw={780}>
          Historické státy, například Československo, Sovětský svaz nebo NDR, ponecháváme v podobě uvedené v dobovém archivu. Přepis na dnešní hranice by zakryl politické uspořádání tehdejšího festivalu.
        </Text>
        <Stack gap="md" mt="md">
          <CommunistEraGrandPrix winners={grandPrixCommunistEra} />
          <PostRevolutionGrandPrix winners={grandPrixPostRevolution} />
        </Stack>
      </Stack>
    </Box>
  );
}

// ---- Filmy a svět -------------------------------------------------------

function ProgramCompositionGraphic({ maxFilms }: { maxFilms: number }) {
  const maxBreakdownFilms = Math.max(...completeBreakdownRows.map((row) => row.totalFilms ?? 0));

  return (
    <ChartFrame
      title="Hrané filmy tvoří přibližně šest desetin katalogu"
      subtitle="Hrané celovečerní filmy, celovečerní dokumenty a krátké filmy v ročnících s úplným členěním programu"
      source="Oficiální finální statistiky ročníků KVIFF"
      fullWidth
    >
      <Text maw={760} mb="lg">
        Graf zahrnuje pouze ročníky, u nichž závěrečná zpráva rozlišuje všechny tři vzájemně se vylučující kategorie. Starší souhrny často uvádějí jen celkový počet filmů, a proto je do skladby programu nedoplňujeme.
      </Text>
      <ProgramBreakdownChart rows={completeBreakdownRows} maxBreakdownFilms={maxBreakdownFilms} />
      <Text mt="lg">
        Hrané celovečerní filmy tvoří v dostupných ročnících přibližně šest desetin programu. Krátké filmy byly v roce 2025 početnější než celovečerní dokumenty.
      </Text>
    </ChartFrame>
  );
}

function FilmsSection() {
  const maxFilms = peakFilmYear.totalFilms ?? 1;

  return (
    <Box component="section" id="filmy-a-svet" bg="background.2" px={{ base: 20, md: 80 }} py={{ base: 48, md: 76 }}>
      <Stack gap="xl" maw={1040}>
        <SectionKicker>Program a země</SectionKicker>
        <Title order={2} style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>Odkud přijíždějí filmy</Title>
        <Text size="xl" lh={1.7} maw={780}>
          Analyzujeme produkční země filmů v digitálně dostupném archivu KVIFF z let 1992–2026. Francie, Německo a Česko tvoří nejhustší část koprodukční sítě; mimo Evropu se nejčastěji objevují Spojené státy.
        </Text>
        <Text size="lg" lh={1.7} maw={780}>
          Jeden film může mít několik produkčních zemí. V mapě proto počítáme vazby film–země: francouzsko-německo-česká koprodukce přidá jednu účast každé ze tří zemí. Součet těchto vazeb je vyšší než počet unikátních filmů.
        </Text>

        <FilmOriginsTreemap />

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <ChartFrame
            title="Odkud přijíždějí filmy na festival v Karlových Varech"
            subtitle={`Bublina = produkční země; velikost podle počtu filmů, u kterých je země uvedena. Dataset pokrývá ${countryHistory.length} ročníků novodobé éry.`}
            source="Oficiální archiv filmu KVIFF, lokální country export"
            headerContent={<div id="kviff-map-mode-toggle" />}
            fullWidth
          >
            <FilmOriginsDashboard />
          </ChartFrame>

          <ChartFrame
            title="Méně titulů dostává více projekcí"
            subtitle="Průměrný počet filmů podle období, 1995–2025"
            source="Oficiální finální statistiky ročníků KVIFF"
          >
            <Text size="lg">
              Nejvíc filmů v dostupné řadě má rok {peakFilmYear.year}: {peakFilmYear.totalFilms} titulů. Uzavřený rok {latestClosedFilmYear.year} má {latestClosedFilmYear.totalFilms} filmů, ale {latestClosedFilmYear.screenings} projekcí. Jeden film tak dnes připadá zhruba na {latestScreeningsPerFilm.toString().replace('.', ',')} projekce; v roce 1996 to bylo {firstScreeningsPerFilm.toString().replace('.', ',')}.
            </Text>
            <Text mt="sm">
              Samotný počet filmů měří šířku katalogu. Počet projekcí naopak ukazuje, kolik prostoru dostane jeden vybraný titul v programu a jak reálně dostupný může být pro diváky.
            </Text>
            <Stack gap="sm" mt="lg">
              {filmScaleByPeriod.map((row) => (
                <DataBar key={row.period} label={row.period} value={row.avgFilms} max={maxFilms} />
              ))}
            </Stack>
            <Text mt="md" c="dimmed">Sloupce ukazují průměrný počet filmů v období. Projekce držíme odděleně, protože jedna země může mít méně titulů, ale výraznější festivalovou přítomnost.</Text>
          </ChartFrame>

          <ChartFrame
            title="Počet projekcí neklesl stejně rychle jako počet filmů"
            subtitle="Filmy a projekce ve festivalovém programu, 1996–2025"
            source="Oficiální finální statistiky ročníků KVIFF"
            fullWidth
          >
            <FilmScreeningsChart
              rows={filmCountAvailableRows}
              maxFilms={maxFilms}
              peakYear={peakFilmYear.year}
              latestClosedYear={latestClosedFilmYear.year}
            />
            <Text mt="md" size="sm">
              Počet filmů měří šířku katalogu, počet projekcí počet jednotlivých uvedení. Užší katalog proto automaticky neznamená méně příležitostí film vidět.
            </Text>
          </ChartFrame>

          <ProgramCompositionGraphic maxFilms={maxFilms} />

          <ChartFrame
            title="Evropa zůstává v programu dominantní po celé novodobé období"
            subtitle="Počet filmů se zastoupením daného kontinentu, 1992–2026; přepínání mezi počty a podíly"
            source="kviff_continents_corrected_all_years.csv – opravený souhrn proti dvojímu počítání kontinentů u koprodukcí"
            fullWidth
          >
            <ContinentStackedChart />
          </ChartFrame>
        </SimpleGrid>

        <Text lh={1.7} maw={780}>
          Evropa zůstává jádrem katalogu po celé novodobé období. Zřetelnější změnou je růst koprodukcí, které spojují více zemí v jednom filmu. Předlistopadové ročníky do stejného srovnání nezařazujeme, protože pro ně nemáme stejně úplný katalog filmů a produkčních zemí.
        </Text>
      </Stack>
    </Box>
  );
}

// ---- Festival a peníze ---------------------------------------------------

const capitalColors: Record<keyof typeof partnerCapitalLabels, string> = {
  money: 'var(--mantine-color-brandOrange-6)',
  service: 'var(--mantine-color-brandTeal-6)',
  access: 'var(--mantine-color-brandNavy-6)',
  image: 'var(--mantine-color-brandYellow-8)',
  csr: 'var(--mantine-color-brandTeal-6)',
  media: 'var(--mantine-color-brandNavy-3)',
  craft: 'var(--mantine-color-brandOrange-7)',
  place: 'var(--mantine-color-brandNavy-6)',
};

const capitalTextOnDark: Record<keyof typeof partnerCapitalLabels, boolean> = {
  money: true,
  service: true,
  access: true,
  image: false,
  csr: true,
  media: true,
  craft: true,
  place: true,
};

function PartnerPrestigeBlock() {
  const capitalEntries = Object.entries(partnerCapitalTotals)
    .sort(([, a], [, b]) => b - a)
    .map(([capital, count]) => ({ capital: capital as keyof typeof partnerCapitalLabels, count }));

  return (
    <ChartFrame
      title="Festival prodává partnerům přístup k publiku, pozornosti a prestiži"
      subtitle="Oficiálně komunikovaná partnerství 60. ročníku (2026) podle typu vyměňovaného kapitálu"
      source="Oficiální stránka partnerů KVIFF"
      fullWidth
    >
      <Group justify="flex-end" mb="lg">
        <Button component="a" href="https://www.kviff.com/cs/o-nas/partneri" target="_blank" rel="noopener noreferrer" variant="outline" color="dark">
          Zdroj KVIFF
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="sm" mb="md">
        <Paper p="md" radius={4} bg="background.0">
          <Text fw={900} style={NUM_FONT}>{current2026.budgetMil} mil. Kč</Text>
          <Text size="sm">rozpočet 60. ročníku</Text>
        </Paper>
        <Paper p="md" radius={4} bg="background.0">
          <Text fw={900} style={NUM_FONT} c="brandYellow.8">{current2026.sponsorsShare} %</Text>
          <Text size="sm">soukromí partneři a sponzoři</Text>
        </Paper>
        <Paper p="md" radius={4} bg="background.0">
          <Text fw={900} style={NUM_FONT} c="brandNavy.7">{current2026.publicShare} %</Text>
          <Text size="sm">veřejné zdroje</Text>
        </Paper>
        <Paper p="md" radius={4} bg="background.0">
          <Text fw={900} style={NUM_FONT}>{current2026.spendingMil} mil. Kč</Text>
          <Text size="sm">odhad útraty lidí ve městě</Text>
        </Paper>
      </SimpleGrid>

      <Paper p="md" radius={4} bg="background.0" mb="md">
        <Text fw={900}>Festival platí hlavně soukromé zdroje, ne veřejné rozpočty</Text>
        <Text size="sm" mt={6}>
          U 60. ročníku připadlo přibližně 80 % rozpočtu na soukromé partnery a sponzory a 20 % na veřejné zdroje. Menší veřejná podpora je přitom strategická: dává festivalu institucionální legitimitu a městu i kraji vrací turistickou a ekonomickou stopu. Soukromí partneři kupují přístup k publiku, mediální pozornost, B2B prostředí a kulturní prestiž.
        </Text>
      </Paper>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Paper p="lg" radius={4} bg="brandNavy.8" c="background.0">
          <Title order={3} size="1.05rem" mb="xs">Za co partneři platí</Title>
          <Text c="background.2" size="lg">
            Festival má kulturní a mediální auru, partneři mají peníze, služby, distribuci nebo infrastrukturu. Vary jim prodávají přítomnost uvnitř události, kterou sledují diváci, média, politici, filmaři a byznys.
          </Text>
          <Text c="background.2" mt="md">
            Následující řádky čtou veřejně komunikovaná partnerství, ne jednotlivá obchodní jednání. Zdroj má proto každá vrstva zvlášť.
          </Text>
        </Paper>

        <Paper p="lg" radius={4} bg="background.0">
          <Title order={3} size="1.05rem" mb="md">Mapa typu kapitálu</Title>
          <Stack gap="xs">
            {capitalEntries.map(({ capital, count }) => (
              <Group key={capital} gap="sm" wrap="nowrap">
                <Box w={14} h={14} bg={capitalColors[capital]} style={{ borderRadius: 3, flex: '0 0 auto' }} />
                <Text style={{ flex: 1 }} fw={800}>{partnerCapitalLabels[capital]}</Text>
                <Text style={NUM_FONT} fw={900}>{count}×</Text>
              </Group>
            ))}
          </Stack>
          <Text mt="md" size="sm" c="dimmed">
            Počet neznamená velikost peněz. Ukazuje, jak často se daný typ hodnoty v partnerstvích objevuje.
          </Text>
        </Paper>
      </SimpleGrid>

      <Stack gap="md" mt="md">
        {partnerExchangeRows.map((row) => (
          <Tooltip key={row.segment} label={`${row.evidence} Zdroj: ${row.sourceLabel}`} multiline maw={420} withArrow>
            <Paper p="md" radius={4} bg="background.0">
              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                <Stack gap={6}>
                  <Text size="xs" fw={900} tt="uppercase" c="dimmed">{row.segment}</Text>
                  <Group gap={6}>
                    {row.partners.map((partner) => (
                      <Badge key={partner} variant="light" color="dark">{partner}</Badge>
                    ))}
                  </Group>
                  <Group gap={6}>
                    {row.capital.map((capital) => (
                      <Badge
                        key={capital}
                        variant="filled"
                        style={{ background: capitalColors[capital], color: capitalTextOnDark[capital] ? '#ffffff' : 'var(--mantine-color-brandNavy-9)' }}
                      >
                        {partnerCapitalLabels[capital]}
                      </Badge>
                    ))}
                  </Group>
                </Stack>

                <Stack gap={6}>
                  <Text fw={900}>Partner dává festivalu</Text>
                  {row.givesFestival.map((item) => (
                    <Text key={item} size="sm">– {item}</Text>
                  ))}
                </Stack>

                <Stack gap={6}>
                  <Text fw={900}>Festival vrací partnerovi</Text>
                  {row.getsFromFestival.map((item) => (
                    <Text key={item} size="sm">– {item}</Text>
                  ))}
                  <Button component="a" href={row.sourceUrl} target="_blank" rel="noopener noreferrer" variant="subtle" color="dark" px={0} w="fit-content">
                    Otevřít zdroj
                  </Button>
                </Stack>
              </SimpleGrid>
            </Paper>
          </Tooltip>
        ))}
      </Stack>
    </ChartFrame>
  );
}

function MoneySection() {
  return (
    <Box component="section" id="festival-a-penize" px={{ base: 20, md: 80 }} py={{ base: 48, md: 76 }}>
      <Stack gap="xl" maw={1040}>
        <SectionKicker>Návštěvnost a financování</SectionKicker>
        <Title order={2} style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>Festival, publikum a peníze</Title>
        <Text size="xl" lh={1.7} maw={780}>
          Prodané vstupenky, akreditace, rozpočet a partnerství měří různé části festivalového provozu – neslučujeme je do jednoho čísla, protože každý popisuje jinou skupinu lidí nebo jiný typ zdroje.
        </Text>

        <ChartFrame
          title="Šedesátý ročník přidal projekce i akreditované profesionály"
          subtitle="Vybrané ukazatele roku 2026 ve srovnání s posledním předchozím ročníkem"
          source="Závěrečné zprávy KVIFF 2025 a 2026"
          fullWidth
        >
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            <Stack gap={6}>
              <Text fw={900} style={{ ...NUM_FONT, fontSize: 30 }}>{formatNumber(current2026.tickets)}</Text>
              <Text>prodaných vstupenek v roce 2026</Text>
              <Text size="sm" c="dimmed">V roce 2025 jich bylo {formatNumber(comparison2025.tickets)}.</Text>
            </Stack>
            <Stack gap={6}>
              <Text fw={900} style={{ ...NUM_FONT, fontSize: 30 }}>{formatNumber(current2026.screenings)}</Text>
              <Text>filmových projekcí</Text>
              <Text size="sm" c="dimmed">O sedm více než v roce 2025.</Text>
            </Stack>
            <Stack gap={6}>
              <Text fw={900} style={{ ...NUM_FONT, fontSize: 30 }}>{formatNumber(current2026.industry)}</Text>
              <Text>akreditovaných filmových profesionálů</Text>
              <Text size="sm" c="dimmed">V roce 2025 jich bylo {formatNumber(comparison2025.industry)}.</Text>
            </Stack>
          </SimpleGrid>
          <Text mt="xl" maw={780}>
            Vstupenka zachycuje návštěvu jedné projekce, nikoli jednoho člověka. Proto tento údaj nesrovnáváme s počtem festivalových pasů ani akreditací. Podrobnosti uvádí{' '}
            <Anchor href="https://www.kviff.com/en/press/press-release/2026/517508.pdf" target="_blank" rel="noopener noreferrer" style={SOURCE_LINK}>závěrečná zpráva 60. ročníku KVIFF</Anchor>.
          </Text>
        </ChartFrame>

        <PartnerPrestigeBlock />
      </Stack>
    </Box>
  );
}

// ---- Landing page ---------------------------------------------------------

export default function KarlovyVarySpecialPage() {
  return (
    <Container size="lg" bg="background.1" maw={1200} w="100%" p={0} m="0 auto">
      <Box component="article">
        <Box component="header" bg="brandNavy.9" c="background.0">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing={0}>
            <Stack gap="lg" p={{ base: 24, md: 52 }} justify="center" mih={{ base: 0, md: 620 }}>
              <Text tt="uppercase" size="xs" fw={900} c="brandYellow.5" style={{ letterSpacing: '0.12em' }}>
                Datový speciál
              </Text>
              <Title order={1} style={{ fontSize: 'clamp(2.8rem, 7vw, 6rem)', lineHeight: 0.94 }}>
                Karlovy Vary v datech
              </Title>
              <Text size="xl" maw={650} c="background.2" lh={1.55}>
                Festival za osmdesát let přežil státní propagandu, střídání s Moskvou, nejistotu po revoluci i pandemii. Jeho program a ceny dnes ukazují, odkud přichází evropský film a komu kulturní instituce přiznávají trvalou prestiž.
              </Text>
              <Group gap="lg" mt="md">
                <Anchor href="#oceneni" style={{ color: 'var(--mantine-color-brandYellow-5)', fontWeight: 700 }}>Ceny a prestiž</Anchor>
                <Anchor href="#filmy-a-svet" style={{ color: 'var(--mantine-color-brandYellow-5)', fontWeight: 700 }}>Filmy a svět</Anchor>
                <Anchor href="#festival-a-penize" style={{ color: 'var(--mantine-color-brandYellow-5)', fontWeight: 700 }}>Festival a peníze</Anchor>
              </Group>
            </Stack>
            <Box
              role="img"
              aria-label="Logo speciálu Vary s piktogramem Křišťálového globusu"
              style={{
                minHeight: 'clamp(220px, 35vw, 360px)',
                backgroundImage: 'url(/images/specials/karlovy-vary.svg)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
              }}
            />
          </SimpleGrid>
        </Box>

        <Box component="section" id="historie" px={{ base: 20, md: 48 }} py={{ base: 42, md: 72 }}>
          <Stack gap="lg" maw={1180} m="0 auto">
            <SectionKicker>Historie festivalu</SectionKicker>
            <Title order={2} style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              Šedesátý ročník přišel až osmdesát let po prvním
            </Title>
            <HistoryScrolly />
            <Text size="sm" c="dimmed" maw={820}>
              Zdroj: <Anchor href="https://www.kviff.com/en/about-us/festival-description" target="_blank" rel="noopener noreferrer" style={SOURCE_LINK}>oficiální historie KVIFF</Anchor>. Novodobá datová řada tohoto speciálu začíná rokem 1994, kdy se festival vrátil ke každoročnímu rytmu; u starších ročníků nejsou katalogy stejně úplné.
            </Text>
          </Stack>
        </Box>

        <AwardsSection />
        <FilmsSection />
        <MoneySection />
      </Box>

      <SupportBanner />
      <SubscribeNewsletter actionUrl="https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088" />
    </Container>
  );
}
