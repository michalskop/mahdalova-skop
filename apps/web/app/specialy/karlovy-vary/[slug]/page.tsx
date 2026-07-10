import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, Box, Button, Container, Divider, Group, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import SupportBanner from '@/components/common/SupportBanner';
import SubscribeNewsletter from '@/components/common/SubscribeNewsletter';
import { getKviffBranch, kviffBranches, kviffSources } from '../data';
import {
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
import { honoraryByPeriod, honoraryCrystalGlobeRecipients, honoraryGenderCounts, honoraryTotal, honoraryWomenShare } from '../honors';
import { completeBreakdownRows, filmScaleByPeriod, firstScreeningsPerFilm, latestClosedFilmYear, latestScreeningsPerFilm, peakFilmYear } from '../films';

type PageProps = {
  params: { slug: string };
};

function DataBar({ label, value, max, color = '#547ca8', suffix = '' }: { label: string; value: number; max: number; color?: string; suffix?: string }) {
  const width = Math.min(100, Math.round((value / max) * 1000) / 10);
  const display = suffix ? `${value.toString().replace('.', ',')} ${suffix}` : formatNumber(value);

  return (
    <Box style={{ display: 'grid', gridTemplateColumns: '104px 1fr 96px', gap: 12, alignItems: 'center', margin: '10px 0' }}>
      <Text fw={800}>{label}</Text>
      <Box h={22} bg="#efe7d8" style={{ borderRadius: 999, overflow: 'hidden', border: '1px solid #ded2bf' }}>
        <Box h="100%" w={`${width}%`} style={{ background: color, borderRadius: 999 }} />
      </Box>
      <Text ta="right" ff="monospace" fw={800}>{display}</Text>
    </Box>
  );
}

function GenderSplitBar({ label, women, men }: { label: string; women: number; men: number }) {
  const total = women + men;
  const womenWidth = total ? Math.round((women / total) * 1000) / 10 : 0;

  return (
    <Stack gap={4}>
      <Group justify="space-between">
        <Text fw={800}>{label}</Text>
        <Text ff="monospace" fw={800}>{women} žen / {men} mužů</Text>
      </Group>
      <Box h={24} bg="#d9e1e7" style={{ borderRadius: 999, overflow: 'hidden', border: '1px solid #c8d3da' }}>
        <Box h="100%" w={`${womenWidth}%`} style={{ background: '#c95b7a', borderRadius: 999 }} />
      </Box>
    </Stack>
  );
}

function HonoraryGenderBlock() {
  const latestRecipients = honoraryCrystalGlobeRecipients.slice(-8).reverse();

  return (
    <Box px={{ base: 16, md: 24 }} py={{ base: 20, md: 34 }}>
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Paper p="lg" radius={8} withBorder bg="#fffdf8">
          <Badge w="fit-content" color="pink" variant="light" mb="sm">Hotový genderový graf</Badge>
          <Title order={2} mb="xs" style={{ fontFamily: "'Roboto Slab', Georgia, serif" }}>Čestná prestiž je pořád hlavně mužská</Title>
          <Text size="lg">
            V řadě Crystal Globe za mimořádný umělecký přínos světu filmu evidujeme od roku 1998 do oznámených poct roku 2026 celkem {honoraryTotal} oceněných osobností. Žen je {honoraryGenderCounts.woman}, tedy {honoraryWomenShare.toString().replace('.', ',')} %.
          </Text>
          <Stack gap="md" mt="lg">
            {honoraryByPeriod.map((row) => (
              <GenderSplitBar key={row.period} label={row.period} women={row.woman} men={row.man} />
            ))}
          </Stack>
          <Text mt="md" c="dimmed">
            Gender uvádíme podle veřejně prezentované identity osobností; kde by nebyla jistota, záznam by šel do kategorie unknown. V této první řadě zatím unknown nemáme.
          </Text>
        </Paper>

        <Paper p="lg" radius={8} withBorder bg="#11100e" c="#fffaf0">
          <Title order={2} mb="xs" style={{ fontFamily: "'Roboto Slab', Georgia, serif" }}>Sdělení do článku</Title>
          <Text c="#f4ead8" size="lg">
            Vary umějí pozvat a ocenit velká ženská jména: Věru Chytilovou, Liv Ullmann, Sharon Stone, Isabelle Huppert, Judi Dench, Susan Sarandon, Helen Mirren, Julianne Moore, Patricii Clarkson a pro rok 2026 Juliette Binoche. Jenže právě proto je vidět, že nejde o pravidlo, ale o výjimky v dlouhé mužské řadě.
          </Text>
          <SimpleGrid cols={2} spacing="sm" mt="lg">
            <Paper p="md" radius={8} bg="#fffaf0" c="#11100e"><Text fw={900} ff="monospace">{honoraryGenderCounts.woman}</Text><Text size="sm">oceněných žen</Text></Paper>
            <Paper p="md" radius={8} bg="#fffaf0" c="#11100e"><Text fw={900} ff="monospace">{honoraryGenderCounts.man}</Text><Text size="sm">oceněných mužů</Text></Paper>
            <Paper p="md" radius={8} bg="#fffaf0" c="#11100e"><Text fw={900} ff="monospace">2009-2012</Text><Text size="sm">nejvýraznější ženská vlna</Text></Paper>
            <Paper p="md" radius={8} bg="#fffaf0" c="#11100e"><Text fw={900} ff="monospace">2026*</Text><Text size="sm">Hoffman, Binoche, Richardson</Text></Paper>
          </SimpleGrid>
        </Paper>

        <Paper p="lg" radius={8} withBorder bg="#fffdf8" style={{ gridColumn: '1 / -1' }}>
          <Group justify="space-between" align="end" mb="md">
            <Title order={2} style={{ fontFamily: "'Roboto Slab', Georgia, serif" }}>Poslední oceněné osobnosti v datové řadě</Title>
            <Button component={Link} href="/specialy/karlovy-vary/live" variant="outline" color="dark">Souvislosti návštěvnosti</Button>
          </Group>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="sm">
            {latestRecipients.map((recipient) => (
              <Paper key={`${recipient.year}-${recipient.name}`} p="md" radius={8} withBorder bg={recipient.gender === 'woman' ? '#fff0f4' : '#f4f7fa'}>
                <Text fw={900}>{recipient.name}</Text>
                <Text size="sm" c="dimmed">{recipient.year}{recipient.status === 'announced' ? ' oznámeno' : ''} · {recipient.country}</Text>
                <Text size="sm">{recipient.role}</Text>
              </Paper>
            ))}
          </SimpleGrid>
        </Paper>
      </SimpleGrid>
    </Box>
  );
}

function FilmScaleBlock() {
  const maxFilms = peakFilmYear.totalFilms ?? 1;
  const recentBreakdown = completeBreakdownRows.slice(-4);

  return (
    <Box px={{ base: 16, md: 24 }} py={{ base: 20, md: 34 }}>
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Paper p="lg" radius={8} withBorder bg="#fffdf8">
          <Badge w="fit-content" color="teal" variant="light" mb="sm">Hotová časová osa</Badge>
          <Title order={2} mb="xs" style={{ fontFamily: "'Roboto Slab', Georgia, serif" }}>Program se po maximu zmenšil, ale zhoustl</Title>
          <Text size="lg">
            Nejvíc filmů v dostupné řadě má rok {peakFilmYear.year}: {peakFilmYear.totalFilms} titulů. Uzavřený rok {latestClosedFilmYear.year} má {latestClosedFilmYear.totalFilms} filmů, ale {latestClosedFilmYear.screenings} projekcí. Jeden film tak dnes připadá zhruba na {latestScreeningsPerFilm.toString().replace('.', ',')} projekce; v roce 1996 to bylo {firstScreeningsPerFilm.toString().replace('.', ',')}.
          </Text>
          <Stack gap="sm" mt="lg">
            {filmScaleByPeriod.map((row) => (
              <DataBar key={row.period} label={row.period} value={row.avgFilms} max={maxFilms} color="#6fb3a3" />
            ))}
          </Stack>
          <Text mt="md" c="dimmed">Sloupce ukazují průměrný počet filmů v období. Projekce držíme odděleně, protože jedna země může mít méně titulů, ale výraznější festivalovou přítomnost.</Text>
        </Paper>

        <Paper p="lg" radius={8} withBorder bg="#11100e" c="#fffaf0">
          <Title order={2} mb="xs" style={{ fontFamily: "'Roboto Slab', Georgia, serif" }}>Co to znamená pro země</Title>
          <Text c="#f4ead8" size="lg">
            Země v čase nepůjde férově číst jen jako mapa všech vlaječek. Koprodukce budeme počítat dvěma způsoby: presence count řekne, kde se země objevila, fractional count rozdělí jeden film mezi všechny produkční země. Teprve rozdíl ukáže, jestli festival otevíral prostor novým regionům, nebo jen častěji uváděl mezinárodní koprodukce.
          </Text>
          <SimpleGrid cols={2} spacing="sm" mt="lg">
            <Paper p="md" radius={8} bg="#fffaf0" c="#11100e"><Text fw={900} ff="monospace">{peakFilmYear.totalFilms}</Text><Text size="sm">filmů v maximu {peakFilmYear.year}</Text></Paper>
            <Paper p="md" radius={8} bg="#fffaf0" c="#11100e"><Text fw={900} ff="monospace">{latestClosedFilmYear.totalFilms}</Text><Text size="sm">filmů v roce {latestClosedFilmYear.year}</Text></Paper>
            <Paper p="md" radius={8} bg="#fffaf0" c="#11100e"><Text fw={900} ff="monospace">{latestScreeningsPerFilm.toString().replace('.', ',')}</Text><Text size="sm">projekce na film v roce {latestClosedFilmYear.year}</Text></Paper>
            <Paper p="md" radius={8} bg="#fffaf0" c="#11100e"><Text fw={900} ff="monospace">2x</Text><Text size="sm">metoda pro koprodukce</Text></Paper>
          </SimpleGrid>
        </Paper>

        <Paper p="lg" radius={8} withBorder bg="#fffdf8" style={{ gridColumn: '1 / -1' }}>
          <Group justify="space-between" align="end" mb="md">
            <Title order={2} style={{ fontFamily: "'Roboto Slab', Georgia, serif" }}>Novější roky: složení programu</Title>
            <Text c="dimmed">Úplné členění máme souvisle od roku 2022, plus rok 2018.</Text>
          </Group>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="sm">
            {recentBreakdown.map((row) => (
              <Paper key={row.year} p="md" radius={8} withBorder>
                <Text fw={900} ff="monospace">{row.year}</Text>
                <Text size="sm">{row.totalFilms} filmů celkem</Text>
                <Text size="sm" c="dimmed">{row.fictionFeatures} hraných · {row.documentaryFeatures} dokumentů · {row.shortFilms} krátkých</Text>
              </Paper>
            ))}
          </SimpleGrid>
        </Paper>
      </SimpleGrid>
    </Box>
  );
}

export function generateStaticParams() {
  return kviffBranches.map((branch) => ({ slug: branch.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const branch = getKviffBranch(params.slug);
  if (!branch) return { title: 'Analýza nenalezena' };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.mahdalova-skop.cz';
  const image = `${baseUrl}/images/specials/karlovy-vary.svg`;

  return {
    title: `${branch.title} | Karlovy Vary v datech`,
    description: branch.excerpt,
    alternates: { canonical: `/specialy/karlovy-vary/${branch.slug}` },
    openGraph: {
      title: `${branch.title} | Karlovy Vary v datech`,
      description: branch.excerpt,
      url: `/specialy/karlovy-vary/${branch.slug}`,
      type: 'article',
      images: [{ url: image, width: 1200, height: 630, alt: branch.title }],
    },
  };
}

export default function KviffBranchPage({ params }: PageProps) {
  const branch = getKviffBranch(params.slug);
  if (!branch) notFound();

  return (
    <Container size="lg" bg="background.2" maw="1200px" w="100%" p={0} m="0 auto">
      <Box component="article">
        <Box style={{ background: '#101010', color: '#f8f6f0' }} px={{ base: 18, md: 44 }} py={{ base: 34, md: 64 }}>
          <Stack gap="md" maw={860}>
            <Button component={Link} href="/specialy/karlovy-vary" variant="subtle" color="yellow" w="fit-content" px={0}>
              Karlovy Vary v datech
            </Button>
            <Badge w="fit-content" style={{ background: branch.accent, color: '#101010' }}>{branch.kicker}</Badge>
            <Title order={1} style={{ fontFamily: "'Roboto Slab', Georgia, serif", fontSize: 'clamp(2.2rem, 5vw, 4.8rem)', lineHeight: 1 }}>
              {branch.title}
            </Title>
            <Text size="xl" c="#f1eadf">{branch.excerpt}</Text>
          </Stack>
        </Box>

        <Box px={{ base: 16, md: 24 }} py={{ base: 24, md: 36 }}>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
            {branch.metrics.map((metric) => (
              <Paper key={metric} p="md" radius={8} withBorder style={{ borderTop: `5px solid ${branch.accent}` }}>
                <Text fw={800}>{metric}</Text>
              </Paper>
            ))}
          </SimpleGrid>
        </Box>

        <Box px={{ base: 16, md: 24 }} py={{ base: 12, md: 24 }}>
          <Stack gap="xl" maw={860}>
            {branch.sections.map((section) => (
              <Stack key={section.heading} gap="sm">
                <Title order={2} style={{ fontFamily: "'Roboto Slab', Georgia, serif" }}>{section.heading}</Title>
                {section.body.map((paragraph) => (
                  <Text key={paragraph} size="lg" lh={1.65}>{paragraph}</Text>
                ))}
              </Stack>
            ))}
          </Stack>
        </Box>

        {branch.slug === 'ekonomika-pozornosti' && (
          <Box px={{ base: 16, md: 24 }} py={{ base: 20, md: 34 }}>
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Paper p="lg" radius={8} withBorder bg="#fffdf8">
                <Title order={2} mb="xs" style={{ fontFamily: "'Roboto Slab', Georgia, serif" }}>Prodané vstupenky</Title>
                <Text c="dimmed" mb="md">Roky 2023-2025 jsou finální statistiky, rok 2026 je průběžný stav k 8. 7. v 10:00.</Text>
                {finalStats.map((row) => (
                  <DataBar key={row.year} label={String(row.year)} value={row.tickets} max={maxTickets} />
                ))}
                <DataBar label="2026*" value={current2026.tickets} max={maxTickets} color="#d7a84a" />
                <Text mt="md">Průběžný rok 2026 je už na {ticketShare2026.toString().replace('.', ',')} % finálního počtu prodaných vstupenek roku 2025.</Text>
              </Paper>

              <Paper p="lg" radius={8} withBorder bg="#fffdf8">
                <Title order={2} mb="xs" style={{ fontFamily: "'Roboto Slab', Georgia, serif" }}>Pozornost mimo kinosály</Title>
                <Text c="dimmed" mb="md">Vybrané ukazatele 2026 proti finální statistice 2025.</Text>
                <DataBar label="Fest.Passy" value={passesShare2026} max={110} color="#6f9b75" suffix="%" />
                <DataBar label="Novináři" value={journalistsShare2026} max={110} color="#6f9b75" suffix="%" />
                <DataBar label="Industry" value={industryShare2026} max={110} color="#6f9b75" suffix="%" />
                <Text mt="md">Pasy, média a filmový trh jsou v průběžném srovnání velmi blízko loňskému finálnímu stavu, nebo už nad ním.</Text>
              </Paper>

              <Paper p="lg" radius={8} withBorder bg="#11100e" c="#fffaf0">
                <Title order={2} mb="xs" style={{ fontFamily: "'Roboto Slab', Georgia, serif" }}>Rozpočet a útrata</Title>
                <Text c="#f4ead8">Rozpočet 60. ročníku je 250 milionů korun. Odhad útraty lidí na festivalu je zhruba 650 milionů korun.</Text>
                <SimpleGrid cols={2} spacing="sm" mt="lg">
                  <Paper p="md" radius={8} bg="#fffaf0" c="#11100e"><Text fw={900} ff="monospace">80 %</Text><Text size="sm">sponzoři</Text></Paper>
                  <Paper p="md" radius={8} bg="#fffaf0" c="#11100e"><Text fw={900} ff="monospace">20 %</Text><Text size="sm">veřejné zdroje</Text></Paper>
                  <Paper p="md" radius={8} bg="#fffaf0" c="#11100e"><Text fw={900} ff="monospace">250 mil.</Text><Text size="sm">rozpočet</Text></Paper>
                  <Paper p="md" radius={8} bg="#fffaf0" c="#11100e"><Text fw={900} ff="monospace">650 mil.</Text><Text size="sm">útrata</Text></Paper>
                </SimpleGrid>
                <Text mt="md">Orientačně: útrata návštěvníků je asi {spendingRatio2026.toString().replace('.', ',')}násobek festivalového rozpočtu.</Text>
              </Paper>

              <Paper p="lg" radius={8} withBorder bg="#fffdf8">
                <Title order={2} mb="xs" style={{ fontFamily: "'Roboto Slab', Georgia, serif" }}>Metodická poznámka</Title>
                <Text>
                  Průběžná čísla 2026 nesmíme míchat s finálními statistikami starších ročníků. U vstupenek jde o rozběhnutý ročník proti uzavřeným rokům; u rozpočtu a útraty jde o velikost ekonomické stopy, ne o zisk festivalu.
                </Text>
                <Button component={Link} href="/specialy/karlovy-vary/live" mt="md" color="dark">
                  Otevřít live brief
                </Button>
              </Paper>
            </SimpleGrid>
          </Box>
        )}

        {(branch.slug === 'hoste-a-prestiz' || branch.slug === 'gender-ve-varech') && <HonoraryGenderBlock />}
        {branch.slug === 'mapa-filmu' && <FilmScaleBlock />}

        <Box px={{ base: 16, md: 24 }} py={{ base: 24, md: 36 }}>
          <Paper p="lg" radius={8} withBorder bg="#fffaf0">
            <Title order={3} mb="sm" style={{ fontFamily: "'Roboto Slab', Georgia, serif" }}>Hotové grafy k použití</Title>
            <Text>
              Pro živé vysílání už je připravený samostatný datový brief s grafy: vstupenky 2023-2026, průběžný stav 2026 proti finálnímu roku 2025, rozpočet, financování 80/20 a ekonomická stopa návštěvníků. Ostatní kapitoly rozšiřujeme postupně podle archivních dat.
            </Text>
            <Button component={Link} href="/specialy/karlovy-vary/live" mt="md" color="dark">
              Otevřít hotové grafy
            </Button>
          </Paper>
        </Box>

        <Divider my="md" />

        <Box px={{ base: 16, md: 24 }} py={{ base: 24, md: 36 }}>
          <Group justify="space-between" align="end" mb="md">
            <Title order={2} style={{ fontFamily: "'Roboto Slab', Georgia, serif" }}>Další kapitoly</Title>
            <Button component={Link} href="/specialy/karlovy-vary" variant="outline">Zpět na landing page</Button>
          </Group>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
            {kviffBranches.filter((item) => item.slug !== branch.slug).map((item) => (
              <Paper
                key={item.slug}
                component={Link}
                href={`/specialy/karlovy-vary/${item.slug}`}
                p="md"
                radius={8}
                withBorder
                style={{ textDecoration: 'none', color: 'inherit', borderTop: `5px solid ${item.accent}` }}
              >
                <Text size="xs" fw={800} tt="uppercase" c="dimmed">{item.kicker}</Text>
                <Title order={4} mt={4} style={{ fontFamily: "'Roboto Slab', Georgia, serif" }}>{item.title}</Title>
              </Paper>
            ))}
          </SimpleGrid>
        </Box>

        <Box px={{ base: 16, md: 24 }} py={{ base: 24, md: 36 }} bg="#f8f6f0">
          <Title order={3} mb="sm" style={{ fontFamily: "'Roboto Slab', Georgia, serif" }}>Pracovní zdroje</Title>
          <Stack gap={4}>
            {kviffSources.map((source) => (
              <Text key={source}>• {source}</Text>
            ))}
          </Stack>
        </Box>
      </Box>

      <SupportBanner />
      <SubscribeNewsletter actionUrl="https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088" />
    </Container>
  );
}
