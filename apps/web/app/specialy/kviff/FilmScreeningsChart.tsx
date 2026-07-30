'use client';

import { useState } from 'react';
import { Box, Stack, Text, Tooltip } from '@mantine/core';
import ChartLegend from './ChartLegend';
import { NUM_FONT } from './ChartFrame';
import type { FilmCountRow } from './films';

const COLOR_FILMS = 'var(--mantine-color-brandTeal-7)';
const COLOR_SCREENINGS = 'var(--mantine-color-brandOrange-6)';

export default function FilmScreeningsChart({
  rows,
}: {
  rows: FilmCountRow[];
  maxFilms: number;
  peakYear: number;
  latestClosedYear: number;
}) {
  const [active, setActive] = useState<Set<string>>(new Set(['films', 'screenings']));
  const maxValue = Math.ceil(Math.max(...rows.flatMap((row) => [row.totalFilms ?? 0, row.screenings ?? 0])) / 100) * 100;
  const ticks = Array.from({ length: maxValue / 100 }, (_, index) => (index + 1) * 100);

  return (
    <Stack gap="sm">
      <ChartLegend
        items={[
          { key: 'films', label: 'filmy', color: COLOR_FILMS },
          { key: 'screenings', label: 'projekce', color: COLOR_SCREENINGS },
        ]}
        onChange={(keys) => setActive(new Set(keys))}
      />
      <Box style={{ overflowX: 'auto', paddingBottom: 8 }}>
        <Box
          style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: `repeat(${rows.length}, minmax(28px, 1fr))`,
            gap: 5,
            minWidth: 900,
            alignItems: 'end',
            minHeight: 250,
            borderBottom: '1px solid var(--mantine-color-background-6)',
            paddingTop: 20,
          }}
        >
          <Box aria-hidden="true" style={{ position: 'absolute', inset: '0 0 28px', pointerEvents: 'none' }}>
            <svg viewBox="0 0 1000 210" preserveAspectRatio="none" width="100%" height="100%">
              {ticks.map((tick) => {
                const y = 200 - (tick / maxValue) * 190;
                return (
                  <g key={tick}>
                    <line x1="0" x2="1000" y1={y} y2={y} stroke="var(--mantine-color-background-5)" strokeWidth="1" />
                    <text x="4" y={y - 4} fill="var(--mantine-color-dark-5)" fontSize="11" fontFamily="var(--font-roboto-condensed), Arial, sans-serif">
                      {tick}
                    </text>
                  </g>
                );
              })}
            </svg>
          </Box>
          {rows.map((row) => {
            const filmsHeight = Math.max(6, Math.round(((row.totalFilms ?? 0) / maxValue) * 190));
            const screeningsHeight = row.screenings ? Math.max(6, Math.round((row.screenings / maxValue) * 190)) : 0;
            const perFilm = row.screenings && row.totalFilms ? row.screenings / row.totalFilms : null;
            const tooltip = `${row.year}: ${row.totalFilms} filmů${row.screenings ? `, ${row.screenings} projekcí${perFilm ? `, ${perFilm.toLocaleString('cs-CZ', { maximumFractionDigits: 1 })} projekce na film` : ''}` : ''}`;

            return (
              <Tooltip key={row.year} label={tooltip} withArrow>
                <Stack gap={4} align="center" justify="end" title={tooltip}>
                  <Box h={200} w="100%" style={{ display: 'flex', alignItems: 'end', justifyContent: 'center', gap: 3, position: 'relative' }}>
                    <Box
                      aria-label={`${row.year}: ${row.totalFilms} filmů`}
                      style={{
                        width: 10,
                        height: filmsHeight,
                        background: COLOR_FILMS,
                        borderRadius: '3px 3px 0 0',
                        opacity: active.has('films') ? 1 : 0,
                        transition: 'height 0.2s ease, opacity 0.15s ease',
                      }}
                    />
                    <Box
                      aria-label={row.screenings ? `${row.year}: ${row.screenings} projekcí` : `${row.year}: počet projekcí není dostupný`}
                      style={{
                        width: 10,
                        height: screeningsHeight,
                        background: COLOR_SCREENINGS,
                        borderRadius: '3px 3px 0 0',
                        opacity: row.screenings && active.has('screenings') ? 1 : 0,
                        transition: 'height 0.2s ease, opacity 0.15s ease',
                      }}
                    />
                  </Box>
                  <Text c="dimmed" style={{ ...NUM_FONT, fontSize: 10, fontWeight: 700 }}>
                    {String(row.year).slice(2)}
                  </Text>
                </Stack>
              </Tooltip>
            );
          })}
        </Box>
      </Box>
      <Text size="sm" c="dimmed">
        Obě řady používají stejnou osu od nuly. Film je unikátní titul v katalogu, projekce je jedno jeho uvedení v programu. Hodnota „projekce na film“ zůstává v tooltipu jako doplňující údaj.
      </Text>
    </Stack>
  );
}
