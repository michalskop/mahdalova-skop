'use client';

// Mapa všech 5 570 obcí Brazílie: 2. kolo prezidentských voleb 2026 (Lula × Flávio Bolsonaro).
// Přepínání: výsledek 2. kola · posun Luly mezi koly · změna účasti. Tooltip s čísly obce, hledání.
// Geometrie = IBGE 2022 (geobr / IPEA, zjednodušeno mapshaperem), data = oficiální výsledky TSE
// po obcích; obojí připravuje _data_pipeline u článku volby-brazilie-2026-10-26-proc-vyhral-lula.
// Stejná stavba jako ObceKandidatkyMap.tsx.

import { useEffect, useMemo, useRef, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { Feature, Geometry } from 'geojson';
import ChartCard from './ChartCard';

// Barvy výhradně ze závazné palety (ThemeProvider.tsx): Lula brandOrange, Flávio brandEmeraldMint
// (oranžová × zelená je čitelná i pro barvoslepé), účast brandNavy
const INK = '#101432';      // brandNavy.9
const MUTED = '#4c4f8e';    // brandNavy.7
const GRID = '#eeeae2';     // background.4
const NODATA = '#e9e9dd';   // background.5
const FONT = 'var(--font-roboto-condensed), Arial, sans-serif';

// [uf, název, voliči 2. kolo, Lula % 2. kolo, Lula % 1. kolo (ze dvou), účast 1. kolo %, účast 2. kolo %, hlasy Lula, hlasy Flávio]
type Rec = [string, string, number, number, number, number, number, number, number];
type Mode = 'r2' | 'shift' | 'turnout';

type Bin = { min: number; max: number; color: string; label: string };
const BINS: Record<Mode, Bin[]> = {
  r2: [
    { min: -Infinity, max: 30, color: '#084533', label: 'Flávio 70 % a víc' },
    { min: 30, max: 40, color: '#0e926a', label: 'Flávio 60–70 %' },
    { min: 40, max: 45, color: '#4fd6b4', label: 'Flávio 55–60 %' },
    { min: 45, max: 50, color: '#c2f0e4', label: 'Flávio 50–55 %' },
    { min: 50, max: 55, color: '#ffe0c7', label: 'Lula 50–55 %' },
    { min: 55, max: 60, color: '#fda668', label: 'Lula 55–60 %' },
    { min: 60, max: 70, color: '#f76800', label: 'Lula 60–70 %' },
    { min: 70, max: Infinity, color: '#994800', label: 'Lula 70 % a víc' },
  ],
  shift: [
    { min: -Infinity, max: 0, color: '#4fd6b4', label: 'Lula ztratil' },
    { min: 0, max: 1, color: '#fff3e8', label: '+0 až 1 bod' },
    { min: 1, max: 2, color: '#ffe0c7', label: '+1 až 2 body' },
    { min: 2, max: 3, color: '#fda668', label: '+2 až 3 body' },
    { min: 3, max: 5, color: '#ff7f2a', label: '+3 až 5 bodů' },
    { min: 5, max: Infinity, color: '#cc5f00', label: '+5 bodů a víc' },
  ],
  turnout: [
    { min: -Infinity, max: -1, color: '#bcbcb0', label: 'klesla o víc než 1 bod' },
    { min: -1, max: 0, color: '#e8e8dc', label: 'klesla do 1 bodu' },
    { min: 0, max: 1, color: '#d2d8e9', label: 'vzrostla do 1 bodu' },
    { min: 1, max: 2, color: '#a6b0d4', label: 'vzrostla o 1–2 body' },
    { min: 2, max: 4, color: '#7889be', label: 'vzrostla o 2–4 body' },
    { min: 4, max: Infinity, color: '#2f325c', label: 'vzrostla o 4 body a víc' },
  ],
};
const MODES: { key: Mode; label: string }[] = [
  { key: 'r2', label: 'Výsledek 2. kola' },
  { key: 'shift', label: 'Posun Luly mezi koly' },
  { key: 'turnout', label: 'Změna účasti' },
];

const nf = (v: number) => Math.round(v).toLocaleString('cs-CZ');
const pf = (v: number, d = 1) => v.toFixed(d).replace('.', ',');
const sg = (v: number, d = 1) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${pf(Math.abs(v), d)}`;

const value = (r: Rec, m: Mode) => (m === 'r2' ? r[3] : m === 'shift' ? r[3] - r[4] : r[6] - r[5]);
const binOf = (v: number, m: Mode) => BINS[m].findIndex((b) => v >= b.min && v < b.max);

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

export interface BrazilMunicipalMapProps {
  geoUrl: string;
  dataUrl: string;
  title?: string;
  subtitle?: string;
  source?: string;
}

export default function BrazilMunicipalMap({ geoUrl, dataUrl, title, subtitle, source }: BrazilMunicipalMapProps) {
  const [wrapRef, width] = useWidth<HTMLDivElement>();
  const [topo, setTopo] = useState<Topology | null>(null);
  const [data, setData] = useState<Record<string, Rec> | null>(null);
  const [mode, setMode] = useState<Mode>('r2');
  const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(null);
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([fetch(geoUrl).then((r) => r.json()), fetch(dataUrl).then((r) => r.json())]).then(([g, d]) => {
      if (!alive) return;
      setTopo(g as Topology);
      setData(d as Record<string, Rec>);
    });
    return () => { alive = false; };
  }, [geoUrl, dataUrl]);

  const geo = useMemo(() => {
    if (!topo) return null;
    const obce = feature(topo, topo.objects.mun as GeometryCollection) as unknown as { features: Feature<Geometry, { id?: string }>[] };
    const ufs = mesh(topo, topo.objects.uf as GeometryCollection, (a: unknown, b: unknown) => a !== b);
    const outline = mesh(topo, topo.objects.uf as GeometryCollection, (a: unknown, b: unknown) => a === b);
    return { obce: obce.features, ufs, outline };
  }, [topo]);

  const height = Math.round(width * (width < 560 ? 1.0 : 0.92));
  const path = useMemo(() => {
    if (!geo || !width) return null;
    const proj = geoMercator().fitSize([width, height], { type: 'FeatureCollection', features: geo.obce });
    return geoPath(proj);
  }, [geo, width, height]);

  const paths = useMemo(() => {
    if (!geo || !path) return [];
    return geo.obce.map((f) => ({ id: String(f.properties?.id ?? f.id), d: path(f) ?? '' }));
  }, [geo, path]);

  // počty obcí a voličů v jednotlivých třídách pro aktuální režim
  const counts = useMemo(() => {
    const c = BINS[mode].map(() => ({ n: 0, v: 0 }));
    if (!data) return c;
    for (const r of Object.values(data)) {
      const i = binOf(value(r, mode), mode);
      if (i >= 0) { c[i].n += 1; c[i].v += r[2]; }
    }
    return c;
  }, [data, mode]);

  const matches = useMemo(() => {
    if (!data || query.trim().length < 2) return [];
    const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const q = norm(query.trim());
    return Object.entries(data)
      .filter(([, r]) => norm(r[1]).startsWith(q))
      .sort((a, b) => b[1][2] - a[1][2])
      .slice(0, 8);
  }, [data, query]);

  const focusId = hover?.id ?? picked;
  const focus = focusId && data ? data[focusId] : null;
  const narrow = width < 560;

  return (
    <ChartCard title={title} subtitle={subtitle} source={source}>
      <div style={{ fontFamily: FONT, color: INK }}>
        <div role="group" aria-label="Co mapa ukazuje" style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
          {MODES.map((m) => (
            <button key={m.key} type="button" onClick={() => setMode(m.key)} aria-pressed={m.key === mode}
              style={{
                fontFamily: FONT, fontSize: 14, padding: '4px 10px', borderRadius: 4, cursor: 'pointer',
                border: `1px solid ${m.key === mode ? INK : '#d4d4c8'}`,
                background: m.key === mode ? INK : '#fff', color: m.key === mode ? '#fff' : INK,
                fontWeight: m.key === mode ? 700 : 400,
              }}>
              {m.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: narrow ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '3px 14px', fontSize: 13.5, marginBottom: 8 }}>
          {BINS[mode].map((b, i) => (
            <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 13, height: 13, borderRadius: 2, background: b.color, flex: '0 0 auto', border: '1px solid rgba(16,20,50,.12)' }} />
              <span>{b.label} <span style={{ color: MUTED }}>({nf(counts[i].n)})</span></span>
            </div>
          ))}
        </div>

        <div style={{ position: 'relative', marginBottom: 8, maxWidth: 320 }}>
          <input type="search" value={query} placeholder="Najít obec (např. São Paulo)…" aria-label="Najít obec"
            onChange={(e) => { setQuery(e.target.value); setPicked(null); }}
            style={{ width: '100%', fontFamily: FONT, fontSize: 14, padding: '6px 10px', border: '1px solid #d4d4c8', borderRadius: 4, background: '#fff' }} />
          {matches.length > 0 && !picked && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: `1px solid ${GRID}`, borderRadius: 4, zIndex: 3, boxShadow: '0 4px 14px rgba(16,20,50,.10)' }}>
              {matches.map(([id, r]) => (
                <button key={id} type="button" onClick={() => { setPicked(id); setQuery(r[1]); }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '5px 10px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 14, color: INK }}>
                  {r[1]} <span style={{ color: MUTED }}>· {r[0]}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div ref={wrapRef} style={{ position: 'relative', width: '100%' }} onMouseLeave={() => setHover(null)}>
          {!path && <div style={{ height: Math.max(height, 300), display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED }}>Načítám mapu obcí…</div>}
          {path && geo && data && (
            <svg width={width} height={height} role="img" style={{ display: 'block' }}
              aria-label="Mapa obcí Brazílie: Lula vyhrál na celém severovýchodě a na velké části severu, Flávio Bolsonaro na jihu, ve středozápadě a ve většině obcí jihovýchodu.">
              <g>
                {paths.map(({ id, d }) => {
                  const r = data[id];
                  const i = r ? binOf(value(r, mode), mode) : -1;
                  return (
                    <path key={id} d={d} fill={i >= 0 ? BINS[mode][i].color : NODATA} stroke="none"
                      onMouseMove={(e) => {
                        const box = wrapRef.current?.getBoundingClientRect();
                        if (box) setHover({ id, x: e.clientX - box.left, y: e.clientY - box.top });
                      }}
                      onClick={(e) => {
                        const box = wrapRef.current?.getBoundingClientRect();
                        if (box) setHover({ id, x: e.clientX - box.left, y: e.clientY - box.top });
                      }} />
                  );
                })}
              </g>
              <path d={path(geo.ufs) ?? ''} fill="none" stroke="#fff" strokeWidth={1.2} pointerEvents="none" />
              <path d={path(geo.outline) ?? ''} fill="none" stroke="#bcbcb0" strokeWidth={0.8} pointerEvents="none" />
              {focusId && (() => {
                const f = geo.obce.find((g) => String(g.properties?.id ?? g.id) === focusId);
                return f ? <path d={path(f) ?? ''} fill="none" stroke={INK} strokeWidth={1.8} pointerEvents="none" /> : null;
              })()}
            </svg>
          )}

          {focus && (
            <div style={{
              position: 'absolute', pointerEvents: 'none',
              top: hover ? Math.min(Math.max(0, hover.y - 80), height - 150) : undefined,
              bottom: hover ? undefined : 0,
              left: hover ? (hover.x > width - 260 ? undefined : hover.x + 14) : 0,
              right: hover && hover.x > width - 260 ? width - hover.x + 14 : undefined,
              background: '#fff', border: `1px solid ${GRID}`, borderRadius: 6, padding: '8px 10px',
              fontSize: 13, lineHeight: 1.45, boxShadow: '0 4px 14px rgba(16,20,50,.10)', maxWidth: 260, zIndex: 2,
            }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{focus[1]} <span style={{ fontWeight: 400, color: MUTED }}>· {focus[0]}</span></div>
              <div style={{ color: MUTED }}>{nf(focus[2])} voličů</div>
              <div style={{ marginTop: 4 }}>
                <span style={{ color: '#f76800' }}>●</span> Lula <strong>{pf(focus[3])} %</strong> ({nf(focus[7])})<br />
                <span style={{ color: '#0b6b4e' }}>●</span> Flávio Bolsonaro <strong>{pf(100 - focus[3])} %</strong> ({nf(focus[8])})
              </div>
              <div style={{ color: MUTED, marginTop: 2 }}>
                Lula v 1. kole {pf(focus[4])} % z hlasů pro oba ({sg(focus[3] - focus[4])} bodu)<br />
                účast {pf(focus[6])} % ({sg(focus[6] - focus[5])} bodu proti 1. kolu)
              </div>
            </div>
          )}
        </div>

        <div style={{ fontSize: 12.5, color: MUTED, marginTop: 8 }}>
          Podíly jsou z platných hlasů pro oba kandidáty. Posun Luly porovnává jeho podíl z hlasů pro dvojici Lula–Flávio v 1. kole s výsledkem 2. kola. Voliči v zahraničí v mapě nejsou.
        </div>
      </div>
    </ChartCard>
  );
}
