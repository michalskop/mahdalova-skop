'use client';

import { useState } from 'react';
import { Box, Stack, Text, Tooltip } from '@mantine/core';
import ChartLegend from './ChartLegend';
import type { FilmCountRow } from './films';

const COLOR_FILMS = 'var(--mantine-color-brandTeal-6)';
const COLOR_SCREENINGS = 'var(--mantine-color-brandOrange-6)';
const COLOR_DENSITY = 'var(--mantine-color-brand-6)';

export default function FilmScreeningsChart({
  rows,
  maxFilms,
  peakYear,
  latestClosedYear,
}: {
  rows: FilmCountRow[];
  maxFilms: number;
  peakYear: number;
  latestClosedYear: number;
}) {
  const [active, setActive] = useState<Set<string>>(new Set(['films', 'screenings', 'density']));
  const showFilms = active.has('films');
  const showScreenings = active.has('screenings');
  const showDensity = active.has('density');

  const maxScreenings = Math.max(...rows.map((row) => row.screenings ?? 0));
  const sharedMax = Math.max(maxFilms, maxScreenings);
  const axisStep = sharedMax > 400 ? 100 : sharedMax > 200 ? 50 : 25;
  const axisMax = Math.ceil(sharedMax / axisStep) * axisStep;
  const axisTicks = Array.from({ length: axisMax / axisStep }, (_, i) => (i + 1) * axisStep);
  const screeningDensityRows = rows
    .map((row, index) => ({
      row,
      index,
      ratio: row.screenings && row.totalFilms ? Math.round((row.screenings / row.totalFilms) * 100) / 100 : null,
    }))
    .filter((item): item is { row: FilmCountRow; index: number; ratio: number } => item.ratio !== null);
  const maxScreeningsPerFilm = Math.ceil(Math.max(...screeningDensityRows.map((item) => item.ratio)) * 2) / 2;
  const densityLinePoints = screeningDensityRows
    .map((item) => {
      const x = ((item.index + 0.5) / rows.length) * 1000;
      const y = 18 + (1 - item.ratio / maxScreeningsPerFilm) * 170;
      return `${Math.round(x)},${Math.round(y)}`;
    })
    .join(' ');

  return (
    <div>
      <ChartLegend
        items={[
          { key: 'films', label: 'filmy', color: COLOR_FILMS },
          { key: 'screenings', label: 'projekce', color: COLOR_SCREENINGS },
          { key: 'density', label: 'projekce / film', color: COLOR_DENSITY },
        ]}
        onChange={(keys) => setActive(new Set(keys))}
      />
      <Box style={{ overflowX: 'auto', paddingBottom: 8 }}>
        <Box
          style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: `repeat(${rows.length}, minmax(32px, 1fr))`,
            gap: 6,
            minWidth: 1040,
            alignItems: 'end',
            minHeight: 250,
            borderBottom: '1px solid var(--mantine-color-background-6)',
            paddingTop: 8,
          }}
        >
          <Box
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: '2px 0 28px 0',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          >
            <svg viewBox="0 0 1000 198" preserveAspectRatio="none" width="100%" height="100%">
              <text x="10" y="16" fill="var(--mantine-color-dark-5)" fontSize="20" fontWeight="900">
                filmy / projekce
              </text>
              {axisTicks.map((tick) => {
                const y = 18 + (1 - tick / axisMax) * 170;
                return (
                  <g key={tick}>
                    <line x1="0" x2="1000" y1={y} y2={y} stroke="var(--mantine-color-background-6)" strokeDasharray="6 10" strokeWidth="1.5" />
                    <text x="10" y={Math.max(28, y - 5)} fill="var(--mantine-color-dark-5)" fontSize="20" fontWeight="900">
                      {tick}
                    </text>
                  </g>
                );
              })}
            </svg>
          </Box>
          <Box
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: '2px 0 28px 0',
              pointerEvents: 'none',
              zIndex: 4,
              opacity: showDensity ? 1 : 0.12,
              transition: 'opacity 0.15s',
            }}
          >
            <svg viewBox="0 0 1000 198" preserveAspectRatio="none" width="100%" height="100%">
              <text x="990" y="16" textAnchor="end" fill={COLOR_DENSITY} fontSize="20" fontWeight="900">
                projekce / film
              </text>
              {[1, 2, 3].filter((tick) => tick <= maxScreeningsPerFilm).map((tick) => {
                const y = 18 + (1 - tick / maxScreeningsPerFilm) * 170;
                return (
                  <g key={tick}>
                    <line x1="0" x2="1000" y1={y} y2={y} stroke="var(--mantine-color-background-6)" strokeDasharray="6 10" strokeWidth="1.5" />
                    <text x="990" y={Math.max(28, y - 5)} textAnchor="end" fill={COLOR_DENSITY} fontSize="20" fontWeight="900">
                      {tick}x
                    </text>
                  </g>
                );
              })}
              <polyline
                points={densityLinePoints}
                fill="none"
                stroke={COLOR_DENSITY}
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              {screeningDensityRows.map((item) => {
                const x = ((item.index + 0.5) / rows.length) * 1000;
                const y = 18 + (1 - item.ratio / maxScreeningsPerFilm) * 170;
                return (
                  <circle
                    key={item.row.year}
                    cx={x}
                    cy={y}
                    r="5"
                    fill="var(--mantine-color-background-1)"
                    stroke={COLOR_DENSITY}
                    strokeWidth="4"
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
            </svg>
          </Box>
          {rows.map((row) => {
            const filmsHeight = Math.max(10, Math.round(((row.totalFilms ?? 0) / axisMax) * 190));
            const screeningsHeight = row.screenings ? Math.max(10, Math.round((row.screenings / axisMax) * 190)) : 0;
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
                  <Box h={198} w="100%" style={{ display: 'flex', alignItems: 'end', justifyContent: 'center', gap: 3, position: 'relative', zIndex: 1 }}>
                    <Box
                      aria-label={`${row.year}: ${row.totalFilms} filmů`}
                      style={{
                        width: 12,
                        height: filmsHeight,
                        background: row.availability === 'full-breakdown' ? 'var(--mantine-color-brandTeal-7)' : COLOR_FILMS,
                        borderRadius: '5px 5px 0 0',
                        opacity: showFilms ? 1 : 0.15,
                        transition: 'opacity 0.15s',
                        boxShadow: row.year === peakYear ? '0 0 0 2px var(--mantine-color-brandRoyalBlue-8)' : undefined,
                      }}
                    />
                    <Box
                      aria-label={row.screenings ? `${row.year}: ${row.screenings} projekcí` : `${row.year}: projekce nejsou dostupné`}
                      style={{
                        width: 8,
                        height: screeningsHeight,
                        background: row.screenings ? COLOR_SCREENINGS : 'transparent',
                        borderRadius: '5px 5px 0 0',
                        opacity: row.screenings ? (showScreenings ? 0.92 : 0.15) : 0,
                        transition: 'opacity 0.15s',
                      }}
                    />
                  </Box>
                  <Text
                    size="xs"
                    fw={row.year === peakYear || row.year === latestClosedYear ? 900 : 700}
                    c={row.availability === 'full-breakdown' ? 'var(--mantine-color-brandTeal-7)' : 'dimmed'}
                  >
                    {String(row.year).slice(2)}
                  </Text>
                </Stack>
              </Tooltip>
            );
          })}
        </Box>
      </Box>
      <Text size="xs" c="dimmed" mt={4}>
        Levá osa (filmy, projekce) i pravá osa (projekce/film) začínají na nule a mají nezávislé měřítko – graf srovnává tvar vývoje, ne přímou velikost mezi osami.
      </Text>
    </div>
  );
}
