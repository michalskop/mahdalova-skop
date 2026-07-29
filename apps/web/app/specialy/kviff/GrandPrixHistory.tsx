import { Box, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import ChartFrame, { NUM_FONT } from './ChartFrame';
import type { GrandPrixWinner } from './grandPrix';

const BLOC_COLOR: Record<GrandPrixWinner['bloc'], string> = {
  socialisticky: 'var(--mantine-color-brandNavy-6)',
  ostatni: 'var(--mantine-color-brandTeal-6)',
};

function WinnerTile({ winner }: { winner: GrandPrixWinner }) {
  if (!winner.awarded) {
    return (
      <Group gap="md" wrap="nowrap" align="flex-start">
        <Box
          style={{
            width: 58,
            minWidth: 58,
            padding: '7px 4px',
            borderRadius: 4,
            border: '2px dashed var(--mantine-color-background-7)',
            textAlign: 'center',
          }}
        >
          <Text size="sm" fw={800} style={NUM_FONT}>{winner.year}</Text>
        </Box>
        <Text size="sm" c="dimmed" pt={7}>Hlavní cena nebyla udělena.</Text>
      </Group>
    );
  }

  return (
    <Group gap="md" wrap="nowrap" align="flex-start">
      <Box
        style={{
          width: 58,
          minWidth: 58,
          padding: '7px 4px',
          borderRadius: 4,
          border: `2px solid ${BLOC_COLOR[winner.bloc]}`,
          textAlign: 'center',
        }}
      >
        <Text size="sm" fw={800} style={NUM_FONT}>{winner.year}</Text>
      </Box>
      <Stack gap={2}>
        <Text fw={800} lh={1.25}>{winner.filmCz}</Text>
        {winner.filmCz !== winner.filmOriginal && (
          <Text size="sm" c="dimmed" fs="italic">{winner.filmOriginal}</Text>
        )}
        <Text size="sm">Režie: {winner.directors.join(', ')}</Text>
        <Text size="sm" c="dimmed">{winner.countries.join(', ')}</Text>
      </Stack>
    </Group>
  );
}

function WinnerTimeline({ winners }: { winners: GrandPrixWinner[] }) {
  const byYear = new Map<number, GrandPrixWinner[]>();
  winners.forEach((winner) => {
    const rows = byYear.get(winner.year) ?? [];
    rows.push(winner);
    byYear.set(winner.year, rows);
  });

  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" verticalSpacing="md">
      {Array.from(byYear.entries()).map(([year, yearWinners]) => (
        <Box
          key={year}
          pl="md"
          py={4}
          style={{ borderLeft: '2px solid var(--mantine-color-background-6)' }}
        >
          <Stack gap="sm">
            {yearWinners.map((winner) => (
              <WinnerTile key={`${winner.year}-${winner.filmCz || 'none'}`} winner={winner} />
            ))}
          </Stack>
        </Box>
      ))}
    </SimpleGrid>
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
      <Text mt="xs" size="sm">
        Převahu měly země sovětského bloku, hlavní cenu však získaly také filmy z USA, Francie, Indie, Japonska nebo Austrálie.
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
