'use client';

import { useState } from 'react';
import { Box, Stack, Text, Tooltip } from '@mantine/core';
import ChartLegend from './ChartLegend';
import { NUM_FONT } from './ChartFrame';
import type { FilmCountRow } from './films';

const SEGMENT_COLORS = {
  fictionFeatures: 'var(--mantine-color-brandTeal-6)',
  documentaryFeatures: 'var(--mantine-color-brandOrange-6)',
  shortFilms: 'var(--mantine-color-brandNavy-6)',
} as const;

function percentShare(value: number, total: number) {
  return Math.round((value / total) * 1000) / 10;
}

export default function ProgramBreakdownChart({
  rows,
  maxBreakdownFilms,
}: {
  rows: FilmCountRow[];
  maxBreakdownFilms: number;
}) {
  const [active, setActive] = useState<Set<string>>(
    new Set(['fictionFeatures', 'documentaryFeatures', 'shortFilms']),
  );

  return (
    <div>
      <ChartLegend
        items={[
          { key: 'fictionFeatures', label: 'hrané', color: SEGMENT_COLORS.fictionFeatures },
          { key: 'documentaryFeatures', label: 'dokumenty', color: SEGMENT_COLORS.documentaryFeatures },
          { key: 'shortFilms', label: 'krátké', color: SEGMENT_COLORS.shortFilms },
        ]}
        onChange={(keys) => setActive(new Set(keys))}
      />
      <Box style={{ overflowX: 'auto', paddingBottom: 8 }}>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${rows.length}, minmax(138px, 1fr))`,
            gap: 18,
            minWidth: 760,
            alignItems: 'end',
          }}
        >
          {rows.map((row) => {
            const fiction = row.fictionFeatures ?? 0;
            const documentaries = row.documentaryFeatures ?? 0;
            const shorts = row.shortFilms ?? 0;
            const total = row.totalFilms ?? fiction + documentaries + shorts;
            const barHeight = Math.max(130, Math.round((total / maxBreakdownFilms) * 230));
            const segments = [
              { key: 'shortFilms', label: 'krátké filmy', value: shorts, color: SEGMENT_COLORS.shortFilms },
              { key: 'documentaryFeatures', label: 'celovečerní dokumenty', value: documentaries, color: SEGMENT_COLORS.documentaryFeatures },
              { key: 'fictionFeatures', label: 'celovečerní hrané', value: fiction, color: SEGMENT_COLORS.fictionFeatures },
            ];
            const tooltip = [
              `${row.year}${row.edition ? ` · ${row.edition}. ročník` : ''}`,
              `${total} filmů celkem`,
              `${fiction} hraných (${percentShare(fiction, total).toString().replace('.', ',')} %)`,
              `${documentaries} dokumentů (${percentShare(documentaries, total).toString().replace('.', ',')} %)`,
              `${shorts} krátkých (${percentShare(shorts, total).toString().replace('.', ',')} %)`,
              row.note ?? null,
            ].filter(Boolean).join(' · ');

            return (
              <Tooltip key={row.year} label={tooltip} multiline maw={360} withArrow>
                <Stack gap="xs" align="center" title={tooltip} style={{ cursor: 'help' }}>
                  <Text fw={900} style={NUM_FONT}>{total}</Text>
                  <Box
                    aria-label={`${row.year}: ${total} filmů, z toho ${fiction} hraných, ${documentaries} dokumentárních a ${shorts} krátkých`}
                    style={{
                      height: barHeight,
                      width: 74,
                      display: 'flex',
                      flexDirection: 'column-reverse',
                      borderRadius: 8,
                      overflow: 'hidden',
                      border: '1px solid var(--mantine-color-background-6)',
                      background: 'var(--mantine-color-background-2)',
                    }}
                  >
                    {segments.map((segment) => {
                      const isActive = active.has(segment.key);
                      return (
                        <Box
                          key={segment.key}
                          style={{
                            height: `${(segment.value / total) * 100}%`,
                            background: segment.color,
                            opacity: isActive ? 1 : 0.15,
                            transition: 'opacity 0.15s',
                            display: 'grid',
                            placeItems: 'center',
                            color: 'var(--mantine-color-background-0)',
                            minHeight: segment.value > 0 ? 22 : 0,
                          }}
                        >
                          <Text size="xs" fw={900} style={NUM_FONT}>{segment.value}</Text>
                        </Box>
                      );
                    })}
                  </Box>
                  <Text fw={900}>{row.year}</Text>
                  <Text size="xs" ta="center" c="dimmed">
                    {fiction} hraných · {documentaries} dok. · {shorts} krát.
                  </Text>
                </Stack>
              </Tooltip>
            );
          })}
        </Box>
      </Box>
    </div>
  );
}
