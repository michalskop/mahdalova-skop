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
import { honoraryByPeriod, honoraryCrystalGlobeRecipients, honoraryDoubleWomanYears, honoraryGenderCounts, honorarySelectionNote, honoraryTotal, honoraryWomenShare, pre1989AwardsNotes } from '../honors';
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

// Český plurál: 1 žena/muž, 2-4 ženy/muži, 0 a 5+ žen/mužů
function czWomanCount(n: number) {
  return n === 1 ? 'žena' : n >= 2 && n <= 4 ? 'ženy' : 'žen';
}
function czManCount(n: number) {
  return n === 1 ? 'muž' : n >= 2 && n <= 4 ? 'muži' : 'mužů';
}

function GenderSplitBar({ label, women, men }: { label: string; women: number; men: number }) {
  const total = women + men;
  const womenWidth = total ? Math.round((women / total) * 1000) / 10 : 0;

  return (
    <Stack gap={4}>
      <Group justify="space-between">
        <Text fw={800}>{label}</Text>
        <Text style={NUM_FONT} fw={800}>{women} {czWomanCount(women)} / {men} {czManCount(men)}</Text>
      </Group>
      <Box h={16} bg="var(--mantine-color-brandNavy-6)" style={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box h="100%" w={`${womenWidth}%`} style={{ background: 'var(--mantine-color-brand-6)', borderRadius: 3 }} />
      </Box>
    </Stack>
  );
}

function formatPercent(value: number) {
  return `${value.toString().replace('.', ',')} %`;
}

function normalizeHistoryRegion(region: string) {
  return region
    .replace('SevernÃ­ Amerika', 'Severní Amerika')
    .replace('LatinskÃ¡ Amerika', 'Latinská Amerika')
    .replace('BlÃ­zkÃ½ vÃ½chod', 'Blízký východ')
    .replace('OceÃ¡nie', 'Oceánie')
    .replace('OstatnÃ­', 'Ostatní');
}

const countryHistoryPeriods = [
  { period: '1992-2003', label: 'Obnova po revoluci', from: 1992, to: 2003 },
  { period: '2004-2017', label: 'Stabilizovaná novodobá éra', from: 2004, to: 2017 },
  { period: '2018-2026', label: 'Menší katalog, více koprodukcí', from: 2018, to: 2026 },
].map((period) => {
  const rows = countryHistory.filter((row) => row.year >= period.from && row.year <= period.to);
  const regions: Record<string, number> = {};
  let films = 0;
  let coproductions = 0;
  let occurrences = 0;

  rows.forEach((row) => {
    films += row.films;
    coproductions += row.coproductions;
    Object.entries(row.regions).forEach(([region, count]) => {
      const normalized = normalizeHistoryRegion(region);
      regions[normalized] = (regions[normalized] ?? 0) + count;
      occurrences += count;
    });
  });

  return {
    ...period,
    years: rows.length,
    films,
    coproductions,
    coproductionShare: Math.round((coproductions / films) * 1000) / 10,
    occurrences,
    topRegions: Object.entries(regions)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([region, count]) => ({
        region,
        count,
        share: Math.round((count / occurrences) * 1000) / 10,
      })),
  };
});

const middleEastByPeriod = [
  { period: '1992–2003', from: 1992, to: 2003 },
  { period: '2004–2017', from: 2004, to: 2017 },
  { period: '2018–2026', from: 2018, to: 2026 },
].map(({ period, from, to }) => {
  const rows = continentHistory.filter((row) => row.year >= from && row.year <= to);
  const middleEast = rows.reduce((sum, row) => sum + (row.continents['Blízký východ'] ?? 0), 0);
  const total = rows.reduce((sum, row) => sum + Object.values(row.continents).reduce((a, b) => a + b, 0), 0);
  return { period, share: Math.round((middleEast / total) * 1000) / 10 };
});
const maxMiddleEastShare = Math.max(...middleEastByPeriod.map((row) => row.share));

function MiddleEastPanel() {
  return (
    <ChartFrame
      title="Blízký východ získává na mapě víc místa"
      subtitle="Podíl Blízkého východu na všech účastech produkčních zemí v katalogu, podle období"
      source="kviff_continents_corrected_all_years.csv – opravený souhrn proti dvojímu počítání kontinentů u koprodukcí"
      fullWidth
    >
      <Text size="lg">
        V prvních dvanácti ročnících po roce 1992 tvořil Blízký východ jen {formatPercent(middleEastByPeriod[0].share)} všech účastí produkčních zemí v katalogu. V období 2004–2017 to bylo už {formatPercent(middleEastByPeriod[1].share)} a v posledních ročnících 2018–2026 {formatPercent(middleEastByPeriod[2].share)} – podíl se tedy za tři období víc než ztrojnásobil, i když celkový katalog byl v posledním období menší než v tom prvním.
      </Text>
      <Text mt="sm">
        Nejde o to, že by Blízký východ najednou dodával desítky filmů ročně – v absolutních číslech pořád jde o menší kinematografie než evropská nebo severoamerická produkce. Roste ale jeho stabilní přítomnost v programu napříč ročníky, na rozdíl třeba od jednorázových vln typu Jižní Koreje 2001 nebo Austrálie 1997. To je čitelnější jako dlouhodobý posun v koprodukční síti a programové dramaturgii než jako náhodný výkyv jednoho ročníku.
      </Text>
      <Stack gap="sm" mt="lg">
        {middleEastByPeriod.map((row) => (
          <DataBar key={row.period} label={row.period} value={row.share} max={maxMiddleEastShare} color="var(--mantine-color-brandNavy-6)" suffix="%" />
        ))}
      </Stack>
      <Text mt="md" size="sm" c="dimmed">
        Podíl počítáme z účastí produkčních zemí (koprodukce se do kontinentu započítá jednou, i když má víc zemí ze stejného kontinentu), ne z počtu filmů – jde o vnitřní trend KVIFF, ne o srovnání s jinými festivaly nebo se světovou filmovou produkcí.
      </Text>
    </ChartFrame>
  );
}

function HonoraryDotTimeline() {
  return (
    <ChartFrame
      title="Osobnosti po letech"
      subtitle="Každá kostička je jedna oceněná osobnost, 1995–2026."
      source="Oficiální archiv KVIFF, ročník po ročníku"
      fullWidth
    >
      <HonoraryTimeline recipients={honoraryCrystalGlobeRecipients} />
      <Text mt="md" size="sm">
        Všechny kostičky v tomto grafu jsou jedna konkrétní čestná kategorie: Křišťálový glóbus za mimořádný umělecký přínos světové kinematografii. Není to cena poroty za soutěžní film, ale festivalové ocenění osobností, které dlouhodobě formovaly světový film.
      </Text>
    </ChartFrame>
  );
}

function Pre1989AwardsOverview() {
  const entries: TimelineEntry[] = pre1989AwardsNotes.map((note, index) => ({
    key: note.period,
    year: note.period,
    label: note.title,
    body: note.body,
    highlight: index === 0 || index === pre1989AwardsNotes.length - 1,
  }));

  return (
    <ChartFrame
      title="Jak se měnila logika festivalových cen"
      subtitle="Před rokem 1989 sledujeme jiný systém než dnešní čestný Křišťálový glóbus pro osobnosti: 1946 → 1990 → novodobá éra"
      source="Oficiální archiv KVIFF, festivalové ročníky"
      fullWidth
    >
      <VerticalTimeline entries={entries} />

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="sm" mt="lg">
        <Paper p="md" radius={4} bg="background.0">
          <Text fw={900}>Co je první „ocenění“?</Text>
          <Text size="sm">První dva ročníky byly nesoutěžní, takže první stopa ocenění začíná až rokem 1948.</Text>
        </Paper>
        <Paper p="md" radius={4} bg="background.0">
          <Text fw={900}>Co znamenají 60. léta?</Text>
          <Text size="sm">Festival oceňoval hlavně filmy, režii a herecké výkony, ne dnešní typ světových čestných hostů.</Text>
        </Paper>
        <Paper p="md" radius={4} bg="background.0">
          <Text fw={900}>Proč oddělujeme grafy?</Text>
          <Text size="sm">Soutěžní ceny a čestná prestiž osobností jsou dva různé mechanismy festivalové autority.</Text>
        </Paper>
      </SimpleGrid>
    </ChartFrame>
  );
}

const festivalTimelinePhases: TimelineEntry[] = [
  {
    key: '1946',
    year: '1946',
    label: 'Založení v poválečném Československu',
    body: 'První dva ročníky (1946 a 1947) byly nesoutěžní a odehrávaly se většinou v Mariánských Lázních – Karlovy Vary byly zpočátku jen vedlejší dějiště. Podle festivalu i dobových zdrojů jde o druhý nejstarší kontinuálně pořádaný filmový festival v Evropě po Benátkách.',
    highlight: true,
  },
  {
    key: '1948',
    year: '1948',
    label: 'Únorový převrat a první udělená cena',
    body: 'V témže roce, kdy komunisté ovládli Československo, se poprvé udělila hlavní soutěžní cena – dnešní Grand Prix. Znárodněná kinematografie od té chvíle diktovala i dramaturgii festivalu.',
  },
  {
    key: '1950',
    year: '1950',
    label: 'Natrvalo ve Varech, propaganda naplno',
    body: 'V pátém ročníku se festival definitivně přestěhoval do Karlových Varů. Padesátá léta zároveň přinesla inflaci cen – vedle hlavní ceny se rozdávala cena míru, cena práce, cena za boj za svobodu i cena za boj za sociální pokrok, takže s prázdnou neodešel skoro nikdo. Festivalu vládlo heslo „o nového člověka, o dokonalejší lidstvo“.',
  },
  {
    key: '1956',
    year: '1956',
    label: 'Vary vedle Cannes, Benátek a Berlína',
    body: 'FIAPF zařadila festival do prestižní kategorie A po bok největších světových přehlídek. Týž rok sem festival záměrně pozval americký film Marty – podle výzkumu historičky Jindřišky Bláhové měl po čtyřech letech mlčení pomoci obnovit obchodní kontakty mezi Hollywoodem a komunistickým československým filmovým monopolem, aniž by dráždil cenzory. Rok korunovala i kuriozita: příjezd okouzlující zahraniční herečky přiměl státní nakladatelství Orbis vydat sérii pohlednic s ní v plavkách.',
  },
  {
    key: '1959',
    year: '1959–1990',
    label: 'Střídání s Moskvou, přesto přijíždí Západ',
    body: 'Sovětský svaz chtěl mít svůj vlastní „světový“ festival, a tak se od roku 1960 Vary konají jen v sudých letech. I přesto sem míří velká jména: v roce 1964 rozvášnila davy Claudia Cardinale, přijeli i Henry Fonda a Richard Attenborough. Stejný ročník 1964 vyhráli Ján Kadár a Elmar Klos s Obžalovaným, ve kterém malou roli právníka ztvárnil Jiří Menzel – ten sám o čtyři roky později vyhrál jako režisér s Rozmarným létem.',
  },
  {
    key: '1968',
    year: '1968',
    label: 'Tanky zastaví nadějný rozvoj',
    body: 'Invaze vojsk Varšavské smlouvy přeruší roky uvolňování. Lesk festivalu z konce 60. let se vrátí až po sametové revoluci.',
  },
  {
    key: '1989',
    year: '1989–1993',
    label: 'Transformační nejistota',
    body: 'Sametová revoluce festival zbaví ideologie, ale ne chaosu – v roce 1990 nebyla udělena hlavní cena a ročník 1993 se vůbec nekonal.',
  },
  {
    key: '1994',
    year: '1994',
    label: 'Nová každoroční éra',
    body: 'Pod vedením Jiřího Bartošky festival ožívá jako soukromá instituce s pevnou každoroční periodicitou. Od tohoto roku také vzniká systematický digitální archiv – proto je 1994 metodologickým zlomem pro naše data.',
    highlight: true,
  },
  {
    key: '2020',
    year: '2020',
    label: 'Covidová pauza',
    body: 'Jediný přerušený ročník novodobé éry – pandemie covidu-19 zastavila každoroční tradici.',
  },
  {
    key: '2026',
    year: '2026',
    label: '60. ročník',
    body: 'Aktuální ročník festivalu probíhá 3.–11. července 2026.',
  },
];

function FestivalTimeline() {
  return (
    <ChartFrame
      title="Časová osa: 1946 → dnešek"
      subtitle="Kdy se festival konal, kdy se měnila periodicita a proč je rok 1994 metodologický zlom"
      source="Oficiální archiv KVIFF; iROZHLAS, Reflex.cz, Radio Prague International, J. Bláhová (Studies in European Cinema)"
      fullWidth
    >
      <VerticalTimeline entries={festivalTimelinePhases} />
    </ChartFrame>
  );
}

function HonoraryGenderBlock() {
  const latestRecipients = honoraryCrystalGlobeRecipients.slice(-8).reverse();

  return (
    <Box px={{ base: 16, md: 24 }} py={{ base: 20, md: 34 }}>
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <ChartFrame
          title="Čestná prestiž je pořád hlavně mužská"
          subtitle={`Křišťálový glóbus za mimořádný umělecký přínos, podíl žen a mužů podle období, 1995–2026`}
          source="Oficiální archiv KVIFF, ročník po ročníku"
        >
          <Text size="lg">
            V řadě Crystal Globe za mimořádný umělecký přínos světu filmu evidujeme od roku 1995 do oznámených poct roku 2026 celkem {honoraryTotal} oceněných osobností (ověřeno proti oficiálnímu archivu KVIFF a ročníkovým souhrnům cen). Žen je {honoraryGenderCounts.woman}, tedy {honoraryWomenShare.toString().replace('.', ',')} %.
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
        </ChartFrame>

        <Paper p="lg" radius={8} withBorder bg="background.1">
          <Badge w="fit-content" color="brand" variant="filled" mb="sm">Odpověď k genderu</Badge>
          <Title order={2} size="1.25rem" mb="xs">Nejde o cenu za jeden film, ale o kanonizaci osobností</Title>
          <Text size="lg">
            V této kategorii sledujeme jen Křišťálový glóbus za mimořádný umělecký přínos světové kinematografii. To je důležité: genderový graf neukazuje, kdo vyhrál soutěžní ročník, ale koho festival dlouhodobě zapisuje do vlastní paměti světového filmu.
          </Text>
          <SimpleGrid cols={3} spacing="sm" mt="lg">
            <Paper p="md" radius={8} bg="brand.0"><Text fw={900} style={NUM_FONT}>{formatPercent(honoraryWomenShare)}</Text><Text size="sm">žen v evidované řadě</Text></Paper>
            <Paper p="md" radius={8} bg="brandNavy.0"><Text fw={900} style={NUM_FONT}>{honoraryGenderCounts.man}</Text><Text size="sm">oceněných mužů</Text></Paper>
            <Paper p="md" radius={8} bg="background.2"><Text fw={900} style={NUM_FONT}>{honoraryDoubleWomanYears.join(', ')}</Text><Text size="sm">jediné roky se dvěma ženami</Text></Paper>
          </SimpleGrid>
          <Text mt="md" size="sm" c="dimmed">
            Čtení grafu níže: crimson kostičky žen nejsou rozprostřené rovnoměrně. Jediné roky, kdy ocenění dostaly dvě ženy zároveň, jsou {honoraryDoubleWomanYears.join(' a ')} – jinak jde vždy nejvýš o jednu ženu v ročníku, často žádnou.
          </Text>
        </Paper>

        <Paper p="lg" radius={8} withBorder bg="brandRoyalBlue.8" c="background.0">
          <Title order={2} size="1.25rem" mb="xs" >Sdělení do článku</Title>
          <Text c="background.2" size="lg">
            Vary umějí pozvat a ocenit velká ženská jména: od Giny Lollobrigidy, Věry Chytilové, Liv Ullmann, Sharon Stone a Isabelle Huppert po Judi Dench, Helen Mirren, Susan Sarandon, Julianne Moore, Patricii Clarkson a pro rok 2026 Juliette Binoche. Jenže právě proto je vidět, že nejde o pravidlo, ale o výjimky v dlouhé mužské řadě – od roku 1995 jde o {honoraryGenderCounts.woman} žen z {honoraryTotal} oceněných.
          </Text>
          <SimpleGrid cols={2} spacing="sm" mt="lg">
            <Paper p="md" radius={8} bg="background.2" c="var(--mantine-color-brandRoyalBlue-8)"><Text fw={900} style={NUM_FONT}>{honoraryGenderCounts.woman}</Text><Text size="sm">oceněných žen</Text></Paper>
            <Paper p="md" radius={8} bg="background.2" c="var(--mantine-color-brandRoyalBlue-8)"><Text fw={900} style={NUM_FONT}>{honoraryGenderCounts.man}</Text><Text size="sm">oceněných mužů</Text></Paper>
            <Paper p="md" radius={8} bg="background.2" c="var(--mantine-color-brandRoyalBlue-8)"><Text fw={900} style={NUM_FONT}>{honoraryDoubleWomanYears.join(', ')}</Text><Text size="sm">jediné roky se dvěma ženami</Text></Paper>
            <Paper p="md" radius={8} bg="background.2" c="var(--mantine-color-brandRoyalBlue-8)"><Text fw={900} style={NUM_FONT}>2026*</Text><Text size="sm">Hoffman, Binoche, Richardson</Text></Paper>
          </SimpleGrid>
        </Paper>

        <HonoraryDotTimeline />

        <Paper p="lg" radius={8} withBorder bg="background.2" style={{ gridColumn: '1 / -1' }}>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            <Stack gap="sm">
              <Badge w="fit-content" color="brand" variant="filled">Jak se vybírá</Badge>
              <Title order={2} size="1.25rem">Kdo rozhoduje o čestné prestiži</Title>
              <Text size="lg">{honorarySelectionNote}</Text>
              <Text>
                V grafu proto nemícháme několik typů ocenění dohromady. President&apos;s Award, Cena prezidenta za přínos české kinematografii nebo soutěžní ceny poroty budou samostatné vrstvy. Tady sledujeme jen čestný Křišťálový glóbus pro světovou kinematografii.
              </Text>
            </Stack>
            <Stack gap="sm">
              <Badge w="fit-content" color="brand" variant="filled">Před rokem 1989</Badge>
              <Title order={2} size="1.25rem">Dřív to byla jiná logika cen</Title>
              <Text>
                Předlistopadový festival neměl stejnou nepřerušenou řadu čestných celebrit. Archiv ukazuje hlavně soutěžní ceny filmům, režii a hereckým výkonům. Proto by bylo metodicky chybné přilepit rok 1948 nebo 1968 do stejného genderového grafu čestných hostů.
              </Text>
            </Stack>
          </SimpleGrid>
        </Paper>

        <Pre1989AwardsOverview />

        <Paper p="lg" radius={8} withBorder bg="background.1" style={{ gridColumn: '1 / -1' }}>
          <Title order={2} size="1.25rem" mb="md" >Poslední oceněné osobnosti v datové řadě</Title>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="sm">
            {latestRecipients.map((recipient) => (
              <Paper key={`${recipient.year}-${recipient.name}`} p="md" radius={8} withBorder bg={recipient.gender === 'woman' ? 'brand.0' : 'brandNavy.0'}>
                <Text fw={900}>{recipient.name}</Text>
                <Text size="sm" c="dimmed">{recipient.year}{recipient.status === 'announced' ? ' oznámeno' : ''} · {recipient.country}</Text>
                <Text size="sm">{recipient.roleCz}</Text>
              </Paper>
            ))}
          </SimpleGrid>
        </Paper>
      </SimpleGrid>
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

function CountryLayerMap({
  title,
  subtitle,
  rows,
  minHeight = 260,
}: {
  title: string;
  subtitle: string;
  rows: typeof countryPresence2026;
  minHeight?: number;
}) {
  const total = rows.reduce((sum, row) => sum + row.count, 0);

  return (
    <Paper p="md" radius={8} withBorder bg="background.1">
      <Group justify="space-between" align="start" mb="sm" gap="sm">
        <Stack gap={2} style={{ flex: 1 }}>
          <Text fw={900}>{title}</Text>
          <Text size="sm" c="dimmed">{subtitle}</Text>
        </Stack>
        <Text fw={900} style={NUM_FONT} size="sm">{rows.length} zemí · {total}</Text>
      </Group>
      <Box
        style={{
          position: 'relative',
          minHeight,
          borderRadius: 8,
          overflow: 'hidden',
          border: '1px solid var(--mantine-color-background-6)',
          background: 'linear-gradient(180deg, var(--mantine-color-brandTeal-0) 0%, var(--mantine-color-background-2) 100%)',
        }}
      >
        {['North America', 'Europe', 'Asia', 'Latin America', 'Africa', 'Oceania'].map((label) => {
          const positions: Record<string, { left: string; top: string }> = {
            'North America': { left: '16%', top: '30%' },
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
              style={{ position: 'absolute', ...positions[label], textTransform: 'uppercase', letterSpacing: 0, opacity: 0.58 }}
            >
              {label}
            </Text>
          );
        })}

        {rows.map((row) => {
          const point = projectCountry(row.lon, row.lat);
          const size = 7 + Math.sqrt(row.count / countryPresenceMax) * 30;
          const color = regionColors[row.region];
          return (
            <Tooltip
              key={`${title}-${row.country}`}
              label={`${row.country}: ${row.count} účastí v katalogu 2026 · ${row.region}`}
              multiline
              maw={260}
              withArrow
            >
              <Box
                component="span"
                role="img"
                aria-label={`${row.country}: ${row.count} účastí v katalogu 2026`}
                title={`${row.country}: ${row.count} účastí v katalogu 2026`}
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
                  boxShadow: '0 2px 12px rgba(17, 16, 14, 0.2)',
                  opacity: 0.88,
                  cursor: 'help',
                }}
              />
            </Tooltip>
          );
        })}
      </Box>
    </Paper>
  );
}

function CountryHistoryOverview() {
  const maxOccurrences = Math.max(...countryHistoryPeriods.map((period) => period.occurrences));

  return (
    <Paper p="lg" radius={4} bg="background.0">
      <Group justify="space-between" align="end" mb="md">
        <Stack gap={2}>
          <Badge w="fit-content" color="brand" variant="filled">Historický souhrn</Badge>
          <Title order={3} size="1.05rem">Změnilo se, odkud filmy přijíždějí?</Title>
          <Text c="dimmed">
            Film-level country dataset máme souvisle pro novodobou éru 1992-2026. Počítáme účasti produkčních zemí: u koprodukcí se jeden film započítá každé uvedené zemi.
          </Text>
        </Stack>
        <Text fw={900} style={NUM_FONT}>{countryHistory.length} ročníků</Text>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
        {countryHistoryPeriods.map((period) => (
          <Paper key={period.period} p="md" radius={8} withBorder bg="background.2">
            <Text fw={900}>{period.period}</Text>
            <Text size="sm" c="dimmed">{period.label}</Text>
            <DataBar label="účasti" value={period.occurrences} max={maxOccurrences} color="var(--mantine-color-brandTeal-6)" />
            <Text size="sm"><Text span fw={900} style={NUM_FONT}>{formatPercent(period.coproductionShare)}</Text> filmů je koprodukčních.</Text>
            <Stack gap={4} mt="sm">
              {period.topRegions.map((row) => (
                <Group key={row.region} gap="xs" wrap="nowrap">
                  <Text size="sm" style={{ flex: 1 }}>{row.region}</Text>
                  <Text size="sm" fw={900} style={NUM_FONT}>{formatPercent(row.share)}</Text>
                </Group>
              ))}
            </Stack>
          </Paper>
        ))}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mt="md">
        <Paper p="md" radius={8} withBorder bg="background.2">
          <Text fw={900}>Odpověď: Evropa zůstává jádrem, koprodukce sílí</Text>
          <Text size="sm" mt={6}>
            Ve všech novodobých obdobích tvoří evropské produkční země zhruba dvě třetiny účastí. Největší změna není prosté přesunutí festivalu z jednoho kontinentu na druhý, ale růst koprodukcí: z 14,9 % v letech 1992-2003 na 41,6 % v letech 2018-2026.
          </Text>
        </Paper>
        <Paper p="md" radius={8} withBorder bg="background.2">
          <Text fw={900}>Do roku 1989: zatím ne stejnou metodou</Text>
          <Text size="sm" mt={6}>
            Předlistopadové ročníky zatím neumíme porovnat stejným film-level výpočtem zemí jako novodobou éru. Metodicky je proto držíme odděleně: víme, že šlo o jinou institucionální a politickou logiku festivalu, ale přesné poměry zemí pro období do roku 1989 budeme tvrdit až po doplnění kompletního katalogu film po filmu.
          </Text>
        </Paper>
      </SimpleGrid>

      <Text mt="md" size="sm" c="dimmed">
        Nejčastější země v novodobém historickém souhrnu: {countryHistoryTopCountries.slice(0, 8).map(([country, count]) => `${country} ${count}`).join(' · ')}.
      </Text>
    </Paper>
  );
}

function CountryBubbleMap() {
  const europeanRows = countryPresence2026.filter((row) => row.region === 'Europe');
  const nonEuropeanRows = countryPresence2026.filter((row) => row.region !== 'Europe');
  const atlanticRows = countryPresence2026.filter((row) => ['Europe', 'North America', 'Latin America'].includes(row.region));
  const nextLayers = [
    {
      title: 'Hlavní soutěž',
      body: 'Tady budeme filtrovat jen soutěž Crystal Globe. Uvidíme, zda se prestižní výběr chová stejně jako celý katalog.',
    },
    {
      title: 'Proxima a objevy',
      body: 'Samostatná vrstva pro nové hlasy. Teprve ta ukáže, odkud festival bere riziko a budoucí jména.',
    },
    {
      title: 'Vítězové hlavních cen',
      body: 'Mapa vítězů nebude mapa prostoru v programu, ale mapa nejvyšší festivalové prestiže.',
    },
  ];

  return (
    <ChartFrame
      title="Odkud přijíždějí filmy v letošním katalogu"
      subtitle={`Bubliny = produkční země v katalogu KVIFF 2026 (${countryPresence2026.length} zemí, ${countryPresenceTotal} účastí); koprodukce se počítá každé uvedené zemi`}
      source="Katalog filmů KVIFF 2026"
      fullWidth
    >
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
                  label={`${row.country}: ${row.count} účastí v katalogu 2026 · ${row.region}`}
                  multiline
                  maw={260}
                  withArrow
                >
                  <Box
                    component="span"
                    role="img"
                    aria-label={`${row.country}: ${row.count} účastí v katalogu 2026`}
                    title={`${row.country}: ${row.count} účastí v katalogu 2026`}
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
            Pozor: toto není mapa unikátních filmů, ale mapa účastí produkčních zemí. Když má jeden film uvedené země Francie, Německo a Česko, započítá se jednou Francii, jednou Německu a jednou Česku. Součet účastí je proto vyšší než počet filmů.
          </Text>
          <Text mt="xs" size="sm">
            Co z toho plyne: nejsilnější není jen domácí česká stopa. Festival stojí na evropské koprodukční síti, do které se výrazně zapojují Francie a Německo, a zároveň má silný severoamerický pól přes USA.
          </Text>
        </Box>

        <Stack gap="md">
          <Paper p="md" radius={8} withBorder bg="brandRoyalBlue.8" c="background.0">
            <Title order={3} size="1.05rem" mb="xs" >Co z mapy číst</Title>
            <Text c="background.2">
              Letošní katalog je silně evropský, ale ne jen evropský. Po Francii, USA, Česku, Německu a Británii následuje široká vrstva koprodukčních zemí.
            </Text>
          </Paper>
          <Stack gap={6}>
            {countryPresenceTop.map((row) => (
              <Group key={row.country} gap="sm" wrap="nowrap">
                <Box w={10} h={10} bg={regionColors[row.region]} style={{ borderRadius: 999, flex: '0 0 auto' }} />
                <Text size="sm" fw={800} style={{ flex: 1 }}>{row.country}</Text>
                <Text size="sm" style={NUM_FONT} fw={900}>{row.count}</Text>
              </Group>
            ))}
          </Stack>
          <Divider />
          <Stack gap={6}>
            {countryRegionTotals.map((row) => (
              <Group key={row.region} gap="sm" wrap="nowrap">
                <Box w={10} h={10} bg={regionColors[row.region]} style={{ borderRadius: 999, flex: '0 0 auto' }} />
                <Text size="sm" style={{ flex: 1 }}>{row.region}</Text>
                <Text size="sm" style={NUM_FONT} fw={900}>{row.count}</Text>
              </Group>
            ))}
          </Stack>
        </Stack>
      </SimpleGrid>

      <Divider my="lg" />

      <Stack gap="md">
        <Stack gap={2}>
          <Title order={3} size="1.05rem">Jedna mapa nestačí</Title>
          <Text c="dimmed">
            Stejný katalog čteme ve více vrstvách. Celková mapa říká, kde se země objevují. Evropská mapa ukazuje koprodukční jádro. Mimoevropská mapa oddělí severoamerický pól, Latinskou Ameriku, Asii, Blízký východ, Afriku a Oceánii.
          </Text>
        </Stack>
        <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="md">
          <CountryLayerMap
            title="1. Všechny účasti"
            subtitle="Jedna země v jedné koprodukci znamená jednu účast."
            rows={countryPresence2026}
          />
          <CountryLayerMap
            title="2. Evropská síť"
            subtitle="Tady je vidět, že Vary stojí hlavně na francouzsko-německo-české koprodukční hustotě."
            rows={europeanRows}
          />
          <CountryLayerMap
            title="3. Mimo Evropu"
            subtitle="Odděleně vynikne USA a širší vrstva Latinské Ameriky, Asie a Blízkého východu."
            rows={nonEuropeanRows}
          />
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <CountryLayerMap
            title="4. Atlantická osa"
            subtitle="Evropa plus Severní a Latinská Amerika: dobrá kontrola, jestli obraz netáhne jen evropská dominance."
            rows={atlanticRows}
            minHeight={300}
          />
          <Paper p="md" radius={8} withBorder bg="background.2">
            <Text fw={900} mb="sm">5. Fractional count zatím kreslit nebudeme</Text>
            <Text size="sm">
              Fractional count potřebuje seznam jednotlivých filmů a jejich koprodukčních zemí. U filmu se třemi zeměmi by každá dostala třetinu bodu. Současná mapa má jen souhrnné počty účastí podle zemí, takže by „fractional mapa“ byla odhad, ne data.
            </Text>
            <Text size="sm" mt="sm" c="dimmed">
              Jakmile napojíme film-level katalog, vedle sebe poběží dvě mapy: presence count pro viditelnost zemí a fractional count pro férovější váhu koprodukcí.
            </Text>
          </Paper>
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="sm">
          {nextLayers.map((layer) => (
            <Paper key={layer.title} p="md" radius={8} withBorder bg="background.2">
              <Text fw={900}>{layer.title}</Text>
              <Text size="sm" mt={6}>{layer.body}</Text>
            </Paper>
          ))}
        </SimpleGrid>
        <CountryHistoryOverview />
      </Stack>
    </ChartFrame>
  );
}

function ProgramCompositionGraphic({ maxFilms }: { maxFilms: number }) {
  const maxBreakdownFilms = Math.max(...completeBreakdownRows.map((row) => row.totalFilms ?? 0));

  return (
    <ChartFrame
      title="Novější roky: co je uvnitř katalogu"
      subtitle="Skladba programu (hrané / dokumenty / krátké filmy), ročníky s úplným členěním, 1995–2025"
      source="Oficiální finální statistiky ročníků KVIFF"
      fullWidth
    >
      <Text c="dimmed" maw={760} mb="md">
        Historickou řadu držíme jako kontext od roku 1995. Barevně rozkládáme jen roky, kde máme bezpečně oddělené kategorie hraných celovečerních filmů, dokumentárních celovečerních filmů a krátkých filmů.
      </Text>

      <Box mb="xl">
        <Group justify="space-between" mb={6} wrap="wrap">
          <Text fw={900}>Celá dostupná řada: kolik filmů festival uváděl</Text>
          <Group gap={12} wrap="nowrap">
            <Group gap={5} wrap="nowrap">
              <Box w={9} h={9} bg="var(--mantine-color-brandTeal-6)" style={{ borderRadius: 999, flex: '0 0 auto' }} />
              <Text size="sm" c="dimmed">má členění</Text>
            </Group>
            <Group gap={5} wrap="nowrap">
              <Box w={9} h={9} bg="var(--mantine-color-background-7)" style={{ borderRadius: 999, flex: '0 0 auto' }} />
              <Text size="sm" c="dimmed">jen celkový počet</Text>
            </Group>
          </Group>
        </Group>
        <Box style={{ overflowX: 'auto', paddingBottom: 8 }}>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${filmCountAvailableRows.length}, minmax(26px, 1fr))`,
              gap: 5,
              minWidth: 940,
              alignItems: 'end',
              minHeight: 130,
              borderBottom: '1px solid var(--mantine-color-background-6)',
            }}
          >
            {filmCountAvailableRows.map((row) => {
              const height = Math.max(8, Math.round(((row.totalFilms ?? 0) / maxFilms) * 104));
              const hasBreakdown = row.availability === 'full-breakdown';
              const tooltip = [
                `${row.year}${row.edition ? ` · ${row.edition}. ročník` : ''}`,
                `${row.totalFilms} filmů celkem`,
                hasBreakdown ? 'máme úplné členění programu' : 'máme jen celkový počet',
                row.note ?? null,
              ].filter(Boolean).join(' · ');

              return (
                <Tooltip key={row.year} label={tooltip} multiline maw={320} withArrow>
                  <Stack gap={4} align="center" justify="end" title={tooltip} style={{ cursor: 'help' }}>
                    <Box
                      aria-label={`${row.year}: ${row.totalFilms} filmů`}
                      style={{
                        width: 13,
                        height,
                        borderRadius: '5px 5px 0 0',
                        background: hasBreakdown ? 'var(--mantine-color-brandTeal-6)' : 'var(--mantine-color-background-7)',
                        boxShadow: row.year === peakFilmYear.year ? '0 0 0 2px var(--mantine-color-brandRoyalBlue-8)' : undefined,
                      }}
                    />
                    <Text size="xs" fw={hasBreakdown ? 900 : 700} c={hasBreakdown ? 'var(--mantine-color-brandTeal-7)' : 'dimmed'}>
                      {String(row.year).slice(2)}
                    </Text>
                  </Stack>
                </Tooltip>
              );
            })}
          </Box>
        </Box>
      </Box>

      <ProgramBreakdownChart rows={completeBreakdownRows} maxBreakdownFilms={maxBreakdownFilms} />

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="sm" mt="lg">
        <Box>
          <Text fw={900}>Co je vidět hned</Text>
          <Text size="sm">V letech s úplným členěním tvoří hrané celovečerní filmy pokaždé zhruba šest desetin programu.</Text>
        </Box>
        <Box>
          <Text fw={900}>Co se mění</Text>
          <Text size="sm">Krátké filmy jsou v roce 2025 početnější než dokumentární celovečerní filmy a drží programovou pestrost menšího katalogu.</Text>
        </Box>
        <Box>
          <Text fw={900}>Co zatím nevíme</Text>
          <Text size="sm">Starší roky neumíme touto skladbou poctivě dovybarvit. Kdybychom to udělali, tvářili bychom se přesněji, než dovolují zdroje.</Text>
        </Box>
      </SimpleGrid>
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
          fullWidth
      >
        <FilmOriginsDashboard />
      </ChartFrame>

      <MiddleEastPanel />

      <ChartFrame
        title="Program se po maximu zmenšil, ale zhoustl"
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

        <Paper p="lg" radius={8} withBorder bg="brandRoyalBlue.8" c="background.0">
          <Title order={2} size="1.25rem" mb="xs" >Co to znamená pro země</Title>
          <Text c="background.2" size="lg">
            Země v čase nepůjde férově číst jen jako mapa všech vlaječek. Koprodukce budeme počítat dvěma způsoby: presence count řekne, kde se země objevila, fractional count rozdělí jeden film mezi všechny produkční země. Teprve rozdíl ukáže, jestli festival otevíral prostor novým regionům, nebo jen častěji uváděl mezinárodní koprodukce.
          </Text>
          <SimpleGrid cols={2} spacing="sm" mt="lg">
            <Paper p="md" radius={8} bg="background.2" c="var(--mantine-color-brandRoyalBlue-8)"><Text fw={900} style={NUM_FONT}>{peakFilmYear.totalFilms}</Text><Text size="sm">filmů v maximu {peakFilmYear.year}</Text></Paper>
            <Paper p="md" radius={8} bg="background.2" c="var(--mantine-color-brandRoyalBlue-8)"><Text fw={900} style={NUM_FONT}>{latestClosedFilmYear.totalFilms}</Text><Text size="sm">filmů v roce {latestClosedFilmYear.year}</Text></Paper>
            <Paper p="md" radius={8} bg="background.2" c="var(--mantine-color-brandRoyalBlue-8)"><Text fw={900} style={NUM_FONT}>{latestScreeningsPerFilm.toString().replace('.', ',')}</Text><Text size="sm">projekce na film v roce {latestClosedFilmYear.year}</Text></Paper>
            <Paper p="md" radius={8} bg="background.2" c="var(--mantine-color-brandRoyalBlue-8)"><Text fw={900} style={NUM_FONT}>2x</Text><Text size="sm">metoda pro koprodukce</Text></Paper>
          </SimpleGrid>
        </Paper>

        <Paper p="lg" radius={8} withBorder bg="background.2" style={{ gridColumn: '1 / -1' }}>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            <Stack gap="sm">
              <Badge w="fit-content" color="brand" variant="filled">Kdo vybírá filmy</Badge>
              <Title order={2} size="1.25rem" >Program není práce poroty. Porota až hodnotí.</Title>
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

        <ChartFrame
          title="Filmy a projekce po ročnících"
          subtitle="Velikost katalogu a počet projekcí, s křivkou projekční hustoty (projekce na jeden film), 1996–2025"
          source="Oficiální finální statistiky ročníků KVIFF"
          fullWidth
        >
          <FilmScreeningsChart
            rows={filmCountAvailableRows}
            maxFilms={maxFilms}
            peakYear={peakFilmYear.year}
            latestClosedYear={latestClosedFilmYear.year}
          />
          <Text mt="md" size="sm" c="dimmed">
            Čtení grafu: tyrkysové sloupce ukazují počet filmů, oranžové počet projekcí a crimson linka poměr projekcí na jeden film. Po roce 2003 klesá šířka katalogu, ale hustota projekcí neklesá stejným tempem. To samo o sobě není důkaz poklesu prestiže festivalu.
          </Text>
          <Text mt="xs" size="sm">
            Přesnější interpretace je střídmější: Vary se posunuly od obřího katalogu k užšímu výběru, kterému dávají víc projekčního prostoru. Pro publikum to může znamenat lepší dostupnost programu, protože vybraný film se častěji nepromítne jen jednou nebo dvakrát.
          </Text>
          <Text mt="xs" size="sm">
            Prestiž proto neměříme samotným počtem titulů. Korektnější bude sledovat také premiérový status, soutěžní sekce, hosty, účast filmového průmyslu, kritickou odezvu a další cestu filmů po festivalu. Teprve tyto vrstvy ukážou, zda menší katalog znamená silnější kurátorský výběr, nebo zúžení prostoru pro objev a menší kinematografie.
          </Text>
        </ChartFrame>

        <ProgramCompositionGraphic maxFilms={maxFilms} />

        <ChartFrame
          title="Kontinenty po ročnících, skládané na sebe"
          subtitle="Účasti produkčních zemí podle kontinentu, 1992–2026 – přepínatelné mezi absolutním počtem a podílem na ročníku"
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
              <Paper p="md" radius={4} bg="background.0" style={{ cursor: 'help' }}>
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

        {branch.slug === 'historie-festivalu-v-datech' ? (
          <Box px={{ base: 16, md: 24 }} py={{ base: 24, md: 36 }}>
            <FestivalTimeline />
          </Box>
        ) : (
          <Box px={{ base: 16, md: 24 }} py={{ base: 24, md: 36 }}>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
              {branch.metrics.map((metric) => (
                <Paper key={metric} p="md" radius={8} withBorder style={{ borderTop: `5px solid ${branch.accent}` }}>
                  <Text fw={800}>{metric}</Text>
                </Paper>
              ))}
            </SimpleGrid>
          </Box>
        )}

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

        {branch.slug === 'ekonomika-pozornosti' && (
          <Box px={{ base: 16, md: 24 }} py={{ base: 20, md: 34 }}>
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Paper p="lg" radius={8} withBorder bg="background.1">
                <Title order={2} size="1.25rem" mb="xs" >Prodané vstupenky</Title>
                <Text c="dimmed" mb="md">Roky 2023-2025 jsou finální statistiky, rok 2026 je průběžný stav k 8. 7. v 10:00.</Text>
                {finalStats.map((row) => (
                  <DataBar key={row.year} label={String(row.year)} value={row.tickets} max={maxTickets} />
                ))}
                <DataBar label="2026*" value={current2026.tickets} max={maxTickets} color="var(--mantine-color-brandOrange-6)" />
                <Text mt="md">Průběžný rok 2026 je už na {ticketShare2026.toString().replace('.', ',')} % finálního počtu prodaných vstupenek roku 2025.</Text>
              </Paper>

              <Paper p="lg" radius={8} withBorder bg="background.1">
                <Title order={2} size="1.25rem" mb="xs" >Pozornost mimo kinosály</Title>
                <Text c="dimmed" mb="md">Vybrané ukazatele 2026 proti finální statistice 2025.</Text>
                <DataBar label="Fest.Passy" value={passesShare2026} max={110} color="var(--mantine-color-brandTeal-6)" suffix="%" />
                <DataBar label="Novináři" value={journalistsShare2026} max={110} color="var(--mantine-color-brandTeal-6)" suffix="%" />
                <DataBar label="Industry" value={industryShare2026} max={110} color="var(--mantine-color-brandTeal-6)" suffix="%" />
                <Text mt="md">Pasy, média a filmový trh jsou v průběžném srovnání velmi blízko loňskému finálnímu stavu, nebo už nad ním.</Text>
              </Paper>

              <Paper p="lg" radius={8} withBorder bg="brandRoyalBlue.8" c="background.0">
                <Title order={2} size="1.25rem" mb="xs" >Rozpočet a útrata</Title>
                <Text c="background.2">Rozpočet 60. ročníku je 250 milionů korun. Odhad útraty lidí na festivalu je zhruba 650 milionů korun.</Text>
                <SimpleGrid cols={2} spacing="sm" mt="lg">
                  <Paper p="md" radius={8} bg="background.2" c="var(--mantine-color-brandRoyalBlue-8)"><Text fw={900} style={NUM_FONT}>80 %</Text><Text size="sm">sponzoři</Text></Paper>
                  <Paper p="md" radius={8} bg="background.2" c="var(--mantine-color-brandRoyalBlue-8)"><Text fw={900} style={NUM_FONT}>20 %</Text><Text size="sm">veřejné zdroje</Text></Paper>
                  <Paper p="md" radius={8} bg="background.2" c="var(--mantine-color-brandRoyalBlue-8)"><Text fw={900} style={NUM_FONT}>250 mil.</Text><Text size="sm">rozpočet</Text></Paper>
                  <Paper p="md" radius={8} bg="background.2" c="var(--mantine-color-brandRoyalBlue-8)"><Text fw={900} style={NUM_FONT}>650 mil.</Text><Text size="sm">útrata</Text></Paper>
                </SimpleGrid>
                <Text mt="md">Orientačně: útrata návštěvníků je asi {spendingRatio2026.toString().replace('.', ',')}násobek festivalového rozpočtu.</Text>
              </Paper>

              <Paper p="lg" radius={8} withBorder bg="background.1">
                <Title order={2} size="1.25rem" mb="xs" >Metodická poznámka</Title>
                <Text>
                  Průběžná čísla 2026 nesmíme míchat s finálními statistikami starších ročníků. U vstupenek jde o rozběhnutý ročník proti uzavřeným rokům; u rozpočtu a útraty jde o velikost ekonomické stopy, ne o zisk festivalu.
                </Text>
              </Paper>
            </SimpleGrid>
          </Box>
        )}

        {branch.slug === 'ekonomika-pozornosti' && <PartnerPrestigeBlock />}

        {(branch.slug === 'hoste-a-prestiz' || branch.slug === 'oceneni-v-datech') && <HonoraryGenderBlock />}
        {branch.slug === 'mapa-filmu' && <FilmScaleBlock />}
        {branch.slug === 'crystal-globe' && <CrystalGlobeBlock />}

        <Divider my="md" />

        <Box px={{ base: 16, md: 24 }} py={{ base: 24, md: 36 }}>
          <Group justify="space-between" align="end" mb="md">
            <Title order={2} size="1.25rem" >Další kapitoly</Title>
            <Button component={Link} href="/specialy/kviff" variant="outline">Zpět na landing page</Button>
          </Group>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
            {kviffBranches.filter((item) => item.slug !== branch.slug).map((item) => (
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

        <Box px={{ base: 16, md: 24 }} py={{ base: 24, md: 36 }} bg="background.2">
          <Title order={3} size="1.05rem" mb="sm" >Pracovní zdroje</Title>
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
