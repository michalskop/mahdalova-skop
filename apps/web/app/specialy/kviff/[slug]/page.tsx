import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { Badge, Box, Button, Container, Divider, Group, Paper, SimpleGrid, Stack, Text, Title, Tooltip } from '@mantine/core';
import SupportBanner from '@/components/common/SupportBanner';
import SubscribeNewsletter from '@/components/common/SubscribeNewsletter';
import { getKviffBranch, kviffBranches } from '../data';
import {
  comparison2025,
  current2026,
  finalStats,
  formatNumber,
  industryShare2026,
  journalistsShare2026,
  maxTickets,
  passesShare2026,
  spendingRatio2026,
  ticketShare2026,
} from '../stats';
import { honoraryCrystalGlobeRecipients, honoraryDoubleWomanYears, honoraryGenderCounts, honoraryTotal, honoraryWomenShare } from '../honors';
import { completeBreakdownRows, filmCountAvailableRows, filmScaleByPeriod, firstScreeningsPerFilm, latestClosedFilmYear, latestScreeningsPerFilm, peakFilmYear } from '../films';
import { countryPresence2026, countryPresenceMax, countryPresenceTop, countryPresenceTotal, countryRegionTotals } from '../countries';
import { countryHistory, countryHistoryTopCountries } from '../countries-history';
import { continentHistory } from '../continents-history';
import HonoraryTimeline from '../HonoraryTimeline';
import ProgramBreakdownChart from '../ProgramBreakdownChart';
import FilmScreeningsChart from '../FilmScreeningsChart';
import FilmOriginsDashboard from '../FilmOriginsDashboard';
import ContinentStackedChart from '../ContinentStackedChart';
import { CommunistEraGrandPrix, PostRevolutionGrandPrix } from '../GrandPrixHistory';
import { grandPrixCommunistEra, grandPrixPostRevolution } from '../grandPrix';
import VerticalTimeline, { type TimelineEntry } from '../VerticalTimeline';
import { partnerCapitalLabels, partnerCapitalTotals, partnerExchangeRows } from '../partners';
import ChartFrame, { CHART_TRACK_BG, NUM_FONT } from '../ChartFrame';

type PageProps = {
  params: { slug: string };
};

const redirects: Record<string, string> = {
  'historie-festivalu-v-datech': '/specialy/kviff#historie',
  'crystal-globe': '/specialy/kviff/oceneni',
  'hoste-a-prestiz': '/specialy/kviff/oceneni',
  'oceneni-v-datech': '/specialy/kviff/oceneni',
  'mapa-filmu': '/specialy/kviff/filmy-a-svet',
  'temata-filmu': '/specialy/kviff/filmy-a-svet',
  'ekonomika-pozornosti': '/specialy/kviff/festival-a-penize',
  'trzby-filmu': '/specialy/kviff/festival-a-penize',
};

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

function formatPercent(value: number) {
  return `${value.toString().replace('.', ',')} %`;
}

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

function HonoraryGenderBlock() {
  return (
    <Box px={{ base: 16, md: 24 }} py={{ base: 20, md: 34 }}>
      <Stack gap="md">
        <Text size="xl" maw={760}>
          Od roku 1995 dostalo čestný Křišťálový globus {honoraryTotal} osobností. Žen bylo {honoraryGenderCounts.woman} z {honoraryTotal}, tedy {formatPercent(honoraryWomenShare)}. Ve většině ročníků nebyla mezi oceněnými ani jedna.
        </Text>
        <Text maw={760}>
          Soutěžní Křišťálový globus oceňuje film a rozhoduje o něm porota. Tato řada zachycuje čestné ocenění za dlouhodobý přínos světové kinematografii. Jediné roky, kdy je dostaly dvě ženy současně, byly {honoraryDoubleWomanYears.join(', ')}.
        </Text>
        <HonoraryDotTimeline />
      </Stack>
    </Box>
  );
}

function CrystalGlobeBlock() {
  return (
    <Box px={{ base: 16, md: 24 }} py={{ base: 20, md: 34 }}>
      <Stack gap="md">
        <CommunistEraGrandPrix winners={grandPrixCommunistEra} />
        <PostRevolutionGrandPrix winners={grandPrixPostRevolution} />
      </Stack>
    </Box>
  );
}

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

function FilmScaleBlock() {
  const maxFilms = peakFilmYear.totalFilms ?? 1;

  return (
    <Box px={{ base: 16, md: 24 }} py={{ base: 20, md: 34 }}>
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
              <DataBar key={row.period} label={row.period} value={row.avgFilms} max={maxFilms} color="var(--mantine-color-brandNavy-6)" />
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
    </Box>
  );
}

const capitalColors: Record<keyof typeof partnerCapitalLabels, string> = {
  money: 'var(--mantine-color-brandOrange-6)',
  service: 'var(--mantine-color-brandTeal-6)',
  access: 'var(--mantine-color-brandNavy-6)',
  image: 'var(--mantine-color-brand-6)',
  csr: 'var(--mantine-color-brandTeal-6)',
  media: 'var(--mantine-color-brandNavy-3)',
  craft: 'var(--mantine-color-brandOrange-7)',
  place: 'var(--mantine-color-brandNavy-6)',
};

function PartnerPrestigeBlock() {
  const capitalEntries = Object.entries(partnerCapitalTotals)
    .sort(([, a], [, b]) => b - a)
    .map(([capital, count]) => ({ capital: capital as keyof typeof partnerCapitalLabels, count }));

  return (
    <Box px={{ base: 16, md: 24 }} pb={{ base: 20, md: 34 }}>
      <ChartFrame
        title="Obchod s prestiží není jedna smlouva, ale celá infrastruktura"
        subtitle="Matice čte oficiálně komunikovaná partnerství podle typu vyměňovaného kapitálu, 60. ročník 2026"
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
            <Text fw={900} style={NUM_FONT} c="brand.7">{current2026.sponsorsShare} %</Text>
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
          <Text fw={900}>Odpověď ke sponzorům</Text>
          <Text size="sm" mt={6}>
            Festival není financovaný hlavně z veřejných peněz. V pracovním rozpočtu 60. ročníku držíme poměr 80 % soukromé zdroje a 20 % veřejné zdroje. Veřejná podpora je ale strategická: dává festivalu institucionální legitimitu a městu i kraji vrací turistickou a ekonomickou stopu. Soukromí partneři naopak kupují přístup k publiku, mediální pozornost, B2B prostředí a kulturní prestiž.
          </Text>
        </Paper>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <Paper p="lg" radius={4} bg="brandRoyalBlue.8" c="background.0">
            <Title order={3} size="1.05rem" mb="xs" >Teze pro čtení</Title>
            <Text c="background.2" size="lg">
              Festival má kulturní a mediální auru, partneři mají peníze, služby, distribuci nebo infrastrukturu. Vary jim neprodávají jen logo na plotě: prodávají přítomnost uvnitř události, kterou sledují diváci, média, politici, filmaři a byznys.
            </Text>
            <Text c="background.2" mt="md">
              Je to interpretace veřejně komunikovaných partnerství, ne důkaz jednotlivých obchodních jednání. Proto u každé vrstvy držíme zvlášť zdroj a faktickou oporu.
            </Text>
          </Paper>

          <Paper p="lg" radius={4} bg="background.0">
            <Title order={3} size="1.05rem" mb="md" >Mapa typu kapitálu</Title>
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
              Počet neznamená velikost peněz. Říká jen, jak často se daný typ hodnoty objevuje v naší redakční klasifikaci partnerství.
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
                          style={{ background: capitalColors[capital], color: 'var(--mantine-color-brandRoyalBlue-8)' }}
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
    </Box>
  );
}

export function generateStaticParams() {
  return [
    ...kviffBranches.map((branch) => ({ slug: branch.slug })),
    ...Object.keys(redirects).map((slug) => ({ slug })),
  ];
}

export function generateMetadata({ params }: PageProps): Metadata {
  const branch = getKviffBranch(params.slug);
  if (!branch) {
    const canonical = redirects[params.slug];
    return canonical
      ? { title: 'Karlovy Vary v datech', alternates: { canonical } }
      : { title: 'Analýza nenalezena' };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.mahdalova-skop.cz';
  const image = `${baseUrl}/images/specials/karlovy-vary.svg`;

  return {
    title: `${branch.title} | Karlovy Vary v datech`,
    description: branch.excerpt,
    alternates: { canonical: `/specialy/kviff/${branch.slug}` },
    openGraph: {
      title: `${branch.title} | Karlovy Vary v datech`,
      description: branch.excerpt,
      url: `/specialy/kviff/${branch.slug}`,
      type: 'article',
      images: [{ url: image, width: 1200, height: 630, alt: branch.title }],
    },
  };
}

export default function KviffBranchPage({ params }: PageProps) {
  if (redirects[params.slug]) permanentRedirect(redirects[params.slug]);

  const branch = getKviffBranch(params.slug);
  if (!branch) notFound();

  return (
    <Container size="lg" bg="background.1" maw="1200px" w="100%" p={0} m="0 auto">
      <Box component="article">
        <Box style={{ background: 'var(--mantine-color-brandNavy-9)' }} px={{ base: 18, md: 44 }} py={{ base: 36, md: 48 }}>
          <Stack gap={0} maw={760}>
            <Text
              size="xs"
              style={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}
            >
              <Link href="/specialy/kviff" style={{ color: 'inherit', textDecoration: 'none' }}>Karlovy Vary v datech</Link>
              {' · '}{branch.kicker}
            </Text>
            <Title
              order={1}
              style={{
                color: '#ffffff',
                fontFamily: 'var(--font-roboto-slab), Georgia, serif',
                fontSize: '1.8rem',
                fontWeight: 800,
                lineHeight: 1.2,
              }}
            >
              {branch.title}
            </Title>
            <Box style={{ width: 40, height: 3, background: branch.accent, marginTop: 16, marginBottom: 16 }} />
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: 1.5, maxWidth: 640 }}>
              {branch.excerpt}
            </Text>
          </Stack>
        </Box>

        <Box px={{ base: 16, md: 24 }} py={{ base: 12, md: 24 }}>
          <Stack gap="xl" maw={860}>
            {branch.sections.map((section) => (
              <Stack key={section.heading} gap="sm">
                <Title order={2} size="1.25rem" >{section.heading}</Title>
                {section.body.map((paragraph) => (
                  <Text key={paragraph} size="lg" lh={1.65}>{paragraph}</Text>
                ))}
              </Stack>
            ))}
          </Stack>
        </Box>

        {branch.slug === 'festival-a-penize' && (
          <Box px={{ base: 16, md: 24 }} py={{ base: 20, md: 34 }}>
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
                <a href="https://www.kviff.com/en/press/press-release/2026/517508.pdf">závěrečná zpráva 60. ročníku KVIFF</a>.
              </Text>
            </ChartFrame>

            <ChartFrame
              title="Soukromé zdroje pokryly čtyři pětiny rozpočtu"
              subtitle="Rozpočet festivalu a odhad útraty návštěvníků v Karlových Varech, 2026"
              source="KVIFF, údaje k 60. ročníku"
              fullWidth
            >
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                <Stack gap="sm">
                  <Text fw={900} style={{ ...NUM_FONT, fontSize: 30 }}>250 mil. Kč</Text>
                  <Text>rozpočet festivalu; přibližně 80 % připadalo na soukromé a 20 % na veřejné zdroje.</Text>
                </Stack>
                <Stack gap="sm">
                  <Text fw={900} style={{ ...NUM_FONT, fontSize: 30 }}>650 mil. Kč</Text>
                  <Text>odhad útraty návštěvníků ve městě. Částka popisuje dopad v Karlových Varech, nikoli příjem pořadatele.</Text>
                </Stack>
              </SimpleGrid>
            </ChartFrame>
          </Box>
        )}

        {branch.slug === 'festival-a-penize' && <PartnerPrestigeBlock />}

        {branch.slug === 'oceneni' && (
          <>
            <CrystalGlobeBlock />
            <HonoraryGenderBlock />
          </>
        )}
        {branch.slug === 'filmy-a-svet' && <FilmScaleBlock />}

        <Divider my="md" />

        <Box px={{ base: 16, md: 24 }} py={{ base: 24, md: 36 }}>
          <Group justify="space-between" align="end" mb="md">
            <Title order={2} size="1.5rem">Pokračujte ve speciálu</Title>
            <Button component={Link} href="/specialy/kviff#historie" variant="outline">Jak se festival proměnil od roku 1946</Button>
          </Group>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
            {kviffBranches
              .filter((item) => ['oceneni', 'filmy-a-svet', 'festival-a-penize'].includes(item.slug) && item.slug !== branch.slug)
              .map((item) => (
              <Paper
                key={item.slug}
                component={Link}
                href={`/specialy/kviff/${item.slug}`}
                p="md"
                radius={8}
                withBorder
                style={{ textDecoration: 'none', color: 'inherit', borderTop: `5px solid ${item.accent}` }}
              >
                <Text size="xs" fw={800} tt="uppercase" c="dimmed">{item.kicker}</Text>
                <Title order={4} size="0.95rem" mt={4} >{item.title}</Title>
              </Paper>
            ))}
          </SimpleGrid>
        </Box>

      </Box>

      <SupportBanner />
      <SubscribeNewsletter actionUrl="https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088" />
    </Container>
  );
}
