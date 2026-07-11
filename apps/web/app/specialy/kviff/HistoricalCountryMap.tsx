'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import ChartLegend from './ChartLegend';
import { countryCoordinates, czCountry } from './countries';
import type { CountryYearRow } from './countries-history';

// Animovaná mapa zemí původu filmů 1992-2026, inspirovaná Flourish "Animation
// Group" bodovou mapou (viz návod pro 3D map template): místo aby se body
// pohybovaly (naše země nemění polohu), animujeme jejich velikost a viditelnost
// mezi ročníky. Kostička/bublina pro každou zemi zůstává na svém místě po
// celou dobu (stejný DOM uzel), takže CSS transition mezi lety funguje plynule.

const NUM_FONT_FAMILY = 'var(--font-roboto-condensed), Arial, sans-serif';
const REGION_COLORS_CZ: Record<string, string> = {
  Evropa: 'var(--mantine-color-brandTeal-7)',
  'Severní Amerika': 'var(--mantine-color-brandNavy-6)',
  'Latinská Amerika': 'var(--mantine-color-brand-6)',
  Asie: 'var(--mantine-color-brandOrange-6)',
  'Blízký východ': 'var(--mantine-color-brandNavy-6)',
  Afrika: 'var(--mantine-color-brandOrange-7)',
  Oceánie: 'var(--mantine-color-brandForestGreen-6)',
  Ostatní: 'var(--mantine-color-background-7)',
};
const REGION_KEY_BY_CZ: Record<string, string> = {
  Evropa: 'Europe',
  'Severní Amerika': 'North America',
  'Latinská Amerika': 'Latin America',
  Asie: 'Asia',
  'Blízký východ': 'Middle East',
  Afrika: 'Africa',
  Oceánie: 'Oceania',
};

function projectCountry(lon: number, lat: number) {
  return {
    x: ((lon + 180) / 360) * 100,
    y: ((85 - lat) / 170) * 100,
  };
}

type HoverInfo = { country: string; count: number; share: number; left: number; top: number } | null;

export default function HistoricalCountryMap({ history }: { history: CountryYearRow[] }) {
  const years = useMemo(() => history.map((row) => row.year), [history]);
  const [yearIndex, setYearIndex] = useState(years.length - 1);
  const [playing, setPlaying] = useState(false);
  const [activeRegions, setActiveRegions] = useState<Set<string>>(new Set(Object.keys(REGION_COLORS_CZ)));
  const [hover, setHover] = useState<HoverInfo>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const allCountries = useMemo(() => {
    const set = new Set<string>();
    history.forEach((row) => row.top.forEach(([country]) => set.add(country)));
    return Array.from(set).filter((country) => countryCoordinates[country]);
  }, [history]);

  const globalMax = useMemo(
    () => Math.max(...history.flatMap((row) => row.top.map(([, count]) => count))),
    [history],
  );

  const currentRow = history[yearIndex];
  const currentCounts = useMemo(() => new Map(currentRow.top), [currentRow]);
  const currentTotal = useMemo(() => currentRow.top.reduce((sum, [, count]) => sum + count, 0), [currentRow]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setYearIndex((v) => {
        if (v >= years.length - 1) {
          setPlaying(false);
          return v;
        }
        return v + 1;
      });
    }, 900);
    return () => clearInterval(id);
  }, [playing, years.length]);

  function showTip(e: React.MouseEvent, country: string, count: number) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const box = containerRef.current!.getBoundingClientRect();
    setHover({
      country,
      count,
      share: Math.round((count / currentTotal) * 1000) / 10,
      left: rect.left - box.left + rect.width / 2,
      top: rect.top - box.top,
    });
  }

  return (
    <div>
      <ChartLegend
        items={Object.entries(REGION_COLORS_CZ)
          .filter(([region]) => region !== 'Ostatní')
          .map(([region, color]) => ({ key: region, label: region, color }))}
        onChange={(keys) => setActiveRegions(new Set(keys))}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 14,
          flexWrap: 'wrap',
          background: 'var(--mantine-color-brandNavy-9)',
          padding: '10px 14px',
          borderRadius: 4,
        }}
      >
        <span style={{ fontFamily: NUM_FONT_FAMILY, fontSize: 22, fontWeight: 700, color: '#fdfbf7' }}>
          <span style={{ display: 'inline-block', minWidth: '4ch', fontVariantNumeric: 'tabular-nums' }}>{currentRow.year}</span>
        </span>
        <span style={{ fontFamily: NUM_FONT_FAMILY, fontSize: 13, color: 'rgba(253,251,247,0.75)' }}>
          {currentRow.films} filmů{currentRow.coproductionShare != null ? ` · ${currentRow.coproductionShare.toString().replace('.', ',')} % koprodukcí` : ''}
        </span>
      </div>

      <div ref={containerRef} style={{ position: 'relative' }}>
        <div
          style={{
            position: 'relative',
            minHeight: 380,
            borderRadius: 8,
            overflow: 'hidden',
            border: '1px solid var(--mantine-color-background-6)',
            background: 'linear-gradient(180deg, var(--mantine-color-brandTeal-0) 0%, var(--mantine-color-background-2) 100%)',
          }}
        >
          {['North America', 'Europe', 'Asia', 'Latin America', 'Africa', 'Oceania'].map((label) => {
            const positions: Record<string, { left: string; top: string }> = {
              'North America': { left: '16%', top: '30%' },
              Europe: { left: '51%', top: '28%' },
              Asia: { left: '68%', top: '36%' },
              'Latin America': { left: '29%', top: '70%' },
              Africa: { left: '52%', top: '58%' },
              Oceania: { left: '78%', top: '76%' },
            };
            return (
              <span
                key={label}
                style={{
                  position: 'absolute',
                  ...positions[label],
                  fontSize: 11,
                  fontWeight: 900,
                  color: 'var(--mantine-color-background-8)',
                  textTransform: 'uppercase',
                  opacity: 0.55,
                  fontFamily: NUM_FONT_FAMILY,
                }}
              >
                {label}
              </span>
            );
          })}

          {allCountries.map((country) => {
            const coord = countryCoordinates[country];
            const point = projectCountry(coord.lon, coord.lat);
            const count = currentCounts.get(country) ?? 0;
            const visible = count > 0;
            const czRegion = Object.entries(REGION_KEY_BY_CZ).find(([, en]) => en === coord.region)?.[0] ?? 'Ostatní';
            const regionActive = activeRegions.has(czRegion);
            const size = visible ? 8 + Math.sqrt(count / globalMax) * 46 : 0;
            const opacity = visible && regionActive ? 0.88 : 0;
            return (
              <div
                key={country}
                onMouseEnter={(e) => visible && regionActive && showTip(e, country, count)}
                onMouseLeave={() => setHover(null)}
                style={{
                  position: 'absolute',
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                  width: size,
                  height: size,
                  marginLeft: -size / 2,
                  marginTop: -size / 2,
                  borderRadius: 999,
                  background: REGION_COLORS_CZ[czRegion],
                  border: '2px solid var(--mantine-color-background-1)',
                  boxShadow: '0 2px 12px rgba(17, 16, 14, 0.2)',
                  opacity,
                  transition: 'width 0.5s ease, height 0.5s ease, margin 0.5s ease, opacity 0.4s ease',
                  cursor: visible && regionActive ? 'help' : 'default',
                  pointerEvents: visible && regionActive ? 'auto' : 'none',
                }}
              />
            );
          })}
        </div>

        {hover && (
          <div
            style={{
              position: 'absolute',
              left: hover.left,
              top: hover.top,
              transform: 'translate(-50%, calc(-100% - 8px))',
              background: 'rgba(248,246,240,0.95)',
              color: '#1a1a1a',
              padding: '7px 10px',
              borderRadius: 7,
              fontSize: 12,
              fontFamily: 'var(--font-roboto-slab), Georgia, serif',
              width: 190,
              pointerEvents: 'none',
              zIndex: 10,
              border: '1px solid #e8e3d2',
              boxShadow: '0 4px 10px rgba(16,20,50,0.14)',
              lineHeight: 1.4,
            }}
          >
            <div style={{ fontWeight: 700 }}>{czCountry(hover.country)}</div>
            <div style={{ color: '#333333' }}>
              {hover.count}× v katalogu {currentRow.year} ({hover.share.toString().replace('.', ',')} %)
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
        <button
          type="button"
          onClick={() => { if (yearIndex >= years.length - 1) setYearIndex(0); setPlaying((p) => !p); }}
          aria-label={playing ? 'Pozastavit přehrávání historie' : 'Přehrát historii zemí po ročnících'}
          style={{ width: 32, height: 32, borderRadius: 4, border: '1px solid #c9c2af', background: '#fff', cursor: 'pointer', flex: '0 0 auto' }}
        >
          {playing ? '⏸' : '▶'}
        </button>
        <input
          type="range"
          min={0}
          max={years.length - 1}
          value={yearIndex}
          onChange={(e) => { setPlaying(false); setYearIndex(Number(e.target.value)); }}
          style={{ flex: 1, accentColor: 'var(--mantine-color-brand-6)' }}
        />
        <span style={{ fontFamily: NUM_FONT_FAMILY, fontSize: 12, color: '#333333', minWidth: 90, textAlign: 'right' }}>
          {currentRow.year} · {yearIndex + 1}/{years.length}
        </span>
      </div>
    </div>
  );
}
