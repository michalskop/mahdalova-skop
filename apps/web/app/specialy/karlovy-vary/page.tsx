import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Box, Button, Container, Divider, Group, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import SupportBanner from '@/components/common/SupportBanner';
import SubscribeNewsletter from '@/components/common/SubscribeNewsletter';
import { kviffBranches, kviffSources } from './data';
import { current2026, finalStats, formatNumber, maxTickets, spendingRatio2026, ticketShare2026 } from './stats';
import { honoraryDoubleWomanYears, honoraryGenderCounts, honoraryTotal, honoraryWomenShare } from './honors';
import { firstScreeningsPerFilm, latestClosedFilmYear, latestScreeningsPerFilm, peakFilmYear } from './films';
import { countryPresenceTop, countryPresenceTotal, czCountry } from './countries';

// Typografie čísel dle DESIGN.md: Roboto Condensed, tabulkové číslice (žádný monospace)
const NUM_FONT = { fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif', fontVariantNumeric: 'tabular-nums' as const };

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.mahdalova-skop.cz';
const COVER = `${BASE_URL}/images/specials/karlovy-vary.svg`;

export const metadata: Metadata = {
  title: 'Karlovy Vary v datech',
  description: 'Datový speciál o historii, filmech, cenách, hostech, genderu, zemích, tématech a návštěvnosti Mezinárodního filmového festivalu Karlovy Vary.',
  alternates: { canonical: '/specialy/karlovy-vary' },
  openGraph: {
    title: 'Karlovy Vary v datech',
    description: 'Datový speciál o historii, filmech, cenách, hostech, genderu, zemích, tématech a návštěvnosti KVIFF.',
    url: '/specialy/karlovy-vary',
    type: 'website',
    images: [{ url: COVER, width: 1200, height: 630, alt: 'Karlovy Vary v datech' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Karlovy Vary v datech',
    description: 'Datový speciál o Mezinárodním filmovém festivalu Karlovy Vary.',
    images: [COVER],
  },
};

const keyNumbers = [
  { value: '1946', label: 'začátek festivalu' },
  { value: '1994', label: 'nová každoroční éra' },
  { value: '128 133', label: 'prodaných vstupenek v roce 2025' },
  { value: '8', label: 'analytických větví speciálu' },
];

// Mini pruhový graf dle DESIGN.md §9: ploché pruhy bez rámečku, sémantika barev
// (amethyst = kontext, crimson = aktuální stav / zvýraznění)
function InlineBar({ label, value, max, color = 'var(--mantine-color-brandNavy-6)' }: { label: string; value: number; max: number; color?: string }) {
  const width = Math.min(100, Math.round((value / max) * 1000) / 10);

  return (
    <Box style={{ display: 'grid', gridTemplateColumns: '74px 1fr 92px', gap: 10, alignItems: 'center' }}>
      <Text fw={700} style={NUM_FONT}>{label}</Text>
      <Box h={16} bg="background.4" style={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box h="100%" w={`${width}%`} style={{ background: color, borderRadius: 3 }} />
      </Box>
      <Text ta="right" fw={700} style={NUM_FONT}>{formatNumber(value)}</Text>
    </Box>
  );
}

export default function KarlovyVarySpecialPage() {
  return (
    <Container size="lg" bg="background.2" maw="1200px" w="100%" p={0} m="0 auto">
      <Box component="section" bg="brandRoyalBlue.8" c="background.0">
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing={0}>
          <Stack gap="lg" p={{ base: 24, md: 48 }} justify="center" mih={{ base: 520, md: 640 }}>
            <Badge w="fit-content" color="brand" variant="filled">Speciál</Badge>
            <Title order={1} style={{ fontSize: 'clamp(2.4rem, 6vw, 5.8rem)', lineHeight: 0.95, maxWidth: 760 }}>
              Karlovy Vary v datech
            </Title>
            <Text size="xl" maw={680} c="background.2">
              Kdo vypráví světový film, kdo získává prestiž a co ukazuje osmdesát let festivalu, když se nedíváme jen na červený koberec, ale na filmy, země, ceny, tvůrce, témata a publikum.
            </Text>
            <Group>
              <Button component={Link} href="/specialy/karlovy-vary/live" color="brand" variant="filled">
                Hotové grafy pro vysílání
              </Button>
              <Button component={Link} href="/specialy/karlovy-vary/historie-festivalu" variant="white" color="dark">
                Začít historií
              </Button>
              <Button component={Link} href="#analyzy" color="gray" variant="outline">
                Projít analýzy
              </Button>
            </Group>
          </Stack>
          <Box
            aria-hidden="true"
            style={{
              minHeight: 420,
              backgroundImage: 'url(/images/specials/karlovy-vary.svg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </SimpleGrid>
      </Box>

      <Box component="section" px={{ base: 16, md: 24 }} py={{ base: 28, md: 42 }}>
        <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
          {keyNumbers.map((item) => (
            <Paper key={item.label} p="lg" radius={8} withBorder bg="background.2">
              <Text fw={800} c="brand.6" style={{ ...NUM_FONT, fontSize: 30, lineHeight: 1.1 }}>{item.value}</Text>
              <Text size="sm" fw={600} c="dark.9" mt={4}>{item.label}</Text>
            </Paper>
          ))}
        </SimpleGrid>
      </Box>

      <Box component="section" px={{ base: 16, md: 24 }} pb={{ base: 28, md: 42 }}>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <Paper p={{ base: 'lg', md: 'xl' }} radius={8} withBorder bg="background.1">
            <Group justify="space-between" align="start" mb="md">
              <Stack gap={2}>
                <Badge w="fit-content" color="brand" variant="filled">Hotový graf</Badge>
                <Title order={2} fz="1.25rem" >Vstupenky: finální roky a průběžný stav</Title>
              </Stack>
              <Button component={Link} href="/specialy/karlovy-vary/live" variant="outline" color="dark">Detail</Button>
            </Group>
            <Stack gap="sm">
              {finalStats.map((row) => (
                <InlineBar key={row.year} label={String(row.year)} value={row.tickets} max={maxTickets} />
              ))}
              <InlineBar label="2026*" value={current2026.tickets} max={maxTickets} color="var(--mantine-color-brand-6)" />
            </Stack>
            <Text mt="md" c="dimmed">
              Rok 2026 je stav k 8. 7. v 10:00. Už teď odpovídá {ticketShare2026.toString().replace('.', ',')} % finální návštěvnosti roku 2025 podle prodaných vstupenek.
            </Text>
          </Paper>

          <Paper p={{ base: 'lg', md: 'xl' }} radius={8} withBorder bg="brandRoyalBlue.8" c="background.0">
            <Badge w="fit-content" color="brand" variant="filled" mb="md">Ekonomika festivalu</Badge>
            <Title order={2} fz="1.25rem" >250 milionů rozpočtu, 650 milionů útraty</Title>
            <Text size="lg" c="background.2" mt="sm">
              Průběžná statistika 60. ročníku ukazuje festival jako kulturní událost i městskou ekonomiku pozornosti.
            </Text>
            <SimpleGrid cols={2} spacing="sm" mt="lg">
              <Paper p="md" radius={8} bg="background.2" c="var(--mantine-color-brandRoyalBlue-8)"><Text fw={800} style={NUM_FONT}>80 %</Text><Text size="sm">sponzoři</Text></Paper>
              <Paper p="md" radius={8} bg="background.2" c="var(--mantine-color-brandRoyalBlue-8)"><Text fw={800} style={NUM_FONT}>20 %</Text><Text size="sm">veřejné zdroje</Text></Paper>
              <Paper p="md" radius={8} bg="background.2" c="var(--mantine-color-brandRoyalBlue-8)"><Text fw={800} style={NUM_FONT}>{spendingRatio2026.toString().replace('.', ',')}×</Text><Text size="sm">útrata vs. rozpočet</Text></Paper>
              <Paper p="md" radius={8} bg="background.2" c="var(--mantine-color-brandRoyalBlue-8)"><Text fw={800} style={NUM_FONT}>578</Text><Text size="sm">novinářů</Text></Paper>
            </SimpleGrid>
          </Paper>
        </SimpleGrid>
      </Box>

      <Box component="section" px={{ base: 16, md: 24 }} pb={{ base: 28, md: 42 }}>
        <Paper p={{ base: 'lg', md: 'xl' }} radius={8} withBorder bg="background.2">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            <Stack gap="sm">
              <Badge w="fit-content" color="brand" variant="filled">Partneři a prestiž</Badge>
              <Title order={2} fz="1.25rem" >
                KVIFF neprodává jen loga. Prodává přístup k pozornosti.
              </Title>
              <Text size="lg">
                Nová část ekonomické kapitoly skládá partnery do matice: co dávají festivalu a co si z něj odnášejí. Peníze, služby, mediální dosah, CSR a řemeslný symbol Křišťálového glóbu čteme jako různé měny jedné festivalové ekonomiky.
              </Text>
              <Button component={Link} href="/specialy/karlovy-vary/ekonomika-pozornosti" color="dark" w="fit-content">
                Otevřít matici partnerství
              </Button>
            </Stack>
            <SimpleGrid cols={2} spacing="sm">
              <Paper p="md" radius={8} bg="background.1"><Text fw={800} style={NUM_FONT}>80 %</Text><Text size="sm">rozpočtu od sponzorů</Text></Paper>
              <Paper p="md" radius={8} bg="background.1"><Text fw={800} style={NUM_FONT}>20 %</Text><Text size="sm">veřejné zdroje</Text></Paper>
              <Paper p="md" radius={8} bg="background.1"><Text fw={900}>Moser</Text><Text size="sm">ceny jako symbol prestiže</Text></Paper>
              <Paper p="md" radius={8} bg="background.1"><Text fw={900}>innogy</Text><Text size="sm">Kino bez bariér a CSR vrstva</Text></Paper>
            </SimpleGrid>
          </SimpleGrid>
        </Paper>
      </Box>

      <Box component="section" px={{ base: 16, md: 24 }} pb={{ base: 28, md: 42 }}>
        <Paper p={{ base: 'lg', md: 'xl' }} radius={8} withBorder bg="background.1">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            <Stack gap="sm">
              <Badge w="fit-content" color="brand" variant="filled">Nová historická stopa</Badge>
              <Title order={2} fz="1.25rem" >
                Když Vary rozdávají prestiž, častěji ji dostávají muži.
              </Title>
              <Text size="lg">
                V řadě Crystal Globe za mimořádný umělecký přínos světu filmu máme od roku 1995 do oznámených poct roku 2026 celkem {honoraryTotal} osobností (ověřeno proti oficiálnímu archivu KVIFF). Žen je {honoraryGenderCounts.woman}, tedy {honoraryWomenShare.toString().replace('.', ',')} %.
              </Text>
              <Group>
                <Button component={Link} href="/specialy/karlovy-vary/gender-ve-varech" color="dark">Otevřít genderovou kapitolu</Button>
                <Button component={Link} href="/specialy/karlovy-vary/hoste-a-prestiz" variant="outline" color="dark">Hosté a prestiž</Button>
              </Group>
            </Stack>
            <SimpleGrid cols={2} spacing="sm">
              <Paper p="md" radius={8} bg="brand.0"><Text fw={800} style={NUM_FONT}>{honoraryGenderCounts.woman}</Text><Text size="sm">oceněných žen</Text></Paper>
              <Paper p="md" radius={8} bg="brandNavy.0"><Text fw={800} style={NUM_FONT}>{honoraryGenderCounts.man}</Text><Text size="sm">oceněných mužů</Text></Paper>
              <Paper p="md" radius={8} bg="background.2"><Text fw={800} style={NUM_FONT}>{honoraryDoubleWomanYears.join(', ')}</Text><Text size="sm">jediné roky se dvěma ženami</Text></Paper>
              <Paper p="md" radius={8} bg="background.2"><Text fw={800} style={NUM_FONT}>2026*</Text><Text size="sm">Binoche mezi třemi poctami</Text></Paper>
            </SimpleGrid>
          </SimpleGrid>
        </Paper>
      </Box>

      <Box component="section" px={{ base: 16, md: 24 }} pb={{ base: 28, md: 42 }}>
        <Paper p={{ base: 'lg', md: 'xl' }} radius={8} withBorder bg="background.1">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            <Stack gap="sm">
              <Badge w="fit-content" color="brand" variant="filled">Mapa je hotová</Badge>
              <Title order={2} fz="1.25rem">
                Odkud přijíždějí filmy: první mapa ukazuje katalog KVIFF 2026.
              </Title>
              <Text size="lg">
                V mapě počítáme produkční země jako výskyty. Koprodukční film se proto započte každé uvedené zemi. Je to fér první čtení festivalové přítomnosti: neříká jen, odkud je „hlavní“ země filmu, ale kdo se na programu reálně objevuje.
              </Text>
              <Text>
                Nejvýraznější země v katalogu jsou Francie, USA, Česko, Německo a Británie. Celkem mapa drží {countryPresenceTotal} výskytů zemí v katalogu 2026.
              </Text>
              <Button component={Link} href="/specialy/karlovy-vary/mapa-filmu" color="dark" w="fit-content">
                Otevřít mapu zemí
              </Button>
            </Stack>
            <Stack gap="xs">
              {countryPresenceTop.slice(0, 8).map((row) => {
                const domestic = row.country === 'Czech Republic';
                return (
                  <Box key={row.country} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 42px', gap: 10, alignItems: 'center' }}>
                    <Text fw={700} c={domestic ? 'brand.6' : undefined}>{czCountry(row.country)}</Text>
                    <Box h={16} bg="background.4" style={{ borderRadius: 3, overflow: 'hidden' }}>
                      <Box h="100%" w={`${Math.round((row.count / countryPresenceTop[0].count) * 100)}%`} style={{ background: domestic ? 'var(--mantine-color-brand-6)' : 'var(--mantine-color-brandNavy-6)', borderRadius: 3 }} />
                    </Box>
                    <Text ta="right" fw={800} style={NUM_FONT}>{row.count}</Text>
                  </Box>
                );
              })}
            </Stack>
          </SimpleGrid>
        </Paper>
      </Box>

      <Box component="section" px={{ base: 16, md: 24 }} pb={{ base: 28, md: 42 }}>
        <Paper p={{ base: 'lg', md: 'xl' }} radius={8} withBorder bg="background.1">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            <Stack gap="sm">
              <Badge w="fit-content" color="brand" variant="filled">Země a program v čase</Badge>
              <Title order={2} fz="1.25rem" >
                Méně filmů než na vrcholu, ale víc prostoru pro každý titul.
              </Title>
              <Text size="lg">
                Dostupná řada počtů filmů vrcholí rokem {peakFilmYear.year} s {peakFilmYear.totalFilms} filmy. V roce {latestClosedFilmYear.year} bylo filmů {latestClosedFilmYear.totalFilms}, ale projekcí {latestClosedFilmYear.screenings}. Projekce na jeden film vzrostly z {firstScreeningsPerFilm.toString().replace('.', ',')} v roce 1996 na {latestScreeningsPerFilm.toString().replace('.', ',')} v roce {latestClosedFilmYear.year}.
              </Text>
              <Button component={Link} href="/specialy/karlovy-vary/mapa-filmu" color="dark" w="fit-content">Otevřít mapu filmů</Button>
            </Stack>
            <SimpleGrid cols={2} spacing="sm">
              <Paper p="md" radius={8} bg="brandTeal.0"><Text fw={800} style={NUM_FONT}>{peakFilmYear.totalFilms}</Text><Text size="sm">filmů v roce {peakFilmYear.year}</Text></Paper>
              <Paper p="md" radius={8} bg="brandTeal.0"><Text fw={800} style={NUM_FONT}>{latestClosedFilmYear.totalFilms}</Text><Text size="sm">filmů v roce {latestClosedFilmYear.year}</Text></Paper>
              <Paper p="md" radius={8} bg="background.2"><Text fw={800} style={NUM_FONT}>{firstScreeningsPerFilm.toString().replace('.', ',')}</Text><Text size="sm">projekce na film 1996</Text></Paper>
              <Paper p="md" radius={8} bg="background.2"><Text fw={800} style={NUM_FONT}>{latestScreeningsPerFilm.toString().replace('.', ',')}</Text><Text size="sm">projekce na film {latestClosedFilmYear.year}</Text></Paper>
            </SimpleGrid>
          </SimpleGrid>
        </Paper>
      </Box>

      <Box component="section" px={{ base: 16, md: 24 }} pb={{ base: 28, md: 42 }}>
        <Paper
          component={Link}
          href="/specialy/karlovy-vary/live"
          p={{ base: 'lg', md: 'xl' }}
          radius={8}
          withBorder
          bg="brandRoyalBlue.8"
          style={{ textDecoration: 'none', display: 'block' }}
        >
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            <Stack gap="sm">
              <Badge w="fit-content" color="brand" variant="filled">Hotovo teď</Badge>
              <Title order={2} fz="1.25rem" >
                Grafy a citace pro živé vysílání
              </Title>
              <Text size="lg" c="background.2">
                Vstupenky 2023–2026, letošní průběžný stav proti finálnímu roku 2025, rozpočet, financování 80/20 a ekonomická stopa návštěvníků.
              </Text>
            </Stack>
            <SimpleGrid cols={2} spacing="sm">
              <Paper p="md" radius={8} bg="background.2" c="var(--mantine-color-brandRoyalBlue-8)"><Text fw={800} style={NUM_FONT}>97 075</Text><Text size="sm">vstupenek k 8. 7.</Text></Paper>
              <Paper p="md" radius={8} bg="background.2" c="var(--mantine-color-brandRoyalBlue-8)"><Text fw={800} style={NUM_FONT}>650 mil.</Text><Text size="sm">útrata návštěvníků</Text></Paper>
              <Paper p="md" radius={8} bg="background.2" c="var(--mantine-color-brandRoyalBlue-8)"><Text fw={800} style={NUM_FONT}>80/20</Text><Text size="sm">sponzoři / veřejné</Text></Paper>
              <Paper p="md" radius={8} bg="background.2" c="var(--mantine-color-brandRoyalBlue-8)"><Text fw={800} style={NUM_FONT}>2,6×</Text><Text size="sm">útrata vs. rozpočet</Text></Paper>
            </SimpleGrid>
          </SimpleGrid>
        </Paper>
      </Box>

      <Box component="section" px={{ base: 16, md: 24 }} py={{ base: 20, md: 36 }}>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          <Stack>
            <Title order={2} fz="1.25rem" >Co tím zjišťujeme</Title>
            <Text size="lg">
              Karlovarský festival je kulturní instituce, na které se dá sledovat geopolitika filmu, návrat střední Evropy do festivalového provozu, proměna filmové prestiže i otázka, kdo dostává prostor vyprávět.
            </Text>
            <Text>
              Hlavní stránka drží celek pohromadě. Jednotlivé analýzy půjdou do hloubky: historie, vítězové Crystal Globe, hosté, gender, země, témata, návštěvnost a tržby.
            </Text>
          </Stack>
          <Paper p="lg" radius={8} withBorder>
            <Title order={3} fz="1.05rem" mb="sm" >Metodická hranice</Title>
            <Text>
              Data dělíme na digitální éru s lepším pokrytím a archivní éru, kde budeme opatrně oddělovat ověřené ceny, data ročníků a zatím nekompletní filmový program. Gender neodvozujeme ze jmen, tržby nemícháme s festivalovou návštěvností.
            </Text>
          </Paper>
        </SimpleGrid>
      </Box>

      <Divider my="md" />

      <Box id="analyzy" component="section" px={{ base: 16, md: 24 }} py={{ base: 28, md: 42 }}>
        <Group justify="space-between" align="end" mb="lg">
          <Title order={2} fz="1.25rem" >Analýzy</Title>
          <Text c="dimmed">Osm kapitol datového speciálu</Text>
        </Group>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
          {kviffBranches.map((branch) => (
            <Paper
              key={branch.slug}
              component={Link}
              href={`/specialy/karlovy-vary/${branch.slug}`}
              p="lg"
              radius={8}
              withBorder
              style={{ textDecoration: 'none', color: 'inherit', minHeight: 260, borderTop: `6px solid ${branch.accent}` }}
            >
              <Stack h="100%" justify="space-between">
                <Stack gap="xs">
                  <Badge w="fit-content" variant="light" color={branch.status === 'ready' ? 'brandTeal' : branch.status === 'research' ? 'brandOrange' : 'gray'}>
                    {branch.status === 'ready' ? 'hotová osa' : branch.status === 'research' ? 'datová metodika' : 'kapitola speciálu'}
                  </Badge>
                  <Text tt="uppercase" size="xs" fw={800} c="dimmed">{branch.kicker}</Text>
                  <Title order={3} fz="1.05rem" style={{ lineHeight: 1.18 }}>{branch.title}</Title>
                  <Text size="sm" c="dimmed">{branch.excerpt}</Text>
                </Stack>
                <Text size="sm" fw={700}>Otevřít kapitolu</Text>
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>
      </Box>

      <Box component="section" px={{ base: 16, md: 24 }} py={{ base: 28, md: 42 }} bg="background.2">
        <Title order={2} fz="1.25rem" mb="md" >Zdroje a interpretační vrstva</Title>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          <Stack>
            {kviffSources.map((source) => (
              <Text key={source}>• {source}</Text>
            ))}
          </Stack>
          <Text>
            Oficiální archiv používáme pro fakta: ročníky, filmy, ceny, hosty a festivalová čísla. Filmová kritika, mimo jiné Kamil Fila, vstupuje jako výkladová vrstva: pomáhá popsat, jak byl festival čten, kritizován a rámován v českém veřejném prostoru.
          </Text>
        </SimpleGrid>
      </Box>

      <SupportBanner />
      <SubscribeNewsletter actionUrl="https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088" />
    </Container>
  );
}



