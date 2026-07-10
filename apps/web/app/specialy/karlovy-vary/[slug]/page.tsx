import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, Box, Button, Container, Divider, Group, Paper, SimpleGrid, Stack, Text, Title, Tooltip } from '@mantine/core';
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
import { honoraryByPeriod, honoraryCrystalGlobeRecipients, honoraryGenderCounts, honorarySelectionNote, honoraryTotal, honoraryWomenShare, pre1989AwardsNotes } from '../honors';
import { completeBreakdownRows, filmCountAvailableRows, filmScaleByPeriod, firstScreeningsPerFilm, latestClosedFilmYear, latestScreeningsPerFilm, peakFilmYear } from '../films';
import { countryPresence2026, countryPresenceMax, countryPresenceTop, countryPresenceTotal, countryRegionTotals } from '../countries';
import { partnerCapitalLabels, partnerCapitalTotals, partnerExchangeRows } from '../partners';

type PageProps = {
  params: { slug: string };
};

function DataBar({ label, value, max, color = 'var(--mantine-color-brandNavy-6)', suffix = '' }: { label: string; value: number; max: number; color?: string; suffix?: string }) {
  const width = Math.min(100, Math.round((value / max) * 1000) / 10);
  const display = suffix ? `${value.toString().replace('.', ',')} ${suffix}` : formatNumber(value);

  return (
    <Box style={{ display: 'grid', gridTemplateColumns: '104px 1fr 96px', gap: 12, alignItems: 'center', margin: '10px 0' }}>
      <Text fw={800}>{label}</Text>
      <Box h={22} bg="var(--mantine-color-background-3)" style={{ borderRadius: 999, overflow: 'hidden', border: '1px solid var(--mantine-color-background-6)' }}>
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
      <Box h={24} bg="var(--mantine-color-brandNavy-0)" style={{ borderRadius: 999, overflow: 'hidden', border: '1px solid var(--mantine-color-background-6)' }}>
        <Box h="100%" w={`${womenWidth}%`} style={{ background: 'var(--mantine-color-brand-6)', borderRadius: 999 }} />
      </Box>
    </Stack>
  );
}

function HonoraryDotTimeline() {
  const years = Array.from(new Set(honoraryCrystalGlobeRecipients.map((recipient) => recipient.year)));

  return (
    <Paper p="lg" radius={8} withBorder bg="background.1" style={{ gridColumn: '1 / -1' }}>
      <Group justify="space-between" align="end" mb="md">
        <Stack gap={2}>
          <Title order={2} >Osobnosti po letech</Title>
          <Text c="dimmed">Každá tečka je jedna oceněná osobnost. Najeďte na ni pro jméno, zemi a profesi.</Text>
        </Stack>
        <Group gap="sm">
          <Badge color="pink" variant="light">ženy</Badge>
          <Badge color="blue" variant="light">muži</Badge>
          <Badge color="gray" variant="light">2026 oznámeno</Badge>
        </Group>
      </Group>
      <Box style={{ overflowX: 'auto', paddingBottom: 8 }}>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${years.length}, minmax(38px, 1fr))`,
            gap: 8,
            minWidth: 980,
            alignItems: 'end',
          }}
        >
          {years.map((year) => {
            const recipients = honoraryCrystalGlobeRecipients.filter((recipient) => recipient.year === year);
            return (
              <Stack key={year} gap={6} align="center" justify="end">
                <Stack gap={4} align="center" justify="end" h={recipients.length > 2 ? 82 : 58}>
                  {recipients.map((recipient) => (
                    <Tooltip
                      key={`${recipient.year}-${recipient.name}`}
                      label={`${recipient.year}${recipient.status === 'announced' ? ' oznámeno' : ''}: ${recipient.name} · ${recipient.country} · ${recipient.role}. Ocenění: ${recipient.awardCz}. Za co: ${recipient.reason}`}
                      multiline
                      maw={420}
                      withArrow
                    >
                      <Box
                        component="span"
                        role="img"
                        aria-label={`${recipient.year}: ${recipient.name}, ${recipient.country}, ${recipient.role}`}
                        tabIndex={0}
                        title={`${recipient.year}: ${recipient.name} · ${recipient.awardCz}. ${recipient.reason}`}
                        style={{
                          width: recipient.gender === 'woman' ? 18 : 14,
                          height: recipient.gender === 'woman' ? 18 : 14,
                          borderRadius: 999,
                          background: recipient.gender === 'woman' ? 'var(--mantine-color-brand-6)' : 'var(--mantine-color-brandNavy-6)',
                          border: recipient.status === 'announced' ? '3px solid var(--mantine-color-brandRoyalBlue-8)' : '2px solid var(--mantine-color-background-1)',
                          boxShadow: '0 0 0 1px rgba(17, 16, 14, 0.22)',
                          display: 'inline-block',
                          cursor: 'help',
                        }}
                      />
                    </Tooltip>
                  ))}
                </Stack>
                <Text size="xs" fw={800} c={recipients.some((recipient) => recipient.gender === 'woman') ? 'var(--mantine-color-brand-8)' : 'dimmed'}>
                  {year}
                </Text>
              </Stack>
            );
          })}
        </Box>
      </Box>
      <Text mt="md" size="sm" c="dimmed">
        Čtení grafu: růžové tečky nejsou rozprostřené rovnoměrně. Největší koncentrace ženských jmen přichází v letech 2009-2012 a znovu až jednotlivě v roce 2019 a oznámeném roce 2026.
      </Text>
      <Text mt="xs" size="sm">
        Všechny tečky v tomto grafu jsou jedna konkrétní čestná kategorie: Křišťálový glóbus za mimořádný umělecký přínos světové kinematografii. Není to cena poroty za soutěžní film, ale festivalové ocenění osobností, které dlouhodobě formovaly světový film.
      </Text>
    </Paper>
  );
}

function Pre1989AwardsOverview() {
  const phaseColors = [
    'var(--mantine-color-background-7)',
    'var(--mantine-color-brandOrange-6)',
    'var(--mantine-color-brandTeal-6)',
    'var(--mantine-color-brand-6)',
  ];

  return (
    <Paper p={{ base: 'lg', md: 'xl' }} radius={8} withBorder bg="background.1" style={{ gridColumn: '1 / -1' }}>
      <Group justify="space-between" align="end" mb="lg">
        <Stack gap={2} maw={760}>
          <Badge w="fit-content" color="orange" variant="light">Infografika</Badge>
          <Title order={2}>Jak se měnila logika festivalových cen</Title>
          <Text c="dimmed">
            Před rokem 1989 sledujeme jiný systém než dnešní čestný Křišťálový glóbus pro osobnosti. Archiv ukazuje přechod od nesoutěžních ročníků k soutěžním filmovým cenám a po roce 1989 k nové festivalové éře.
          </Text>
        </Stack>
        <Text fw={900} ff="monospace">1946 → 1990 → novodobá éra</Text>
      </Group>

      <Box style={{ overflowX: 'auto', paddingBottom: 8 }}>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${pre1989AwardsNotes.length}, minmax(220px, 1fr))`,
            gap: 0,
            minWidth: 920,
            alignItems: 'stretch',
          }}
        >
          {pre1989AwardsNotes.map((note, index) => (
            <Box key={note.period} style={{ position: 'relative', padding: '0 10px' }}>
              <Box
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: index === 0 ? 22 : 0,
                  right: index === pre1989AwardsNotes.length - 1 ? 22 : 0,
                  top: 28,
                  height: 4,
                  background: phaseColors[index],
                  opacity: 0.72,
                }}
              />
              <Stack gap="sm" align="center" style={{ position: 'relative' }}>
                <Box
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 999,
                    background: phaseColors[index],
                    border: '4px solid var(--mantine-color-background-1)',
                    boxShadow: '0 0 0 1px var(--mantine-color-background-6)',
                    display: 'grid',
                    placeItems: 'center',
                    color: index === 0 ? 'var(--mantine-color-brandRoyalBlue-8)' : 'var(--mantine-color-background-0)',
                  }}
                >
                  <Text fw={900} ff="monospace" size="sm" ta="center" lh={1.05}>
                    {note.period}
                  </Text>
                </Box>
                <Paper p="md" radius={8} withBorder bg={index === 0 ? 'background.2' : 'background.1'} h="100%">
                  <Text fw={900}>{note.title}</Text>
                  <Text size="sm" mt={6}>{note.body}</Text>
                </Paper>
              </Stack>
            </Box>
          ))}
        </Box>
      </Box>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="sm" mt="lg">
        <Paper p="md" radius={8} bg="background.2">
          <Text fw={900}>Co je první „ocenění“?</Text>
          <Text size="sm">První dva ročníky byly nesoutěžní, takže první stopa ocenění začíná až rokem 1948.</Text>
        </Paper>
        <Paper p="md" radius={8} bg="background.2">
          <Text fw={900}>Co znamenají 60. léta?</Text>
          <Text size="sm">Festival oceňoval hlavně filmy, režii a herecké výkony, ne dnešní typ světových čestných hostů.</Text>
        </Paper>
        <Paper p="md" radius={8} bg="background.2">
          <Text fw={900}>Proč oddělujeme grafy?</Text>
          <Text size="sm">Soutěžní ceny a čestná prestiž osobností jsou dva různé mechanismy festivalové autority.</Text>
        </Paper>
      </SimpleGrid>
    </Paper>
  );
}

function HonoraryGenderBlock() {
  const latestRecipients = honoraryCrystalGlobeRecipients.slice(-8).reverse();

  return (
    <Box px={{ base: 16, md: 24 }} py={{ base: 20, md: 34 }}>
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Paper p="lg" radius={8} withBorder bg="background.1">
          <Badge w="fit-content" color="pink" variant="light" mb="sm">Hotový genderový graf</Badge>
          <Title order={2} mb="xs" >Čestná prestiž je pořád hlavně mužská</Title>
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
          <Text mt="sm">
            Podle oficiálního popisu KVIFF jde o osobnosti, které zanechaly výraznou stopu ve vývoji světové kinematografie. Tuto čestnou řadu proto čteme jako mapu dlouhodobé prestiže, ne jako hodnocení výkonu v jednom roce.
          </Text>
        </Paper>

        <Paper p="lg" radius={8} withBorder bg="brandRoyalBlue.8" c="background.0">
          <Title order={2} mb="xs" >Sdělení do článku</Title>
          <Text c="background.2" size="lg">
            Vary umějí pozvat a ocenit velká ženská jména: Věru Chytilovou, Liv Ullmann, Sharon Stone, Isabelle Huppert, Judi Dench, Susan Sarandon, Helen Mirren, Julianne Moore, Patricii Clarkson a pro rok 2026 Juliette Binoche. Jenže právě proto je vidět, že nejde o pravidlo, ale o výjimky v dlouhé mužské řadě.
          </Text>
          <SimpleGrid cols={2} spacing="sm" mt="lg">
            <Paper p="md" radius={8} bg="background.2" c="var(--mantine-color-brandRoyalBlue-8)"><Text fw={900} ff="monospace">{honoraryGenderCounts.woman}</Text><Text size="sm">oceněných žen</Text></Paper>
            <Paper p="md" radius={8} bg="background.2" c="var(--mantine-color-brandRoyalBlue-8)"><Text fw={900} ff="monospace">{honoraryGenderCounts.man}</Text><Text size="sm">oceněných mužů</Text></Paper>
            <Paper p="md" radius={8} bg="background.2" c="var(--mantine-color-brandRoyalBlue-8)"><Text fw={900} ff="monospace">2009-2012</Text><Text size="sm">nejvýraznější ženská vlna</Text></Paper>
            <Paper p="md" radius={8} bg="background.2" c="var(--mantine-color-brandRoyalBlue-8)"><Text fw={900} ff="monospace">2026*</Text><Text size="sm">Hoffman, Binoche, Richardson</Text></Paper>
          </SimpleGrid>
        </Paper>

        <HonoraryDotTimeline />

        <Paper p="lg" radius={8} withBorder bg="background.2" style={{ gridColumn: '1 / -1' }}>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            <Stack gap="sm">
              <Badge w="fit-content" color="orange" variant="light">Jak se vybírá</Badge>
              <Title order={2}>Kdo rozhoduje o čestné prestiži</Title>
              <Text size="lg">{honorarySelectionNote}</Text>
              <Text>
                V grafu proto nemícháme několik typů ocenění dohromady. President's Award, Cena prezidenta za přínos české kinematografii nebo soutěžní ceny poroty budou samostatné vrstvy. Tady sledujeme jen čestný Křišťálový glóbus pro světovou kinematografii.
              </Text>
            </Stack>
            <Stack gap="sm">
              <Badge w="fit-content" color="grape" variant="light">Před rokem 1989</Badge>
              <Title order={2}>Dřív to byla jiná logika cen</Title>
              <Text>
                Předlistopadový festival neměl stejnou nepřerušenou řadu čestných celebrit. Archiv ukazuje hlavně soutěžní ceny filmům, režii a hereckým výkonům. Proto by bylo metodicky chybné přilepit rok 1948 nebo 1968 do stejného genderového grafu čestných hostů.
              </Text>
            </Stack>
          </SimpleGrid>
        </Paper>

        <Pre1989AwardsOverview />

        <Paper p="lg" radius={8} withBorder bg="background.1" style={{ gridColumn: '1 / -1' }}>
          <Group justify="space-between" align="end" mb="md">
            <Title order={2} >Poslední oceněné osobnosti v datové řadě</Title>
            <Button component={Link} href="/specialy/karlovy-vary/live" variant="outline" color="dark">Souvislosti návštěvnosti</Button>
          </Group>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="sm">
            {latestRecipients.map((recipient) => (
              <Paper key={`${recipient.year}-${recipient.name}`} p="md" radius={8} withBorder bg={recipient.gender === 'woman' ? 'brand.0' : 'brandNavy.0'}>
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

const regionColors: Record<string, string> = {
  Europe: 'var(--mantine-color-brandTeal-7)',
  'North America': 'var(--mantine-color-brandNavy-6)',
  'Latin America': 'var(--mantine-color-brand-6)',
  Asia: 'var(--mantine-color-brandOrange-6)',
  'Middle East': 'var(--mantine-color-brandNavy-6)',
  Africa: 'var(--mantine-color-brandOrange-7)',
  Oceania: 'var(--mantine-color-brandForestGreen-6)',
};

function projectCountry(lon: number, lat: number) {
  return {
    x: ((lon + 180) / 360) * 100,
    y: ((85 - lat) / 170) * 100,
  };
}

function CountryBubbleMap() {
  return (
    <Paper p="lg" radius={8} withBorder bg="background.1" style={{ gridColumn: '1 / -1' }}>
      <Group justify="space-between" align="end" mb="md">
        <Stack gap={2}>
          <Badge w="fit-content" color="teal" variant="light">Mapa 2026</Badge>
          <Title order={2} >Odkud přijíždějí filmy v letošním katalogu</Title>
          <Text c="dimmed">Bubliny ukazují produkční země v katalogu KVIFF 2026. Koprodukce se počítají jako výskyt u každé uvedené země.</Text>
        </Stack>
        <Text fw={900} ff="monospace">{countryPresence2026.length} zemí · {countryPresenceTotal} výskytů</Text>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <Box>
          <Box
            style={{
              position: 'relative',
              minHeight: 420,
              borderRadius: 8,
              overflow: 'hidden',
              border: '1px solid var(--mantine-color-background-6)',
              background:
                'linear-gradient(180deg, var(--mantine-color-brandTeal-0) 0%, var(--mantine-color-background-2) 100%)',
            }}
          >
            {['North America', 'Europe', 'Asia', 'Latin America', 'Africa', 'Oceania'].map((label) => {
              const positions: Record<string, { left: string; top: string }> = {
                'North America': { left: '17%', top: '30%' },
                Europe: { left: '51%', top: '28%' },
                Asia: { left: '68%', top: '36%' },
                'Latin America': { left: '29%', top: '70%' },
                Africa: { left: '52%', top: '58%' },
                Oceania: { left: '78%', top: '76%' },
              };
              return (
                <Text
                  key={label}
                  size="xs"
                  fw={900}
                  c="var(--mantine-color-background-8)"
                  style={{ position: 'absolute', ...positions[label], textTransform: 'uppercase', letterSpacing: 0 }}
                >
                  {label}
                </Text>
              );
            })}

            {countryPresence2026.map((row) => {
              const point = projectCountry(row.lon, row.lat);
              const size = 8 + Math.sqrt(row.count / countryPresenceMax) * 34;
              const color = regionColors[row.region];
              return (
                <Tooltip
                  key={row.country}
                  label={`${row.country}: ${row.count} výskytů v katalogu 2026 · ${row.region}`}
                  multiline
                  maw={260}
                  withArrow
                >
                  <Box
                    component="span"
                    role="img"
                    aria-label={`${row.country}: ${row.count} výskytů v katalogu 2026`}
                    title={`${row.country}: ${row.count} výskytů v katalogu 2026`}
                    style={{
                      position: 'absolute',
                      left: `${point.x}%`,
                      top: `${point.y}%`,
                      width: size,
                      height: size,
                      marginLeft: -size / 2,
                      marginTop: -size / 2,
                      borderRadius: 999,
                      background: color,
                      border: '2px solid var(--mantine-color-background-1)',
                      boxShadow: '0 2px 12px rgba(17, 16, 14, 0.22)',
                      opacity: 0.88,
                      cursor: 'help',
                    }}
                  />
                </Tooltip>
              );
            })}
          </Box>
          <Text mt="sm" size="sm" c="dimmed">
            Pozor: toto není mapa unikátních filmů, ale mapa výskytů produkčních zemí. Když má jeden film uvedené země Francie, Německo a Česko, započítá se jednou Francii, jednou Německu a jednou Česku. Součet výskytů je proto vyšší než počet filmů.
          </Text>
          <Text mt="xs" size="sm">
            Co z toho plyne: nejsilnější není jen domácí česká stopa. Festival stojí na evropské koprodukční síti, do které se výrazně zapojují Francie a Německo, a zároveň má silný severoamerický pól přes USA.
          </Text>
        </Box>

        <Stack gap="md">
          <Paper p="md" radius={8} withBorder bg="brandRoyalBlue.8" c="background.0">
            <Title order={3} mb="xs" >Co z mapy číst</Title>
            <Text c="background.2">
              Letošní katalog je silně evropský, ale ne jen evropský. Po Francii, USA, Česku, Německu a Británii následuje široká vrstva koprodukčních zemí.
            </Text>
          </Paper>
          <Stack gap={6}>
            {countryPresenceTop.map((row) => (
              <Group key={row.country} gap="sm" wrap="nowrap">
                <Box w={10} h={10} bg={regionColors[row.region]} style={{ borderRadius: 999, flex: '0 0 auto' }} />
                <Text size="sm" fw={800} style={{ flex: 1 }}>{row.country}</Text>
                <Text size="sm" ff="monospace" fw={900}>{row.count}</Text>
              </Group>
            ))}
          </Stack>
          <Divider />
          <Stack gap={6}>
            {countryRegionTotals.map((row) => (
              <Group key={row.region} gap="sm" wrap="nowrap">
                <Box w={10} h={10} bg={regionColors[row.region]} style={{ borderRadius: 999, flex: '0 0 auto' }} />
                <Text size="sm" style={{ flex: 1 }}>{row.region}</Text>
                <Text size="sm" ff="monospace" fw={900}>{row.count}</Text>
              </Group>
            ))}
          </Stack>
        </Stack>
      </SimpleGrid>
    </Paper>
  );
}

function FilmScaleBlock() {
  const maxFilms = peakFilmYear.totalFilms ?? 1;
  const maxScreenings = Math.max(...filmCountAvailableRows.map((row) => row.screenings ?? 0));
  const recentBreakdown = completeBreakdownRows.slice(-4);

  return (
    <Box px={{ base: 16, md: 24 }} py={{ base: 20, md: 34 }}>
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <CountryBubbleMap />

        <Paper p="lg" radius={8} withBorder bg="background.1">
          <Badge w="fit-content" color="teal" variant="light" mb="sm">Hotová časová osa</Badge>
          <Title order={2} mb="xs" >Program se po maximu zmenšil, ale zhoustl</Title>
          <Text size="lg">
            Nejvíc filmů v dostupné řadě má rok {peakFilmYear.year}: {peakFilmYear.totalFilms} titulů. Uzavřený rok {latestClosedFilmYear.year} má {latestClosedFilmYear.totalFilms} filmů, ale {latestClosedFilmYear.screenings} projekcí. Jeden film tak dnes připadá zhruba na {latestScreeningsPerFilm.toString().replace('.', ',')} projekce; v roce 1996 to bylo {firstScreeningsPerFilm.toString().replace('.', ',')}.
          </Text>
          <Stack gap="sm" mt="lg">
            {filmScaleByPeriod.map((row) => (
              <DataBar key={row.period} label={row.period} value={row.avgFilms} max={maxFilms} color="var(--mantine-color-brandTeal-6)" />
            ))}
          </Stack>
          <Text mt="md" c="dimmed">Sloupce ukazují průměrný počet filmů v období. Projekce držíme odděleně, protože jedna země může mít méně titulů, ale výraznější festivalovou přítomnost.</Text>
        </Paper>

        <Paper p="lg" radius={8} withBorder bg="brandRoyalBlue.8" c="background.0">
          <Title order={2} mb="xs" >Co to znamená pro země</Title>
          <Text c="background.2" size="lg">
            Země v čase nepůjde férově číst jen jako mapa všech vlaječek. Koprodukce budeme počítat dvěma způsoby: presence count řekne, kde se země objevila, fractional count rozdělí jeden film mezi všechny produkční země. Teprve rozdíl ukáže, jestli festival otevíral prostor novým regionům, nebo jen častěji uváděl mezinárodní koprodukce.
          </Text>
          <SimpleGrid cols={2} spacing="sm" mt="lg">
            <Paper p="md" radius={8} bg="background.2" c="var(--mantine-color-brandRoyalBlue-8)"><Text fw={900} ff="monospace">{peakFilmYear.totalFilms}</Text><Text size="sm">filmů v maximu {peakFilmYear.year}</Text></Paper>
            <Paper p="md" radius={8} bg="background.2" c="var(--mantine-color-brandRoyalBlue-8)"><Text fw={900} ff="monospace">{latestClosedFilmYear.totalFilms}</Text><Text size="sm">filmů v roce {latestClosedFilmYear.year}</Text></Paper>
            <Paper p="md" radius={8} bg="background.2" c="var(--mantine-color-brandRoyalBlue-8)"><Text fw={900} ff="monospace">{latestScreeningsPerFilm.toString().replace('.', ',')}</Text><Text size="sm">projekce na film v roce {latestClosedFilmYear.year}</Text></Paper>
            <Paper p="md" radius={8} bg="background.2" c="var(--mantine-color-brandRoyalBlue-8)"><Text fw={900} ff="monospace">2x</Text><Text size="sm">metoda pro koprodukce</Text></Paper>
          </SimpleGrid>
        </Paper>

        <Paper p="lg" radius={8} withBorder bg="background.2" style={{ gridColumn: '1 / -1' }}>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            <Stack gap="sm">
              <Badge w="fit-content" color="teal" variant="light">Kdo vybírá filmy</Badge>
              <Title order={2} >Program není práce poroty. Porota až hodnotí.</Title>
              <Text size="lg">
                Mapa zemí musí vycházet z programového výběru, ne z cen. Filmy do programu skládá festivalové programové oddělení pod uměleckým vedením. Poroty vstupují až potom: hodnotí soutěžní filmy a rozhodují o cenách.
              </Text>
              <Text>
                V novodobé historii je klíčová Eva Zaoralová: po roce 1994 spolu s Jiřím Bartoškou festival znovu postavila na mezinárodní prestiži. Podle oficiální historie KVIFF v roce 2011 předala umělecké vedení Karlu Ochovi a dál přispívala jako umělecká poradkyně až do roku 2022.
              </Text>
            </Stack>
            <Stack gap="sm">
              <Paper p="md" radius={8} withBorder bg="background.1">
                <Text fw={900}>Dnes</Text>
                <Text>Karel Och je umělecký ředitel. Programové oddělení uvádí programátory, koordinaci programu, přidružené programátory a mezinárodní konzultanty.</Text>
              </Paper>
              <Paper p="md" radius={8} withBorder bg="background.1">
                <Text fw={900}>Co přesně vybírají</Text>
                <Text>KVIFF uvádí zhruba dvě stovky filmů ročně, často jako české, evropské, mezinárodní nebo světové premiéry. Soutěž Crystal Globe má zvláštní pravidla: jde o celovečerní filmy z předchozí sezony, které nebyly v mezinárodní soutěži jiného festivalu.</Text>
              </Paper>
              <Group>
                <Button component="a" href="https://www.kviff.com/en/about-us/festival-description" target="_blank" rel="noopener noreferrer" variant="outline" color="dark">
                  Popis festivalu
                </Button>
                <Button component="a" href="https://www.kviff.com/en/about-us/contacts" target="_blank" rel="noopener noreferrer" variant="outline" color="dark">
                  Programové oddělení
                </Button>
              </Group>
            </Stack>
          </SimpleGrid>
        </Paper>

        <Paper p="lg" radius={8} withBorder bg="background.1" style={{ gridColumn: '1 / -1' }}>
          <Group justify="space-between" align="end" mb="md">
            <Stack gap={2}>
              <Title order={2} >Filmy a projekce po ročnících</Title>
              <Text c="dimmed">Každý sloupec má tooltip s rokem, ročníkem, počtem filmů, projekcí a metodickou poznámkou.</Text>
            </Stack>
            <Group gap="sm">
              <Badge color="teal" variant="light">filmy</Badge>
              <Badge color="yellow" variant="light">projekce</Badge>
            </Group>
          </Group>
          <Box style={{ overflowX: 'auto', paddingBottom: 8 }}>
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${filmCountAvailableRows.length}, minmax(32px, 1fr))`,
                gap: 6,
                minWidth: 1040,
                alignItems: 'end',
                minHeight: 250,
                borderBottom: '1px solid var(--mantine-color-background-6)',
                paddingTop: 8,
              }}
            >
              {filmCountAvailableRows.map((row) => {
                const filmsHeight = Math.max(10, Math.round(((row.totalFilms ?? 0) / maxFilms) * 190));
                const screeningsHeight = row.screenings ? Math.max(10, Math.round((row.screenings / maxScreenings) * 190)) : 0;
                const perFilm = row.screenings && row.totalFilms ? Math.round((row.screenings / row.totalFilms) * 100) / 100 : null;
                const tooltip = [
                  `${row.year}${row.edition ? ` · ${row.edition}. ročník` : ''}`,
                  `${row.totalFilms} filmů celkem`,
                  row.screenings ? `${row.screenings} projekcí` : 'počet projekcí není v online souhrnu',
                  perFilm ? `${perFilm.toString().replace('.', ',')} projekce na film` : null,
                  row.note ?? null,
                ].filter(Boolean).join(' · ');

                return (
                  <Tooltip key={row.year} label={tooltip} multiline maw={340} withArrow>
                    <Stack gap={4} align="center" justify="end" title={tooltip} style={{ cursor: 'help' }}>
                      <Box h={198} w="100%" style={{ display: 'flex', alignItems: 'end', justifyContent: 'center', gap: 3 }}>
                        <Box
                          aria-label={`${row.year}: ${row.totalFilms} filmů`}
                          style={{
                            width: 12,
                            height: filmsHeight,
                            background: row.availability === 'full-breakdown' ? 'var(--mantine-color-brandTeal-7)' : 'var(--mantine-color-brandTeal-6)',
                            borderRadius: '5px 5px 0 0',
                            boxShadow: row.year === peakFilmYear.year ? '0 0 0 2px var(--mantine-color-brandRoyalBlue-8)' : undefined,
                          }}
                        />
                        <Box
                          aria-label={row.screenings ? `${row.year}: ${row.screenings} projekcí` : `${row.year}: projekce nejsou dostupné`}
                          style={{
                            width: 8,
                            height: screeningsHeight,
                            background: row.screenings ? 'var(--mantine-color-brandOrange-6)' : 'transparent',
                            borderRadius: '5px 5px 0 0',
                            opacity: row.screenings ? 0.92 : 0,
                          }}
                        />
                      </Box>
                      <Text size="xs" fw={row.year === peakFilmYear.year || row.year === latestClosedFilmYear.year ? 900 : 700} c={row.availability === 'full-breakdown' ? 'var(--mantine-color-brandTeal-7)' : 'dimmed'}>
                        {String(row.year).slice(2)}
                      </Text>
                    </Stack>
                  </Tooltip>
                );
              })}
            </Box>
          </Box>
          <Text mt="md" size="sm" c="dimmed">
            Čtení grafu: zelené sloupce po roce 2003 klesají, žluté projekce ale neklesají stejným tempem. Festival tak po čase neukazuje jen méně titulů; dává každému filmu víc projekčního prostoru.
          </Text>
        </Paper>

        <Paper p="lg" radius={8} withBorder bg="background.1" style={{ gridColumn: '1 / -1' }}>
          <Group justify="space-between" align="end" mb="md">
            <Title order={2} >Novější roky: složení programu</Title>
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
      <Paper p={{ base: 'lg', md: 'xl' }} radius={8} withBorder bg="background.1">
        <Group justify="space-between" align="end" mb="lg">
          <Stack gap={2} maw={760}>
            <Badge w="fit-content" color="yellow" variant="light">Partneri jako data</Badge>
            <Title order={2} >Obchod s prestizi neni jedna smlouva, ale cela infrastruktura</Title>
            <Text c="dimmed">
              Matice cte oficialne komunikovana partnerstvi podle toho, jaky typ kapitalu se vymenuje: penize, sluzby, pristup k publiku, media, remeslo, CSR nebo misto konani.
            </Text>
          </Stack>
          <Button component="a" href="https://www.kviff.com/cs/o-nas/partneri" target="_blank" rel="noopener noreferrer" variant="outline" color="dark">
            Zdroj KVIFF
          </Button>
        </Group>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <Paper p="lg" radius={8} withBorder bg="brandRoyalBlue.8" c="background.0">
            <Title order={3} mb="xs" >Teze pro cteni</Title>
            <Text c="background.2" size="lg">
              Festival ma kulturni a medialni auru, partneri maji penize, sluzby, distribuci nebo infrastrukturu. Vary jim neprodavaji jen logo na plote: prodavaji pritomnost uvnitr udalosti, kterou sleduji divaci, media, politici, filmari a byznys.
            </Text>
            <Text c="background.2" mt="md">
              Je to interpretace verejne komunikovanych partnerstvi, ne dukaz jednotlivych obchodnich jednani. Proto u kazde vrstvy drzime zvlast zdroj a faktickou oporu.
            </Text>
          </Paper>

          <Paper p="lg" radius={8} withBorder bg="background.2">
            <Title order={3} mb="md" >Mapa typu kapitalu</Title>
            <Stack gap="xs">
              {capitalEntries.map(({ capital, count }) => (
                <Group key={capital} gap="sm" wrap="nowrap">
                  <Box w={14} h={14} bg={capitalColors[capital]} style={{ borderRadius: 4, flex: '0 0 auto' }} />
                  <Text style={{ flex: 1 }} fw={800}>{partnerCapitalLabels[capital]}</Text>
                  <Text ff="monospace" fw={900}>{count}x</Text>
                </Group>
              ))}
            </Stack>
            <Text mt="md" size="sm" c="dimmed">
              Pocet neznamena velikost penez. Rika jen, jak casto se dany typ hodnoty objevuje v nasi redakcni klasifikaci partnerstvi.
            </Text>
          </Paper>
        </SimpleGrid>

        <Stack gap="md" mt="md">
          {partnerExchangeRows.map((row) => (
            <Tooltip key={row.segment} label={`${row.evidence} Zdroj: ${row.sourceLabel}`} multiline maw={420} withArrow>
              <Paper p="md" radius={8} withBorder bg="background.1" style={{ cursor: 'help' }}>
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
                    <Text fw={900}>Partner dava festivalu</Text>
                    {row.givesFestival.map((item) => (
                      <Text key={item} size="sm">- {item}</Text>
                    ))}
                  </Stack>

                  <Stack gap={6}>
                    <Text fw={900}>Festival vraci partnerovi</Text>
                    {row.getsFromFestival.map((item) => (
                      <Text key={item} size="sm">- {item}</Text>
                    ))}
                    <Button component="a" href={row.sourceUrl} target="_blank" rel="noopener noreferrer" variant="subtle" color="dark" px={0} w="fit-content">
                      Otevrit zdroj
                    </Button>
                  </Stack>
                </SimpleGrid>
              </Paper>
            </Tooltip>
          ))}
        </Stack>
      </Paper>
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
        <Box bg="brandRoyalBlue.8" c="background.0" px={{ base: 18, md: 44 }} py={{ base: 34, md: 64 }}>
          <Stack gap="md" maw={860}>
            <Button component={Link} href="/specialy/karlovy-vary" variant="subtle" color="yellow" w="fit-content" px={0}>
              Karlovy Vary v datech
            </Button>
            <Badge w="fit-content" style={{ background: branch.accent, color: 'var(--mantine-color-brandRoyalBlue-8)' }}>{branch.kicker}</Badge>
            <Title order={1} style={{ fontSize: 'clamp(2.2rem, 5vw, 4.8rem)', lineHeight: 1 }}>
              {branch.title}
            </Title>
            <Text size="xl" c="background.2">{branch.excerpt}</Text>
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
                <Title order={2} >{section.heading}</Title>
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
              <Paper p="lg" radius={8} withBorder bg="background.1">
                <Title order={2} mb="xs" >Prodané vstupenky</Title>
                <Text c="dimmed" mb="md">Roky 2023-2025 jsou finální statistiky, rok 2026 je průběžný stav k 8. 7. v 10:00.</Text>
                {finalStats.map((row) => (
                  <DataBar key={row.year} label={String(row.year)} value={row.tickets} max={maxTickets} />
                ))}
                <DataBar label="2026*" value={current2026.tickets} max={maxTickets} color="var(--mantine-color-brandOrange-6)" />
                <Text mt="md">Průběžný rok 2026 je už na {ticketShare2026.toString().replace('.', ',')} % finálního počtu prodaných vstupenek roku 2025.</Text>
              </Paper>

              <Paper p="lg" radius={8} withBorder bg="background.1">
                <Title order={2} mb="xs" >Pozornost mimo kinosály</Title>
                <Text c="dimmed" mb="md">Vybrané ukazatele 2026 proti finální statistice 2025.</Text>
                <DataBar label="Fest.Passy" value={passesShare2026} max={110} color="var(--mantine-color-brandTeal-6)" suffix="%" />
                <DataBar label="Novináři" value={journalistsShare2026} max={110} color="var(--mantine-color-brandTeal-6)" suffix="%" />
                <DataBar label="Industry" value={industryShare2026} max={110} color="var(--mantine-color-brandTeal-6)" suffix="%" />
                <Text mt="md">Pasy, média a filmový trh jsou v průběžném srovnání velmi blízko loňskému finálnímu stavu, nebo už nad ním.</Text>
              </Paper>

              <Paper p="lg" radius={8} withBorder bg="brandRoyalBlue.8" c="background.0">
                <Title order={2} mb="xs" >Rozpočet a útrata</Title>
                <Text c="background.2">Rozpočet 60. ročníku je 250 milionů korun. Odhad útraty lidí na festivalu je zhruba 650 milionů korun.</Text>
                <SimpleGrid cols={2} spacing="sm" mt="lg">
                  <Paper p="md" radius={8} bg="background.2" c="var(--mantine-color-brandRoyalBlue-8)"><Text fw={900} ff="monospace">80 %</Text><Text size="sm">sponzoři</Text></Paper>
                  <Paper p="md" radius={8} bg="background.2" c="var(--mantine-color-brandRoyalBlue-8)"><Text fw={900} ff="monospace">20 %</Text><Text size="sm">veřejné zdroje</Text></Paper>
                  <Paper p="md" radius={8} bg="background.2" c="var(--mantine-color-brandRoyalBlue-8)"><Text fw={900} ff="monospace">250 mil.</Text><Text size="sm">rozpočet</Text></Paper>
                  <Paper p="md" radius={8} bg="background.2" c="var(--mantine-color-brandRoyalBlue-8)"><Text fw={900} ff="monospace">650 mil.</Text><Text size="sm">útrata</Text></Paper>
                </SimpleGrid>
                <Text mt="md">Orientačně: útrata návštěvníků je asi {spendingRatio2026.toString().replace('.', ',')}násobek festivalového rozpočtu.</Text>
              </Paper>

              <Paper p="lg" radius={8} withBorder bg="background.1">
                <Title order={2} mb="xs" >Metodická poznámka</Title>
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

        {branch.slug === 'ekonomika-pozornosti' && <PartnerPrestigeBlock />}

        {(branch.slug === 'hoste-a-prestiz' || branch.slug === 'gender-ve-varech') && <HonoraryGenderBlock />}
        {branch.slug === 'mapa-filmu' && <FilmScaleBlock />}

        <Box px={{ base: 16, md: 24 }} py={{ base: 24, md: 36 }}>
          <Paper p="lg" radius={8} withBorder bg="background.2">
            <Title order={3} mb="sm" >Hotové grafy k použití</Title>
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
            <Title order={2} >Další kapitoly</Title>
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
                <Title order={4} mt={4} >{item.title}</Title>
              </Paper>
            ))}
          </SimpleGrid>
        </Box>

        <Box px={{ base: 16, md: 24 }} py={{ base: 24, md: 36 }} bg="background.2">
          <Title order={3} mb="sm" >Pracovní zdroje</Title>
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


