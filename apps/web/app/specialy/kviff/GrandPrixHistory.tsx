import { Box, Group, Paper, Stack, Text } from '@mantine/core';
import ChartFrame, { NUM_FONT } from './ChartFrame';
import type { GrandPrixWinner } from './grandPrix';

const BLOC_COLOR: Record<GrandPrixWinner['bloc'], string> = {
  socialisticky: 'var(--mantine-color-brandNavy-6)',
  ostatni: 'var(--mantine-color-brandTeal-6)',
};

// Kompaktní obsah karty pro cikcak osu – rok je v uzlu osy, karta nese jen film.
function WinnerCardBody({ winner }: { winner: GrandPrixWinner }) {
  if (!winner.awarded) {
    return <Text size="sm" c="dimmed" fs="italic">Hlavní cena nebyla udělena.</Text>;
  }
  return (
    <Box style={{ borderLeft: `3px solid ${BLOC_COLOR[winner.bloc]}`, paddingLeft: 10 }}>
      <Text fw={800} size="sm" lh={1.2}>{winner.filmCz}</Text>
      {winner.filmCz !== winner.filmOriginal && (
        <Text size="xs" c="dimmed" fs="italic" lh={1.2}>{winner.filmOriginal}</Text>
      )}
      <Text size="xs" mt={3}>Režie: {winner.directors.join(', ')}</Text>
      <Text size="xs" c="dimmed">{winner.countries.join(', ')}</Text>
    </Box>
  );
}

const DECADE_BUCKETS = [
  { label: '1948–59', from: 1948, to: 1959 },
  { label: '1960–69', from: 1960, to: 1969 },
  { label: '1970–79', from: 1970, to: 1979 },
  { label: '1980–89', from: 1980, to: 1989 },
];

// Krátké popisky zemí pro anotaci přímo u jednotky v grafu (ne v legendě) –
// zkráceno jen kvůli šířce sloupce, plný název zůstává v datech i tooltipu.
const SHORT_COUNTRY: Record<string, string> = {
  'Spojené království': 'Británie',
};

function shortCountry(countries: string[]) {
  const first = countries[0] ?? '';
  return SHORT_COUNTRY[first] ?? first;
}

// Unit chart: každý čtvereček je jeden udělený ročník (ne agregovaný podíl).
// Seskupeno po dekádách, aby byl vidět i časový vzorec. Výjimky mimo blok
// mají zemi napsanou přímo pod čtverečkem – anotace v grafu, ne v legendě.
function GrandPrixUnitChart({ winners }: { winners: GrandPrixWinner[] }) {
  const awarded = winners.filter((w) => w.awarded).sort((a, b) => a.year - b.year);
  const decades = DECADE_BUCKETS.map((bucket) => ({
    ...bucket,
    items: awarded.filter((w) => w.year >= bucket.from && w.year <= bucket.to),
  }));

  return (
    <Group gap={26} align="flex-start" wrap="wrap" mt="sm" mb="xs">
      {decades.map((decade) => {
        const ostatniCount = decade.items.filter((w) => w.bloc === 'ostatni').length;
        return (
          <Stack key={decade.label} gap={8} align="center" style={{ maxWidth: 168 }}>
            <Group gap={4} justify="center">
              {decade.items.map((winner) => (
                <Stack key={`${winner.year}-${winner.filmCz}`} gap={2} align="center" style={{ width: 24 }}>
                  <Box
                    w={20}
                    h={20}
                    title={`${winner.year} · ${winner.filmCz} (${winner.countries.join(', ')})`}
                    style={{ borderRadius: 4, background: BLOC_COLOR[winner.bloc] }}
                  />
                  {winner.bloc === 'ostatni' && (
                    <Text fw={700} ta="center" lh={1.05} style={{ ...NUM_FONT, fontSize: 9 }}>
                      {shortCountry(winner.countries)}
                    </Text>
                  )}
                </Stack>
              ))}
            </Group>
            <Text size="xs" fw={800} style={NUM_FONT}>{decade.label}</Text>
            {ostatniCount === 0 && (
              <Text c="dimmed" ta="center" lh={1.2} style={{ fontSize: 10 }}>ani jedna výhra mimo blok</Text>
            )}
          </Stack>
        );
      })}
    </Group>
  );
}

// Cikcak vertikální časová osa (§7, §18): čas plyne shora dolů, roky se
// střídají po obou stranách centrální osy. Na mobilu osa u levého okraje a
// jednosloupcový tok. Rok je v uzlu na ose, barva uzlu = blok vítěze.
function WinnerTimeline({ winners }: { winners: GrandPrixWinner[] }) {
  const byYear = new Map<number, GrandPrixWinner[]>();
  winners.forEach((winner) => {
    const rows = byYear.get(winner.year) ?? [];
    rows.push(winner);
    byYear.set(winner.year, rows);
  });
  const years = Array.from(byYear.entries());

  return (
    <Box style={{ position: 'relative' }}>
      <style>{`
        .gpz-axis { position: absolute; top: 10px; bottom: 10px; width: 3px; left: 50%; transform: translateX(-50%); background: var(--mantine-color-brandNavy-3); border-radius: 2px; }
        .gpz-row { display: grid; grid-template-columns: 1fr 52px 1fr; column-gap: 16px; align-items: center; margin-bottom: 12px; }
        .gpz-row:last-child { margin-bottom: 0; }
        .gpz-card { grid-column: 1; }
        .gpz-row.right .gpz-card { grid-column: 3; }
        .gpz-node { grid-column: 2; display: flex; justify-content: center; }
        .gpz-spacer { grid-column: 3; }
        .gpz-row.right .gpz-spacer { grid-column: 1; }
        @media (max-width: 720px) {
          .gpz-axis { left: 21px; }
          .gpz-row { grid-template-columns: 42px 1fr; column-gap: 12px; }
          .gpz-card, .gpz-row.right .gpz-card { grid-column: 2; }
          .gpz-node { grid-column: 1; }
          .gpz-spacer { display: none; }
        }
      `}</style>
      <div className="gpz-axis" aria-hidden="true" />
      {years.map(([year, yearWinners], i) => {
        const awardedWinner = yearWinners.find((w) => w.awarded);
        const nodeColor = awardedWinner ? BLOC_COLOR[awardedWinner.bloc] : 'transparent';
        return (
          <div key={year} className={`gpz-row${i % 2 === 0 ? '' : ' right'}`}>
            <div className="gpz-card">
              <Paper withBorder p="xs" radius={8} bg="background.0">
                <Stack gap={8}>
                  {yearWinners.map((winner) => (
                    <WinnerCardBody key={`${winner.year}-${winner.filmCz || 'none'}`} winner={winner} />
                  ))}
                </Stack>
              </Paper>
            </div>
            <div className="gpz-node">
              <Box
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 999,
                  background: nodeColor,
                  border: awardedWinner ? '3px solid var(--mantine-color-background-1)' : '2px dashed var(--mantine-color-background-8)',
                  boxShadow: awardedWinner ? '0 0 0 1px var(--mantine-color-background-6)' : 'none',
                  display: 'grid',
                  placeItems: 'center',
                  flex: '0 0 auto',
                }}
              >
                <Text fw={900} ta="center" lh={1} c={awardedWinner ? 'background.0' : 'dimmed'} style={{ ...NUM_FONT, fontSize: 11 }}>
                  {year}
                </Text>
              </Box>
            </div>
            <div className="gpz-spacer" />
          </div>
        );
      })}
    </Box>
  );
}

export function CommunistEraGrandPrix({ winners }: { winners: GrandPrixWinner[] }) {
  const socialisticky = winners.filter((winner) => winner.awarded && winner.bloc === 'socialisticky').length;
  const ostatni = winners.filter((winner) => winner.awarded && winner.bloc === 'ostatni').length;

  return (
    <ChartFrame
      title="Grand Prix v komunistické éře (1948–1989)"
      subtitle={`Vítězný film každého soutěžního ročníku; ${socialisticky} vítězů ze zemí sovětského bloku a ${ostatni} z ostatních zemí`}
      source="Česká Wikipedie, heslo Křišťálový globus (tabulka Grand Prix)"
      fullWidth
    >
      <Group gap="lg" mb="lg">
        <Group gap={6}>
          <Box w={12} h={12} style={{ borderRadius: 3, background: BLOC_COLOR.socialisticky }} />
          <Text size="sm">země sovětského bloku</Text>
        </Group>
        <Group gap={6}>
          <Box w={12} h={12} style={{ borderRadius: 3, background: BLOC_COLOR.ostatni }} />
          <Text size="sm">ostatní země</Text>
        </Group>
        <Group gap={6}>
          <Box w={12} h={12} style={{ borderRadius: 3, border: '2px dashed var(--mantine-color-background-7)' }} />
          <Text size="sm">cena neudělena</Text>
        </Group>
      </Group>
      <WinnerTimeline winners={winners} />
      <Text mt="lg" size="sm" c="dimmed">
        Od roku 1959 se Karlovy Vary kvůli politickému rozhodnutí střídaly s Moskevským filmovým festivalem. Proto se v šedesátých až osmdesátých letech konaly převážně v sudých letech.
      </Text>
      <Text mt="xs" size="sm" fw={700}>
        Převahu měly země sovětského bloku, ale ne bez výjimek – ve třech ze čtyř desetiletí občas hlavní cenu získal i film odjinud.
      </Text>
      <GrandPrixUnitChart winners={winners} />
      <Text size="xs" c="dimmed">
        Každý čtvereček je jeden udělený ročník; podepsané čtverečky ukazují zemi vítěze mimo sovětský blok.
      </Text>
    </ChartFrame>
  );
}

export function PostRevolutionGrandPrix({ winners }: { winners: GrandPrixWinner[] }) {
  return (
    <ChartFrame
      title="Grand Prix po roce 1989 (1990–2025)"
      subtitle="Vítězný film každého ročníku otevřené mezinárodní soutěže"
      source="Česká Wikipedie, heslo Křišťálový globus (tabulka Grand Prix)"
      fullWidth
    >
      <WinnerTimeline winners={winners} />
      <Text mt="lg" size="sm" c="dimmed">
        V roce 1990 se hlavní cena neudělila. Od obnovení každoročního festivalu v roce 1994 ji získávají filmy z malých i velkých kinematografií; prvním českým vítězem novodobé éry byla Jízda Jana Svěráka v roce 1995.
      </Text>
    </ChartFrame>
  );
}
