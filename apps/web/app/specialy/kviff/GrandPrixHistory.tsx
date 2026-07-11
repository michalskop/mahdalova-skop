import { Badge, Box, Group, SimpleGrid, Stack, Text, Tooltip } from '@mantine/core';
import ChartFrame, { NUM_FONT } from './ChartFrame';
import type { GrandPrixWinner } from './grandPrix';

// Soutěžní Grand Prix (Křišťálový glóbus pro nejlepší film) je JINÁ cena než
// čestný osobní Křišťálový glóbus za mimořádný umělecký přínos v honors.ts /
// HonoraryTimeline.tsx – tady jde o film, ne o osobnost, a řada sahá až do
// roku 1948. Dva samostatné grafy podle éry (komunistická / porevoluční),
// protože logika výběru vítěze byla v obou obdobích jiná – viz text u grafů.

const BLOC_COLOR: Record<GrandPrixWinner['bloc'], string> = {
  socialisticky: 'var(--mantine-color-brandNavy-6)',
  ostatni: 'var(--mantine-color-brandTeal-6)',
};

function WinnerTile({ winner }: { winner: GrandPrixWinner }) {
  if (!winner.awarded) {
    return (
      <Stack gap={4} align="center" justify="end" style={{ minWidth: 78 }}>
        <Box
          style={{
            width: 44,
            height: 44,
            borderRadius: 6,
            border: '2px dashed var(--mantine-color-background-7)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Text size="xs" c="dimmed" ta="center" lh={1.1}>
            cena{' '}nebyla{' '}udělena
          </Text>
        </Box>
        <Text size="xs" fw={800} style={NUM_FONT} c="dimmed">{winner.year}</Text>
      </Stack>
    );
  }

  const tooltip = [
    `${winner.year}: ${winner.filmCz}${winner.filmCz !== winner.filmOriginal ? ` (${winner.filmOriginal})` : ''}`,
    `Režie: ${winner.directors.join(', ')}`,
    `Země: ${winner.countries.join(', ')}`,
  ].join(' · ');

  return (
    <Tooltip label={tooltip} multiline maw={320} withArrow>
      <Stack gap={4} align="center" justify="end" style={{ minWidth: 92, cursor: 'help' }}>
        <Box
          style={{
            width: 78,
            minHeight: 60,
            borderRadius: 6,
            padding: '6px 8px',
            background: 'var(--mantine-color-background-1)',
            border: `2px solid ${BLOC_COLOR[winner.bloc]}`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Text size="xs" fw={800} lh={1.15} lineClamp={3}>{winner.filmCz}</Text>
        </Box>
        <Text size="xs" fw={800} style={NUM_FONT} c={winner.bloc === 'socialisticky' ? 'var(--mantine-color-brandNavy-7)' : 'var(--mantine-color-brandTeal-7)'}>
          {winner.year}
        </Text>
      </Stack>
    </Tooltip>
  );
}

function WinnerRow({ winners }: { winners: GrandPrixWinner[] }) {
  const byYear = new Map<number, GrandPrixWinner[]>();
  winners.forEach((w) => {
    const arr = byYear.get(w.year) ?? [];
    arr.push(w);
    byYear.set(w.year, arr);
  });
  return (
    <Box style={{ overflowX: 'auto', paddingBottom: 8 }}>
      <Group gap={6} wrap="nowrap" style={{ minWidth: 'max-content' }} align="end">
        {Array.from(byYear.entries()).map(([year, ws]) => (
          <Stack key={year} gap={4}>
            {ws.map((w) => (
              <WinnerTile key={`${w.year}-${w.filmCz || 'none'}`} winner={w} />
            ))}
          </Stack>
        ))}
      </Group>
    </Box>
  );
}

export function CommunistEraGrandPrix({ winners }: { winners: GrandPrixWinner[] }) {
  const socialisticky = winners.filter((w) => w.awarded && w.bloc === 'socialisticky').length;
  const ostatni = winners.filter((w) => w.awarded && w.bloc === 'ostatni').length;
  return (
    <ChartFrame
      title="Grand Prix v éře komunistické (1948–1989)"
      subtitle={`Vítězný film každého ročníku soutěže; ${socialisticky} vítězů ze zemí sovětského bloku, ${ostatni} odjinud`}
      source="Česká Wikipedie, heslo Křišťálový glóbus (tabulka Grand Prix)"
      fullWidth
    >
      <Group gap="lg" mb="md">
        <Group gap={6}>
          <Box w={12} h={12} style={{ borderRadius: 3, background: BLOC_COLOR.socialisticky }} />
          <Text size="sm">země sovětského bloku</Text>
        </Group>
        <Group gap={6}>
          <Box w={12} h={12} style={{ borderRadius: 3, background: BLOC_COLOR.ostatni }} />
          <Text size="sm">ostatní země</Text>
        </Group>
        <Group gap={6}>
          <Box w={12} h={12} style={{ borderRadius: 6, border: '2px dashed var(--mantine-color-background-7)' }} />
          <Text size="sm">cena neudělena</Text>
        </Group>
      </Group>
      <WinnerRow winners={winners} />
      <Text mt="md" size="sm" c="dimmed">
        Festival od roku 1959 kvůli politickému rozhodnutí střídal ročníky s Moskevským filmovým festivalem, proto se v 60. a 70. letech koná jen v sudých letech. Cena nebyla udělena v roce 1966 a znovu hned v roce 1990, prvním ročníku po sametové revoluci.
      </Text>
      <Text mt="xs" size="sm">
        I v éře, kdy festival organizoval komunistický stát, vyhrávaly Grand Prix i filmy ze zemí mimo sovětský blok – Sůl země (USA, 1954), francouzský, indický, japonský nebo australský film. Přehled tedy nepotvrzuje představu čistě propagandistické přehlídky, ale spíš směs zemí, kde měl vždy hlavní slovo Sovětský svaz a jeho spojenci.
      </Text>
    </ChartFrame>
  );
}

export function PostRevolutionGrandPrix({ winners }: { winners: GrandPrixWinner[] }) {
  return (
    <ChartFrame
      title="Grand Prix po revoluci (1990–2025)"
      subtitle="Vítězný film každého ročníku otevřené mezinárodní soutěže"
      source="Česká Wikipedie, heslo Křišťálový glóbus (tabulka Grand Prix)"
      fullWidth
    >
      <WinnerRow winners={winners} />
      <Text mt="md" size="sm" c="dimmed">
        Po roce 1989 se soutěž otevřela bez ideologického rámce: vítězí malé i velké kinematografie od Islandu po Gruzii, poprvé i český film hned v prvním porevolučním ročníku (Jízda, 1995). Rok 1990 zůstal bez ceny – první přechodný ročník po sametové revoluci.
      </Text>
    </ChartFrame>
  );
}
