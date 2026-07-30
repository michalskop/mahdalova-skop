import { Box, Group, Stack, Text } from '@mantine/core';
import Timeline from '@/components/common/Timeline';
import ChartFrame, { NUM_FONT } from './ChartFrame';
import type { GrandPrixWinner } from './grandPrix';
import { communistEraTimeline, postRevolutionTimeline } from './grandPrixTimeline';

const BLOC_COLOR: Record<GrandPrixWinner['bloc'], string> = {
  socialisticky: 'var(--mantine-color-brandNavy-6)',
  ostatni: 'var(--mantine-color-brandTeal-6)',
};

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

// Souhrnná legenda barev bloku pro unit chart (stejný význam jako facet štítky
// v časové ose níže, tady popisuje jen čtverečky nad ní).
function BlocLegend() {
  return (
    <Group gap="lg" mt="md">
      <Group gap={6}>
        <Box w={12} h={12} style={{ borderRadius: 3, background: BLOC_COLOR.socialisticky }} />
        <Text size="sm">země sovětského bloku</Text>
      </Group>
      <Group gap={6}>
        <Box w={12} h={12} style={{ borderRadius: 3, background: BLOC_COLOR.ostatni }} />
        <Text size="sm">ostatní země</Text>
      </Group>
    </Group>
  );
}

export function CommunistEraGrandPrix({ winners }: { winners: GrandPrixWinner[] }) {
  const socialisticky = winners.filter((w) => w.awarded && w.bloc === 'socialisticky').length;
  const ostatni = winners.filter((w) => w.awarded && w.bloc === 'ostatni').length;

  return (
    <Stack gap="lg">
      <ChartFrame
        title="Grand Prix v komunistické éře (1948–1989)"
        subtitle={`Vítězný film každého soutěžního ročníku; ${socialisticky} vítězů ze zemí sovětského bloku a ${ostatni} z ostatních zemí`}
        source="Česká Wikipedie, heslo Křišťálový globus (tabulka Grand Prix)"
        fullWidth
      >
        <Text size="sm" c="dimmed">
          Od roku 1959 se Karlovy Vary kvůli politickému rozhodnutí střídaly s Moskevským filmovým festivalem. Proto se v šedesátých až osmdesátých letech konaly převážně v sudých letech.
        </Text>
        <Text mt="xs" size="sm" fw={700}>
          Převahu měly země sovětského bloku, ale ne bez výjimek – ve třech ze čtyř desetiletí občas hlavní cenu získal i film odjinud.
        </Text>
        <BlocLegend />
        <GrandPrixUnitChart winners={winners} />
        <Text size="xs" c="dimmed">
          Každý čtvereček je jeden udělený ročník; podepsané čtverečky ukazují zemi vítěze mimo sovětský blok.
        </Text>
      </ChartFrame>

      <Timeline content={communistEraTimeline(winners)} />
    </Stack>
  );
}

export function PostRevolutionGrandPrix({ winners }: { winners: GrandPrixWinner[] }) {
  return (
    <Stack gap="sm">
      <Timeline content={postRevolutionTimeline(winners)} />
      <Text size="sm" c="dimmed" maw={780}>
        V roce 1990 se hlavní cena neudělila. Od obnovení každoročního festivalu v roce 1994 ji získávají filmy z malých i velkých kinematografií; prvním českým vítězem novodobé éry byla Jízda Jana Svěráka v roce 1995. Zdroj: Česká Wikipedie, heslo Křišťálový globus (tabulka Grand Prix).
      </Text>
    </Stack>
  );
}
