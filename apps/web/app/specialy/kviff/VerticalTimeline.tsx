import { Box, Paper, Text } from '@mantine/core';
import { NUM_FONT } from './ChartFrame';

// Svislá "cik-cak" časová osa: nejstarší nahoře, milníky se střídají vlevo
// a vpravo podél centrální osy, každý další o kus níž. Pod 700px se sloupce
// zhroutí do jednoho sloupce (kolečko + karta), aby to fungovalo i na mobilu.
export type TimelineEntry = {
  key: string;
  year: string;
  label: string;
  body: string;
  highlight?: boolean;
};

function PhaseCard({ entry }: { entry: TimelineEntry }) {
  return (
    <Paper p="md" radius={8} withBorder bg={entry.highlight ? 'brand.0' : 'background.0'}>
      <Text fw={900}>{entry.label}</Text>
      <Text size="sm" mt={4}>{entry.body}</Text>
    </Paper>
  );
}

export default function VerticalTimeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <Box style={{ position: 'relative' }}>
      <style>{`
        .kviff-vtimeline-row {
          display: grid;
          grid-template-columns: 1fr 56px 1fr;
          column-gap: 18px;
          align-items: start;
          margin-bottom: 28px;
        }
        .kviff-vtimeline-row:last-child { margin-bottom: 0; }
        .kviff-vtimeline-card { grid-column: 1; }
        .kviff-vtimeline-card.right { grid-column: 3; }
        .kviff-vtimeline-spacer { grid-column: 3; }
        .kviff-vtimeline-row.right .kviff-vtimeline-spacer { grid-column: 1; }
        @media (max-width: 720px) {
          .kviff-vtimeline-row { grid-template-columns: 44px 1fr; column-gap: 12px; }
          .kviff-vtimeline-card, .kviff-vtimeline-card.right { grid-column: 2; }
          .kviff-vtimeline-spacer { display: none; }
        }
      `}</style>
      <Box
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '50%',
          top: 8,
          bottom: 8,
          width: 4,
          background: 'var(--mantine-color-brandNavy-3)',
          transform: 'translateX(-50%)',
        }}
      />
      {entries.map((entry, i) => {
        const isLeft = i % 2 === 0;
        return (
          <div key={entry.key} className={`kviff-vtimeline-row${isLeft ? '' : ' right'}`}>
            <div className={`kviff-vtimeline-card${isLeft ? '' : ' right'}`}>
              <PhaseCard entry={entry} />
            </div>
            <Box style={{ display: 'flex', justifyContent: 'center' }}>
              <Box
                style={{
                  width: entry.highlight ? 64 : 46,
                  height: entry.highlight ? 64 : 46,
                  borderRadius: 999,
                  background: entry.highlight ? 'var(--mantine-color-brand-6)' : 'var(--mantine-color-brandNavy-6)',
                  border: '4px solid var(--mantine-color-background-1)',
                  boxShadow: entry.highlight
                    ? '0 0 0 3px var(--mantine-color-brand-3)'
                    : '0 0 0 1px var(--mantine-color-background-6)',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'var(--mantine-color-background-0)',
                  flex: '0 0 auto',
                }}
              >
                <Text fw={900} style={NUM_FONT} size={entry.highlight ? 'sm' : 'xs'} ta="center" lh={1.05}>
                  {entry.year}
                </Text>
              </Box>
            </Box>
            <div className="kviff-vtimeline-spacer" />
          </div>
        );
      })}
    </Box>
  );
}
