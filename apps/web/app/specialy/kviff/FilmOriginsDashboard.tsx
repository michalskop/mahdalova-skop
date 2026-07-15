'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Badge, Box, Button, Group, Paper, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconPlayerPauseFilled, IconPlayerPlayFilled, IconSearch, IconX } from '@tabler/icons-react';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import { filmCountAvailableRows } from './films';
import { countryCoordinates, countryPresence2026, czCountry } from './countries';
import { countryHistory, type CountryYearRow } from './countries-history';
import { continentHistory } from './continents-history';
import { CHART_TRACK_BG, NUM_FONT } from './ChartFrame';
import worldTopology from '../../../public/dpbp/data/world-countries-110m.json';

const YEAR_MIN = 1992;
const YEAR_MAX = 2026;
const MIN_ZOOM = 1;
const MAX_ZOOM = 6;
const MISSED_YEARS = new Set([1993, 2020]);
const KVIFF_2026_FILMS_TOTAL = 179;
const KVIFF_2026_COPRODUCTIONS = 87;

const regionFix: Record<string, string> = {
  'SevernÃ­ Amerika': 'Severní Amerika',
  'LatinskÃ¡ Amerika': 'Latinská Amerika',
  'BlÃ­zkÃ½ vÃ½chod': 'Blízký východ',
  'OceÃ¡nie': 'Oceánie',
  'OstatnÃ­': 'Ostatní',
};

const regionByCoordinateRegion: Record<string, string> = {
  Europe: 'Evropa',
  'North America': 'Severní Amerika',
  'Latin America': 'Latinská Amerika',
  Asia: 'Asie',
  'Middle East': 'Blízký východ',
  Africa: 'Afrika',
  Oceania: 'Oceánie',
};

const regionFromPresenceRow: Record<string, string> = {
  Europe: 'Evropa',
  'North America': 'Severní Amerika',
  'Latin America': 'Latinská Amerika',
  Asia: 'Asie',
  'Middle East': 'Blízký východ',
  Africa: 'Afrika',
  Oceania: 'Oceánie',
};

const regionColors: Record<string, string> = {
  Evropa: '#4a51ab',
  'Severní Amerika': '#0e839e',
  'Latinská Amerika': '#272a59',
  Asie: '#f76800',
  'Blízký východ': '#ff934d',
  Afrika: '#639e0a',
  Oceánie: '#a03250',
  Austrálie: '#a03250',
  Ostatní: '#6b6b62',
};

type CountrySummary = {
  country: string;
  name: string;
  region: string;
  lat: number;
  lon: number;
  total: number;
  years: Record<number, number>;
  firstYear: number;
  lastYear: number;
  peakYear: number;
  peakCount: number;
};

type SelectedCountry = CountrySummary | null;

type MapTooltip = {
  country: CountrySummary;
  value: number;
  x: number;
  y: number;
} | null;

type MapLabel = {
  country: CountrySummary;
  x: number;
  y: number;
  anchor: 'start' | 'middle' | 'end';
  fontSize: number;
};

const labelPriorityCountries = new Set([
  'Brazil',
  'Colombia',
  'India',
  'China',
  'Japan',
  'South Korea',
  'Iran',
  'Turkey',
  'Israel',
  'Egypt',
  'Morocco',
  'South Africa',
  'Senegal',
  'Tunisia',
]);

function normalizeRegion(region: string) {
  const normalized = regionFix[region] ?? region;
  return normalized === 'Oceánie' ? 'Austrálie' : normalized;
}

function fmt(n: number) {
  return n.toLocaleString('cs-CZ');
}

function pct(n: number) {
  return n.toLocaleString('cs-CZ', { maximumFractionDigits: 1 });
}

function filmPlural(n: number) {
  return n === 1 ? 'filmu' : n >= 2 && n <= 4 ? 'filmů' : 'filmů';
}

const filmTotals = Object.fromEntries(
  filmCountAvailableRows
    .filter((row) => typeof row.totalFilms === 'number')
    .map((row) => [row.year, row.totalFilms!]),
);
filmTotals[YEAR_MAX] = KVIFF_2026_FILMS_TOTAL;

const continentByYear = new Map(continentHistory.map((row) => [row.year, row.continents]));

const continentRegions = ['Evropa', 'Severní Amerika', 'Latinská Amerika', 'Asie', 'Blízký východ', 'Afrika', 'Austrálie'];

const countryHistoryWithCurrentYear: CountryYearRow[] = [
  ...countryHistory.filter((row) => row.year !== YEAR_MAX),
  {
    year: YEAR_MAX,
    films: KVIFF_2026_FILMS_TOTAL,
    coproductions: KVIFF_2026_COPRODUCTIONS,
    coproductionShare: Math.round((KVIFF_2026_COPRODUCTIONS / KVIFF_2026_FILMS_TOTAL) * 1000) / 10,
    avgCountriesPerFilm: Math.round((countryPresence2026.reduce((sum, row) => sum + row.count, 0) / KVIFF_2026_FILMS_TOTAL) * 100) / 100,
    regions: countryPresence2026.reduce<Record<string, number>>((acc, row) => {
      const region = regionFromPresenceRow[row.region] ?? row.region;
      acc[region] = (acc[region] ?? 0) + row.count;
      return acc;
    }, {}),
    top: countryPresence2026.map((row) => [row.country, row.count] as [string, number]),
  },
].sort((a, b) => a.year - b.year);

function buildCountries(): CountrySummary[] {
  const map = new Map<string, CountrySummary>();

  countryHistoryWithCurrentYear.forEach((row) => {
    row.top.forEach(([country, count]) => {
      const coord = countryCoordinates[country];
      if (!coord) return;
      const region = regionByCoordinateRegion[coord.region] ?? 'Ostatní';
      const existing = map.get(country) ?? {
        country,
        name: czCountry(country),
        region,
        lat: coord.lat,
        lon: coord.lon,
        total: 0,
        years: {},
        firstYear: row.year,
        lastYear: row.year,
        peakYear: row.year,
        peakCount: 0,
      };
      existing.years[row.year] = (existing.years[row.year] ?? 0) + count;
      existing.total += count;
      existing.firstYear = Math.min(existing.firstYear, row.year);
      existing.lastYear = Math.max(existing.lastYear, row.year);
      if (existing.years[row.year] > existing.peakCount) {
        existing.peakCount = existing.years[row.year];
        existing.peakYear = row.year;
      }
      map.set(country, existing);
    });
  });

  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}

function CountryYearBars({ country, color, selectedYear }: { country: CountrySummary; color: string; selectedYear: number }) {
  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const years = Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, i) => YEAR_MIN + i);
  const values = years.map((year) => (MISSED_YEARS.has(year) ? null : country.years[year] ?? 0));
  const max = Math.max(1, ...values.map((value) => value ?? 0));
  const width = 360;
  const height = 112;
  const plotLeft = 24;
  const plotRight = 336;
  const plotTop = 14;
  const plotBottom = 88;
  const step = (plotRight - plotLeft) / years.length;
  const barWidth = Math.max(2.5, step * 0.62);
  const hoverIndex = hoverYear != null ? hoverYear - YEAR_MIN : null;
  const hoverValue = hoverIndex != null ? values[hoverIndex] : null;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Sloupcový graf počtu filmů, u kterých je uvedena země ${country.name}`}
      style={{ width: '100%', height: 126 }}
      onMouseLeave={() => setHoverYear(null)}
    >
      <line x1={plotLeft} x2={plotRight} y1={plotBottom} y2={plotBottom} stroke="var(--mantine-color-background-6)" strokeWidth={1} />
      {years.map((year, index) => {
        const value = values[index];
        const x = plotLeft + index * step + (step - barWidth) / 2;
        if (value === null) {
          return (
            <rect
              key={year}
              x={x}
              y={plotTop}
              width={barWidth}
              height={plotBottom - plotTop}
              fill="var(--mantine-color-background-5)"
              opacity={0.45}
            />
          );
        }
        const h = (value / max) * (plotBottom - plotTop);
        return (
          <g key={year}>
            <rect
              x={x}
              y={plotBottom - h}
              width={barWidth}
              height={h}
              rx={1.5}
              fill={year === selectedYear ? 'var(--mantine-color-brand-6)' : color}
              opacity={value ? 0.92 : 0.18}
            />
            {value === max && value > 0 && hoverYear == null && (
              <text x={x + barWidth / 2} y={Math.max(9, plotBottom - h - 4)} textAnchor="middle" fontSize={10} fontWeight={800} fill="var(--mantine-color-dark-9)">
                {value}
              </text>
            )}
            <rect
              x={plotLeft + index * step}
              y={plotTop}
              width={step}
              height={plotBottom - plotTop}
              fill="transparent"
              onMouseEnter={() => setHoverYear(year)}
              style={{ cursor: 'help' }}
            />
          </g>
        );
      })}
      {hoverIndex != null && hoverValue != null && (() => {
        const x = plotLeft + hoverIndex * step + step / 2;
        const h = (hoverValue / max) * (plotBottom - plotTop);
        const labelY = Math.max(9, plotBottom - h - 4);
        const boxWidth = 40;
        const boxX = Math.min(plotRight - boxWidth, Math.max(plotLeft, x - boxWidth / 2));
        return (
          <g pointerEvents="none">
            <rect x={boxX} y={labelY - 12} width={boxWidth} height={16} rx={3} fill="var(--mantine-color-brandNavy-9)" />
            <text x={boxX + boxWidth / 2} y={labelY} textAnchor="middle" fontSize={9} fontWeight={900} fill="#fdfbf7">
              {hoverYear}: {hoverValue}
            </text>
          </g>
        );
      })()}
      {[1992, 2000, 2010, 2020, 2026].map((tick) => {
        const index = tick - YEAR_MIN;
        return (
          <text key={tick} x={plotLeft + index * step + step / 2} y={106} textAnchor="middle" fontSize={10} fill="var(--mantine-color-dark-5)">
            {tick}
          </text>
        );
      })}
    </svg>
  );
}

function DashboardBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const width = max ? Math.min(100, (value / max) * 100) : 0;
  return (
    <Box style={{ display: 'grid', gridTemplateColumns: 'minmax(92px, 136px) 1fr 72px', gap: 10, alignItems: 'center' }}>
      <Text size="sm" fw={800}>{label}</Text>
      <Box h={10} bg={CHART_TRACK_BG} style={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box h="100%" w={`${width}%`} style={{ background: color }} />
      </Box>
      <Text size="sm" ta="right" fw={900} style={NUM_FONT}>{fmt(value)}</Text>
    </Box>
  );
}

function ShareBar({ value, color }: { value: number; color: string }) {
  const width = Math.max(0, Math.min(100, value));

  return (
    <Box>
      <Group justify="space-between" mb={4}>
        <Text size="xs" c="dimmed">Podíl na filmovém katalogu ročníku</Text>
        <Text size="xs" fw={900} style={NUM_FONT}>{pct(value)} %</Text>
      </Group>
      <Box h={12} bg="background.4" style={{ borderRadius: 2, overflow: 'hidden' }} aria-label={`Podíl ${pct(value)} ze 100 procent`}>
        <Box h="100%" w={`${width}%`} style={{ background: color }} />
      </Box>
    </Box>
  );
}

function labelsOverlap(a: { x1: number; y1: number; x2: number; y2: number }, b: { x1: number; y1: number; x2: number; y2: number }) {
  return a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;
}

export default function FilmOriginsDashboard() {
  const countries = useMemo(() => buildCountries(), []);
  const years = useMemo(() => Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, i) => YEAR_MIN + i), []);
  const [year, setYear] = useState(2026);
  const [mode, setMode] = useState<'annual' | 'cumulative'>('annual');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mapZoom, setMapZoom] = useState(1);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [mapTooltip, setMapTooltip] = useState<MapTooltip>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const mapDragRef = useRef<{ pointerId: number; startX: number; startY: number; originX: number; originY: number; moved: boolean } | null>(null);
  const pressedCountryRef = useRef<CountrySummary | null>(null);

  const yearRows = useMemo(() => new Map(countryHistoryWithCurrentYear.map((row) => [row.year, row])), []);
  const selected: SelectedCountry = selectedKey ? countries.find((country) => country.country === selectedKey) ?? null : null;
  const world = useMemo(() => feature(worldTopology as any, (worldTopology as any).objects.countries) as any, []);
  const projection = useMemo(() => geoNaturalEarth1().rotate([-12, 0]).scale(190 * mapZoom).translate([500 + mapOffset.x, 220 + mapOffset.y]), [mapOffset.x, mapOffset.y, mapZoom]);
  const mapPath = useMemo(() => geoPath(projection), [projection]);
  const countryPaths: Array<{ key: string; d: string }> = useMemo(
    () => world.features.map((item: any, index: number) => ({
      key: item.id ?? `${item.properties?.name}-${index}`,
      d: mapPath(item) ?? '',
    })),
    [mapPath, world],
  );
  const currentRow = yearRows.get(year);
  const yearTotal = currentRow?.top.reduce((sum, [, count]) => sum + count, 0) ?? 0;
  const filmsCumulativeToYear = years
    .filter((item) => item <= year)
    .reduce((sum, item) => sum + (yearRows.get(item)?.films ?? filmTotals[item] ?? 0), 0);
  const filmsForCard = mode === 'annual' ? (currentRow?.films ?? filmTotals[year] ?? 0) : filmsCumulativeToYear;
  const filmsCardLabel = mode === 'annual' ? `filmů v roce ${year}` : `filmů celkem k roku ${year}`;
  const activeCountries = countries.filter((country) => country.years[year]).length;
  const globalMaxAnnual = Math.max(...countries.flatMap((country) => years.map((item) => country.years[item] ?? 0)));
  const globalMaxCumulative = Math.max(...countries.map((country) => country.total));
  const cumulativeFor = (country: CountrySummary) => years.filter((item) => item <= year).reduce((sum, item) => sum + (country.years[item] ?? 0), 0);
  const valueFor = (country: CountrySummary) => (mode === 'annual' ? country.years[year] ?? 0 : cumulativeFor(country));
  const maxForMode = mode === 'annual' ? globalMaxAnnual : globalMaxCumulative;
  const modeTotal = mode === 'annual' ? yearTotal : countries.reduce((sum, country) => sum + cumulativeFor(country), 0);
  function continentValueFor(region: string) {
    if (mode === 'annual') return continentByYear.get(year)?.[region] ?? 0;
    return years
      .filter((item) => item <= year)
      .reduce((sum, item) => sum + (continentByYear.get(item)?.[region] ?? 0), 0);
  }
  const continentRows = continentRegions
    .map((region) => [region, continentValueFor(region)] as [string, number])
    .filter(([, value]) => value > 0)
    .sort(([, a], [, b]) => b - a);
  const continentTotal = continentRows.reduce((sum, [, value]) => sum + value, 0);
  const maxContinent = Math.max(1, ...continentRows.map(([, value]) => value));
  const grandTotal = countries.reduce((sum, country) => sum + country.total, 0);
  const topCountries = countries.slice(0, 10);
  const maxTop = topCountries[0]?.total ?? 1;
  const annualValue = selected ? selected.years[year] ?? 0 : 0;
  const selectedProgramShare = selected && filmTotals[year] ? (annualValue / filmTotals[year]) * 100 : null;
  const selectedColor = selected ? regionColors[selected.region] ?? regionColors.Ostatní : regionColors.Ostatní;
  const mapLabels: MapLabel[] = [];
  const labelRects: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  const labelCandidates = countries
    .map((country) => ({ country, value: valueFor(country), point: projection([country.lon, country.lat]) }))
    .filter((item): item is { country: CountrySummary; value: number; point: [number, number] } => Boolean(item.point) && item.value > 0)
    .sort((a, b) => {
      if (selected?.country === a.country.country) return -1;
      if (selected?.country === b.country.country) return 1;
      if (labelPriorityCountries.has(a.country.country) && !labelPriorityCountries.has(b.country.country)) return -1;
      if (labelPriorityCountries.has(b.country.country) && !labelPriorityCountries.has(a.country.country)) return 1;
      if (['Afrika', 'Asie', 'Blízký východ'].includes(a.country.region) && !['Afrika', 'Asie', 'Blízký východ'].includes(b.country.region)) return -1;
      if (['Afrika', 'Asie', 'Blízký východ'].includes(b.country.region) && !['Afrika', 'Asie', 'Blízký východ'].includes(a.country.region)) return 1;
      return b.value - a.value || b.country.total - a.country.total;
    })
    .slice(0, Math.min(countries.length, Math.round(30 + (mapZoom - 1) * 52)));
  const labelFontSize = mapZoom >= 1.75 ? 10.6 : mapZoom >= 1.35 ? 10.1 : 9.6;
  const labelPlacements: Array<{ dx: number; dy: number; anchor: 'start' | 'middle' | 'end' }> = [
    { dx: 10, dy: -10, anchor: 'start' },
    { dx: -10, dy: -10, anchor: 'end' },
    { dx: 10, dy: 15, anchor: 'start' },
    { dx: -10, dy: 15, anchor: 'end' },
    { dx: 0, dy: -17, anchor: 'middle' },
    { dx: 0, dy: 20, anchor: 'middle' },
  ];
  labelCandidates.forEach(({ country, point }, index) => {
    const width = Math.max(28, country.name.length * labelFontSize * 0.57 + 8);
    const height = labelFontSize + 6;
    for (const placement of labelPlacements) {
      const x = point[0] + placement.dx;
      const y = point[1] + placement.dy;
      const x1 = placement.anchor === 'end' ? x - width : placement.anchor === 'middle' ? x - width / 2 : x;
      const x2 = placement.anchor === 'end' ? x : placement.anchor === 'middle' ? x + width / 2 : x + width;
      const rect = { x1, y1: y - height + 2, x2, y2: y + 3 };
      const inView = rect.x1 > 8 && rect.x2 < 952 && rect.y1 > 12 && rect.y2 < 418;
      const collides = labelRects.some((existing) => labelsOverlap(rect, existing));
      if (inView && !collides) {
        labelRects.push(rect);
        mapLabels.push({ country, x, y, anchor: placement.anchor, fontSize: labelFontSize });
        break;
      }
    }
  });
  const mapLabelKeys = new Set(mapLabels.map((label) => label.country.country));

  function clampMapOffset(next: { x: number; y: number }, zoom = mapZoom) {
    if (zoom <= 1) return { x: 0, y: 0 };
    const maxX = (zoom - 1) * 330;
    const maxY = (zoom - 1) * 190;
    return {
      x: Math.max(-maxX, Math.min(maxX, next.x)),
      y: Math.max(-maxY, Math.min(maxY, next.y)),
    };
  }
  function svgPointFromClient(clientX: number, clientY: number) {
    const svg = svgRef.current;
    const rect = svg?.getBoundingClientRect();
    if (!rect || !rect.width || !rect.height) return { x: 480, y: 215 };
    return {
      x: ((clientX - rect.left) / rect.width) * 960,
      y: ((clientY - rect.top) / rect.height) * 430,
    };
  }
  function zoomToward(nextZoomRaw: number, anchor: { x: number; y: number }) {
    const nextZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.round(nextZoomRaw * 100) / 100));
    if (nextZoom === mapZoom) return;
    const ratio = nextZoom / mapZoom;
    const translateX = 500 + mapOffset.x;
    const translateY = 220 + mapOffset.y;
    const nextOffset = clampMapOffset(
      { x: anchor.x - ratio * (anchor.x - translateX) - 500, y: anchor.y - ratio * (anchor.y - translateY) - 220 },
      nextZoom,
    );
    setMapZoom(nextZoom);
    setMapOffset(nextOffset);
  }
  function nextPlayableYear(currentYear: number): number {
    const next = currentYear >= YEAR_MAX ? YEAR_MIN : currentYear + 1;
    return MISSED_YEARS.has(next) ? nextPlayableYear(next) : next;
  }

  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = window.setInterval(() => {
      setYear((currentYear) => nextPlayableYear(currentYear));
    }, 850);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    setMapOffset((current) => clampMapOffset(current, mapZoom));
  }, [mapZoom]);

  function handleYearSelect(nextYear: number) {
    if (MISSED_YEARS.has(nextYear)) return;
    setYear(nextYear);
  }

  function selectCountry(country: CountrySummary) {
    setSelectedKey(country.country);
    setSearch('');
    setSearchOpen(false);
  }

  function selectSearchMatch() {
    const query = search.trim().toLocaleLowerCase('cs-CZ');
    if (!query) return;
    const exact = countries.find((country) => country.name.toLocaleLowerCase('cs-CZ') === query);
    const partial = countries.find((country) => country.name.toLocaleLowerCase('cs-CZ').includes(query));
    const match = exact ?? partial;
    if (match) selectCountry(match);
  }

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="sm">
        <Paper p="md" radius={4} bg="#f8f6f0">
          <Text c="dimmed" size="sm">ročník</Text>
          <Text fw={900} style={{ ...NUM_FONT, fontSize: 34 }}>{year}</Text>
        </Paper>
        <Paper p="md" radius={4} bg="#f8f6f0">
          <Text c="dimmed" size="sm">zemí celkem</Text>
          <Text fw={900} style={{ ...NUM_FONT, fontSize: 34 }}>{fmt(activeCountries)}</Text>
        </Paper>
        <Paper p="md" radius={4} bg="#f8f6f0">
          <Text c="dimmed" size="sm">koprodukčních filmů</Text>
          <Text fw={900} style={{ ...NUM_FONT, fontSize: 34 }}>{fmt(currentRow?.coproductions ?? 0)}</Text>
        </Paper>
        <Paper p="md" radius={4} bg="#f8f6f0">
          <Text c="dimmed" size="sm">{filmsCardLabel}</Text>
          <Text fw={900} style={{ ...NUM_FONT, fontSize: 34 }}>{fmt(filmsForCard)}</Text>
        </Paper>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="sm">
        <Paper p="sm" radius={4} bg="#f8f6f0" style={{ gridColumn: '1 / -1' }}>
          <Group justify="end" align="center" mb={6}>
            <Group gap="xs">
              <Button size="compact-sm" color="gray" variant={mode === 'annual' ? 'light' : 'subtle'} onClick={() => setMode('annual')}>Ročně</Button>
              <Button size="compact-sm" color="gray" variant={mode === 'cumulative' ? 'light' : 'subtle'} onClick={() => setMode('cumulative')}>Kumulativně</Button>
            </Group>
          </Group>

          <Box
            style={{
              position: 'relative',
              minHeight: 430,
              borderRadius: 6,
              overflow: 'hidden',
              border: '1px solid var(--mantine-color-background-5)',
              background: 'linear-gradient(180deg, #d5dee6 0%, #edf0ec 100%)',
            }}
          >
            <Box style={{ position: 'absolute', zIndex: 3, left: 12, top: 12, width: 'min(240px, calc(100% - 24px))' }}>
              {searchOpen ? (
                <TextInput
                  ref={searchInputRef}
                  value={search}
                  onChange={(event) => setSearch(event.currentTarget.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') selectSearchMatch();
                    if (event.key === 'Escape') {
                      setSearch('');
                      setSearchOpen(false);
                    }
                  }}
                  onBlur={() => {
                    if (!search.trim()) setSearchOpen(false);
                  }}
                  placeholder="Země"
                  aria-label="Vyhledat zemi"
                  size="xs"
                  leftSection={<IconSearch size={14} stroke={1.8} aria-hidden="true" />}
                  w={188}
                  autoComplete="off"
                  styles={{
                    input: {
                      background: 'rgba(253, 251, 247, 0.96)',
                      borderColor: 'var(--mantine-color-background-6)',
                      fontFamily: 'var(--font-roboto-slab), Georgia, serif',
                      paddingLeft: 30,
                    },
                  }}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Otevřít vyhledávání země"
                  style={{
                    width: 34,
                    height: 30,
                    border: '1px solid var(--mantine-color-background-6)',
                    borderRadius: 4,
                    background: 'rgba(253, 251, 247, 0.94)',
                    color: 'var(--mantine-color-dark-8)',
                    cursor: 'pointer',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <IconSearch size={16} stroke={1.8} aria-hidden="true" />
                </button>
              )}
            </Box>

            <Group gap={4} style={{ position: 'absolute', zIndex: 4, right: 12, top: 12 }}>
              <button
                type="button"
                onClick={() => zoomToward(mapZoom - 0.4, { x: 480, y: 215 })}
                aria-label="Oddálit mapu"
                disabled={mapZoom <= MIN_ZOOM}
                style={{
                  width: 28,
                  height: 28,
                  border: '1px solid var(--mantine-color-background-6)',
                  borderRadius: 4,
                  background: 'rgba(253, 251, 247, 0.92)',
                  color: 'var(--mantine-color-dark-8)',
                  cursor: mapZoom <= MIN_ZOOM ? 'not-allowed' : 'pointer',
                  fontSize: 18,
                  fontWeight: 900,
                  lineHeight: '24px',
                  opacity: mapZoom <= MIN_ZOOM ? 0.45 : 1,
                }}
              >
                -
              </button>
              <button
                type="button"
                onClick={() => zoomToward(mapZoom + 0.4, { x: 480, y: 215 })}
                aria-label="Přiblížit mapu"
                disabled={mapZoom >= MAX_ZOOM}
                style={{
                  width: 28,
                  height: 28,
                  border: '1px solid var(--mantine-color-background-6)',
                  borderRadius: 4,
                  background: 'rgba(253, 251, 247, 0.92)',
                  color: 'var(--mantine-color-dark-8)',
                  cursor: mapZoom >= MAX_ZOOM ? 'not-allowed' : 'pointer',
                  fontSize: 18,
                  fontWeight: 900,
                  lineHeight: '24px',
                  opacity: mapZoom >= MAX_ZOOM ? 0.45 : 1,
                }}
              >
                +
              </button>
            </Group>

            <svg
              ref={svgRef}
              viewBox="0 0 960 430"
              role="img"
              aria-label={`Mapa produkčních zemí filmů KVIFF v roce ${year}`}
              style={{ display: 'block', width: '100%', height: 'auto', minHeight: 430, cursor: mapZoom > 1 ? 'grab' : 'default', touchAction: 'none' }}
              onPointerDownCapture={() => {
                pressedCountryRef.current = null;
              }}
              onPointerDown={(event) => {
                if (mapZoom <= 1) return;
                mapDragRef.current = {
                  pointerId: event.pointerId,
                  startX: event.clientX,
                  startY: event.clientY,
                  originX: mapOffset.x,
                  originY: mapOffset.y,
                  moved: false,
                };
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerMove={(event) => {
                const drag = mapDragRef.current;
                if (!drag || drag.pointerId !== event.pointerId) return;
                const dx = event.clientX - drag.startX;
                const dy = event.clientY - drag.startY;
                if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
                if (drag.moved) {
                  setMapTooltip(null);
                  setMapOffset(clampMapOffset({ x: drag.originX + dx, y: drag.originY + dy }));
                }
              }}
              onPointerUp={(event) => {
                const drag = mapDragRef.current;
                const wasClick = !drag || !drag.moved;
                if (drag?.pointerId === event.pointerId) {
                  mapDragRef.current = null;
                  event.currentTarget.releasePointerCapture(event.pointerId);
                }
                if (wasClick && pressedCountryRef.current) {
                  selectCountry(pressedCountryRef.current);
                }
                pressedCountryRef.current = null;
              }}
              onPointerCancel={() => {
                mapDragRef.current = null;
                pressedCountryRef.current = null;
              }}
              onPointerLeave={() => setMapTooltip(null)}
              onWheel={(event) => {
                event.preventDefault();
                const anchor = svgPointFromClient(event.clientX, event.clientY);
                zoomToward(mapZoom * (event.deltaY > 0 ? 0.87 : 1.15), anchor);
              }}
            >
              <g>
                {countryPaths.map((item) => (
                  <path
                    key={item.key}
                    d={item.d}
                    fill="var(--mantine-color-background-1)"
                    stroke="var(--mantine-color-background-6)"
                    strokeWidth={0.7}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </g>
              {[
                ['SEVERNÍ AMERIKA', -106, 48],
                ['EVROPA', 17, 51],
                ['ASIE', 86, 38],
                ['LATINSKÁ AMERIKA', -64, -22],
                ['AFRIKA', 22, 2],
                ['AUSTRÁLIE', 137, -28],
              ].map(([label, lon, lat]) => {
                const point = projection([Number(lon), Number(lat)]);
                if (!point) return null;
                return (
                  <text key={label} x={point[0]} y={point[1]} textAnchor="middle" fontSize={12} fontWeight={900} fill="var(--mantine-color-dark-4)" opacity={0.55}>
                    {label}
                  </text>
                );
              })}
              {[...countries].sort((a, b) => valueFor(a) - valueFor(b)).map((country) => {
                const point = projection([country.lon, country.lat]);
                if (!point) return null;
                const value = valueFor(country);
                if (!value) return null;
                const radius = 3 + Math.sqrt(value / maxForMode) * 28;
                return (
                  <circle
                    key={`hit-${country.country}`}
                    cx={point[0]}
                    cy={point[1]}
                    r={Math.max(10, radius + 5)}
                    fill="rgba(255, 255, 255, 0.001)"
                    stroke="transparent"
                    aria-hidden="true"
                    style={{ cursor: 'pointer', pointerEvents: 'all' }}
                    onPointerDown={() => {
                      pressedCountryRef.current = country;
                    }}
                    onPointerEnter={() => {
                      if (!mapLabelKeys.has(country.country)) {
                        setMapTooltip({ country, value, x: point[0], y: point[1] });
                      }
                    }}
                    onPointerLeave={() => setMapTooltip((current) => (current?.country.country === country.country ? null : current))}
                  />
                );
              })}
              {[...countries].sort((a, b) => valueFor(a) - valueFor(b)).map((country) => {
                const point = projection([country.lon, country.lat]);
                if (!point) return null;
                const value = valueFor(country);
                const radius = value ? 3 + Math.sqrt(value / maxForMode) * 28 : 0;
                const color = regionColors[country.region] ?? regionColors.Ostatní;
                return (
                  <circle
                    key={country.country}
                    cx={point[0]}
                    cy={point[1]}
                    r={radius}
                    fill={color}
                    fillOpacity={value ? (selected?.country === country.country ? 0.95 : 0.78) : 0}
                    stroke={selected?.country === country.country ? 'var(--mantine-color-dark-9)' : 'var(--mantine-color-background-0)'}
                    strokeWidth={selected?.country === country.country ? 2.8 : 1.5}
                    vectorEffect="non-scaling-stroke"
                    tabIndex={value ? 0 : -1}
                    role="button"
                    aria-label={`${country.name}: uvedeno u ${value} ${filmPlural(value)}`}
                    style={{ cursor: value ? 'pointer' : 'default', transition: 'r .24s ease, opacity .24s ease' }}
                    onPointerDown={() => {
                      if (value) pressedCountryRef.current = country;
                    }}
                    onPointerEnter={() => {
                      if (value && !mapLabelKeys.has(country.country)) {
                        setMapTooltip({ country, value, x: point[0], y: point[1] });
                      }
                    }}
                    onPointerLeave={() => setMapTooltip((current) => (current?.country.country === country.country ? null : current))}
                    onKeyDown={(event) => {
                      if (value && (event.key === 'Enter' || event.key === ' ')) {
                        event.preventDefault();
                        selectCountry(country);
                      }
                    }}
                  />
                );
              })}
              {mapTooltip && (() => {
                const share = modeTotal ? Math.round((mapTooltip.value / modeTotal) * 1000) / 10 : null;
                const boxX = Math.min(790, Math.max(12, mapTooltip.x + 12));
                const boxY = Math.min(372, Math.max(12, mapTooltip.y - 52));
                return (
                  <g pointerEvents="none">
                    <rect x={boxX} y={boxY} width={158} height={48} rx={4} fill="rgba(253, 251, 247, 0.96)" stroke="var(--mantine-color-background-6)" />
                    <text x={boxX + 10} y={boxY + 16} fontSize={11} fontWeight={900} fill="var(--mantine-color-dark-8)">
                      {mapTooltip.country.name}
                    </text>
                    <text x={boxX + 10} y={boxY + 32} fontSize={10} fill="var(--mantine-color-dark-5)">
                      {fmt(mapTooltip.value)} {filmPlural(mapTooltip.value)}
                    </text>
                    {share != null && (
                      <text x={boxX + 10} y={boxY + 44} fontSize={10} fill="var(--mantine-color-dark-5)">
                        {pct(share)} % z {mode === 'annual' ? 'ročníku' : 'celkové řady'}
                      </text>
                    )}
                  </g>
                );
              })()}
              {mapLabels.map(({ country, x, y, anchor, fontSize }) => {
                return (
                  <text
                    key={`label-${country.country}`}
                    x={x}
                    y={y}
                    textAnchor={anchor}
                    fontSize={fontSize}
                    fontWeight={900}
                    fill="var(--mantine-color-dark-8)"
                    stroke="rgba(253, 251, 247, 0.88)"
                    strokeWidth={3}
                    paintOrder="stroke"
                    pointerEvents="none"
                  >
                    {country.name}
                  </text>
                );
              })}
            </svg>

            {selected && (
              <Paper
                p="md"
                radius={4}
                bg="background.0"
                withBorder
                style={{
                  position: 'absolute',
                  right: 14,
                  top: 52,
                  width: 'min(420px, calc(100% - 28px))',
                  boxShadow: '0 8px 24px rgba(16, 20, 50, 0.16)',
                }}
              >
                <Group justify="space-between" align="start" gap="sm">
                  <Stack gap={4}>
                    <Badge
                      w="fit-content"
                      variant="filled"
                      style={{ background: selectedColor, color: 'white' }}
                    >
                      {normalizeRegion(selected.region)}
                    </Badge>
                    <Title order={3}>{selected.name}</Title>
                  </Stack>
                  <button
                    type="button"
                    onClick={() => setSelectedKey(null)}
                    aria-label="Zavřít detail země"
                    style={{
                      width: 34,
                      height: 34,
                      border: 0,
                      borderRadius: 4,
                      background: 'transparent',
                      color: 'var(--mantine-color-gray-6)',
                      cursor: 'pointer',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <IconX size={24} stroke={1.8} aria-hidden="true" />
                  </button>
                </Group>
                <Text size="sm" c="dimmed" mt="xs">
                  {annualValue
                    ? `${selected.name} je uvedeno u ${fmt(annualValue)} ${filmPlural(annualValue)} v roce ${year}.`
                    : `V roce ${year} se v katalogu neobjevuje.`}
                </Text>
                {selectedProgramShare != null && <Box mt="sm"><ShareBar value={selectedProgramShare} color={selectedColor} /></Box>}
                <CountryYearBars country={selected} color={selectedColor} selectedYear={year} />
                <SimpleGrid cols={3} spacing="xs">
                  <Box>
                    <Text size="xs" c="dimmed">Celkem filmů v historii festivalu</Text>
                    <Text fw={900} style={NUM_FONT}>{fmt(selected.total)}</Text>
                  </Box>
                  <Box>
                    <Text size="xs" c="dimmed">První / poslední účast na festivalu</Text>
                    <Text fw={900} style={NUM_FONT}>{selected.firstYear} / {selected.lastYear}</Text>
                  </Box>
                  <Box>
                    <Text size="xs" c="dimmed">Nejvyšší zastoupení v roce</Text>
                    <Text fw={900} style={NUM_FONT}>{selected.peakYear} ({selected.peakCount})</Text>
                  </Box>
                </SimpleGrid>
              </Paper>
            )}
          </Box>

          <Stack gap={8} mt="md">
            <Group gap={8} align="end" wrap="nowrap">
              <Box style={{ width: 126, minWidth: 126, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Text size="xs" c="dimmed" ta="center" mb={4} style={{ whiteSpace: 'nowrap' }}>kliknutím vybrat rok</Text>
                <button
                  type="button"
                  onClick={() => setIsPlaying((current) => !current)}
                  aria-label={isPlaying ? 'Pozastavit přehrávání roků' : 'Přehrát roky'}
                  style={{
                    width: 30,
                    height: 30,
                    border: 0,
                    borderRadius: 999,
                    background: 'var(--mantine-color-brand-6)',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'grid',
                    placeItems: 'center',
                    boxShadow: '0 2px 6px rgba(16, 20, 50, 0.25)',
                  }}
                >
                  {isPlaying ? (
                    <IconPlayerPauseFilled size={14} />
                  ) : (
                    <IconPlayerPlayFilled size={14} style={{ marginLeft: 1 }} />
                  )}
                </button>
              </Box>
              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${years.length}, minmax(2px, 1fr))`,
                  gap: 2,
                  flex: 1,
                  alignItems: 'end',
                  minHeight: 44,
                }}
              >
                {years.map((item) => {
                  const missed = MISSED_YEARS.has(item);
                  const active = item === year;
                  return (
                    <Box key={item} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 0 }}>
                      <Text size="xs" fw={900} style={{ ...NUM_FONT, height: 10, lineHeight: '10px', visibility: active ? 'visible' : 'hidden' }}>
                        {item}
                      </Text>
                      <button
                        type="button"
                        onClick={() => handleYearSelect(item)}
                        disabled={missed}
                        aria-label={missed ? `${item}: festival se nekonal` : `Vybrat rok ${item}`}
                        title={missed ? `${item}: festival se nekonal` : String(item)}
                        style={{
                          height: active ? 30 : 24,
                          minWidth: 2,
                          width: '100%',
                          border: 0,
                          borderRadius: 2,
                          background: missed
                            ? '#c8c8bc'
                            : active
                              ? 'var(--mantine-color-brand-6)'
                              : '#626780',
                          boxShadow: active ? '0 0 0 1px var(--mantine-color-brand-8)' : 'none',
                          cursor: missed ? 'not-allowed' : 'pointer',
                          opacity: missed ? 0.65 : 0.92,
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </Group>
            <Box style={{ ...NUM_FONT, fontSize: 14, color: '#333333', lineHeight: 1.45 }}>
              <div>
                {'• autoři: '}
                <a href="https://datatimes.cz" target="_blank" rel="noopener noreferrer" style={{ color: '#333333', textDecoration: 'underline' }}>
                  Kateřina Mahdalová &amp; Michal Škop
                </a>
              </div>
              <div>{'• data: oficiální katalogy filmů KVIFF a archivní materiály festivalu'}</div>
            </Box>
          </Stack>
        </Paper>

        <Paper p="lg" radius={4} bg="#f8f6f0">
          <Title order={3} size="1.05rem" mb="md">
            {mode === 'annual' ? `Kontinenty v roce ${year}` : `Kontinenty celkem do roku ${year}`}
          </Title>
          <Stack gap={7}>
            {continentRows.map(([region, value]) => (
              <DashboardBar key={region} label={normalizeRegion(region)} value={value} max={maxContinent} color={regionColors[normalizeRegion(region)] ?? regionColors.Ostatní} />
            ))}
          </Stack>
          <Box mt="md">
            <Text size="xs" c="dimmed" mb={4}>Stejná data jako podíl na katalogu (100 %)</Text>
            <Box style={{ display: 'flex', height: 22, borderRadius: 4, overflow: 'hidden' }}>
              {continentRows.map(([region, value]) => {
                const width = continentTotal ? (value / continentTotal) * 100 : 0;
                if (width < 0.5) return null;
                return (
                  <Box
                    key={region}
                    title={`${normalizeRegion(region)}: ${fmt(value)} (${pct((value / continentTotal) * 100)} %)`}
                    style={{
                      width: `${width}%`,
                      background: regionColors[normalizeRegion(region)] ?? regionColors.Ostatní,
                      display: 'grid',
                      placeItems: 'center',
                      minWidth: width > 4 ? undefined : 0,
                    }}
                  >
                    {width > 6 && (
                      <Text fw={900} c="white" style={{ ...NUM_FONT, fontSize: 10 }}>{fmt(value)}</Text>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Paper>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <Paper p="lg" radius={4} bg="#f8f6f0">
          <Title order={3} size="1.05rem" mb="md">Celkový souhrn 1992-2026</Title>
          <Text c="dimmed" mb="md">
            V datech je {fmt(grandTotal)} záznamů produkčních zemí. Koprodukční film se započítá každé uvedené zemi, proto je součet vyšší než počet filmů.
          </Text>
          <Stack gap={7}>
            {topCountries.map((country) => (
              <DashboardBar key={country.country} label={country.name} value={country.total} max={maxTop} color={regionColors[country.region] ?? regionColors.Ostatní} />
            ))}
          </Stack>
        </Paper>

        <Paper p="lg" radius={4} bg="#f8f6f0">
          <Title order={3} size="1.05rem" mb="md">Co je dobré číst z mapy</Title>
          <Stack gap="sm">
            <Text size="sm">Evropa (zejména střední) zůstává každoročně jádrem festivalu, ale je možné vysledovat i programové vlny mimo evropský střed: Jižní Koreu, Austrálii, Brazílii nebo USA.</Text>
            <Text size="sm">Od roku 2018 je nabídka filmů menší než v první dekádě po roce 1994, ale koprodukční síť je hustší: průměrný počet produkčních zemí na film je v úplných rozpadech 2018-2025 zhruba 1,8 oproti 1,2 v letech 1994-2003. V úplných rozpadech 2018-2025 má katalog průměrně 181 filmů ročně.</Text>
          </Stack>
        </Paper>
      </SimpleGrid>
    </Stack>
  );
}
