'use client';

import { useMemo, useState } from 'react';
import { Box, Group, Stack, Text, Tooltip } from '@mantine/core';
import ChartLegend from './ChartLegend';
import { NUM_FONT } from './ChartFrame';
import { continentHistory } from './continents-history';
import { continentRegions, regionColors } from './FilmOriginsDashboard';

const YEAR_MIN = 1992;
const YEAR_MAX = 2026;
const MISSED_YEARS = new Set([1993, 2020]);
const PLOT_HEIGHT = 260;

function fmt(n: number) {
  return n.toLocaleString('cs-CZ');
}

function pct(n: number) {
  return n.toLocaleString('cs-CZ', { maximumFractionDigits: 1 });
}

export default function ContinentStackedChart() {
  const [active, setActive] = useState<Set<string>>(new Set(continentRegions));
  const [displayMode, setDisplayMode] = useState<'absolute' | 'percent'>('absolute');

  const continentByYear = useMemo(() => new Map(continentHistory.map((row) => [row.year, row.continents])), []);
  const years = useMemo(() => Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, i) => YEAR_MIN + i), []);

  const activeTotals = useMemo(
    () =>
      years.map((year) => {
        const continents = continentByYear.get(year);
        if (!continents) return { year, total: 0 };
        const total = continentRegions
          .filter((region) => active.has(region))
          .reduce((sum, region) => sum + (continents[region] ?? 0), 0);
        return { year, total };
      }),
    [years, continentByYear, active],
  );
  const domainMax = Math.max(1, ...activeTotals.map((row) => row.total));

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="center" wrap="wrap" gap="sm">
        <ChartLegend
          items={continentRegions.map((region) => ({ key: region, label: region, color: regionColors[region] }))}
          onChange={(keys) => setActive(new Set(keys))}
        />
        <Box
          role="group"
          aria-label="Přepínač zobrazení: absolutně, nebo podílově"
          style={{
            display: 'inline-flex',
            border: '1.5px solid var(--mantine-color-brandNavy-9)',
            borderRadius: 999,
            overflow: 'hidden',
            flex: '0 0 auto',
          }}
        >
          {([
            { key: 'absolute', label: 'Absolutně' },
            { key: 'percent', label: 'Podíl' },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setDisplayMode(key)}
              aria-pressed={displayMode === key}
              style={{
                border: 0,
                padding: '7px 16px',
                background: displayMode === key ? 'var(--mantine-color-brandNavy-9)' : 'transparent',
                color: displayMode === key ? '#fdfbf7' : 'var(--mantine-color-dark-6)',
                fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif',
                fontWeight: 800,
                fontSize: 13,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'background 0.15s ease, color 0.15s ease',
              }}
            >
              {label}
            </button>
          ))}
        </Box>
      </Group>

      <Box style={{ overflowX: 'auto', paddingBottom: 8 }}>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${years.length}, minmax(22px, 1fr))`,
            gap: 3,
            minWidth: 980,
            alignItems: 'end',
          }}
        >
          {years.map((year) => {
            const missed = MISSED_YEARS.has(year);
            const continents = continentByYear.get(year);
            if (missed || !continents) {
              return (
                <Stack key={year} gap={4} align="center">
                  <Box
                    aria-hidden="true"
                    style={{
                      height: PLOT_HEIGHT,
                      width: '100%',
                      display: 'flex',
                      alignItems: 'end',
                    }}
                  >
                    <Box style={{ height: 6, width: '100%', background: 'var(--mantine-color-background-5)', opacity: 0.5, borderRadius: '2px 2px 0 0' }} />
                  </Box>
                  <Text c="dimmed" style={{ ...NUM_FONT, fontSize: 9 }}>{String(year).slice(2)}</Text>
                </Stack>
              );
            }

            const activeSegments = continentRegions
              .filter((region) => active.has(region))
              .map((region) => ({ region, value: continents[region] ?? 0 }))
              .filter((segment) => segment.value > 0);
            const yearTotal = activeSegments.reduce((sum, segment) => sum + segment.value, 0);
            const barHeightPx = displayMode === 'percent' ? (yearTotal > 0 ? PLOT_HEIGHT : 0) : (yearTotal / domainMax) * PLOT_HEIGHT;

            const tooltip = [
              String(year),
              ...activeSegments
                .slice()
                .sort((a, b) => b.value - a.value)
                .map((segment) => `${segment.region}: ${fmt(segment.value)}${displayMode === 'percent' && yearTotal ? ` (${pct((segment.value / yearTotal) * 100)} %)` : ''}`),
            ].join(' · ');

            return (
              <Tooltip key={year} label={tooltip} multiline maw={320} withArrow>
                <Stack gap={4} align="center" title={tooltip} style={{ cursor: 'help' }}>
                  <Box
                    style={{
                      height: PLOT_HEIGHT,
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <Box
                      style={{
                        height: Math.max(0, Math.round(barHeightPx)),
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column-reverse',
                        borderRadius: '2px 2px 0 0',
                        overflow: 'hidden',
                        transition: 'height 0.25s ease',
                      }}
                    >
                      {activeSegments.map((segment) => (
                        <Box
                          key={segment.region}
                          style={{
                            height: Math.max(1, Math.round((segment.value / yearTotal) * barHeightPx)),
                            width: '100%',
                            background: regionColors[segment.region] ?? regionColors.Ostatní,
                            transition: 'height 0.25s ease',
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                  <Text c="dimmed" style={{ ...NUM_FONT, fontSize: 9 }}>{String(year).slice(2)}</Text>
                </Stack>
              </Tooltip>
            );
          })}
        </Box>
      </Box>

      <Text size="sm" c="dimmed">
        Sloupce jsou skládané podle kontinentů 1992–2026 (bez 1993 a 2020, festival se nekonal); starší ročníky zatím nemáme na úrovni jednotlivých filmů, proto řada nesahá až do roku 1966. Kliknutím na kontinent v legendě ho z grafu vypnete – zbylé kontinenty se přeskládají zpátky na osu x, ne že by zůstaly viset na původním místě. V režimu „Podíl“ každý sloupec vyplňuje celou výšku a ukazuje procentní podíl mezi zapnutými kontinenty daného roku.
      </Text>
    </Stack>
  );
}
