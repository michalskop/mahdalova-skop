'use client';

// English variant of apps/web BrazilMunicipalMap.tsx (datajournalism.studio, elections-brazil-2026-10-26-why-lula-won).
// Map of all 5,570 municipalities of Brazil: 2026 presidential runoff (Lula × Flávio Bolsonaro).
// Modes: 2nd-round result · Lula's shift between rounds · change in turnout. Tooltip, search, zoom.
// Geometrie = IBGE 2022 (geobr / IPEA, zjednodušeno mapshaperem), data = oficiální výsledky TSE
// po obcích; obojí připravuje _data_pipeline u článku volby-brazilie-2026-10-26-proc-vyhral-lula.
// Stejná stavba jako ObceKandidatkyMap.tsx.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { Feature, Geometry } from 'geojson';
import ChartCard from './ChartCard';
import OsmPodklad, { OsmAttribution, type Zoom } from './OsmPodklad';

// Barvy výhradně ze závazné palety (ThemeProvider.tsx), podle stran (Kateřina 30. 10., dřív barvy vlajky):
// Lula = PT červená → brandCoralRed, Flávio = PL (zelená, žlutá, modrá; zelená vedle červené ne kvůli
// barvoslepým) → brandRoyalBlue; účast brandNavy
const INK = '#101432';      // brandNavy.9
const MUTED = '#4c4f8e';    // brandNavy.7
const GRID = '#eeeae2';     // background.4
const NODATA = '#e9e9dd';   // background.5
const FONT = 'var(--font-roboto-condensed), Arial, sans-serif';
const zbtn: React.CSSProperties = { width: 30, height: 30, border: `1px solid ${GRID}`, background: '#fff', color: INK, borderRadius: 4, cursor: 'pointer', fontSize: 17, lineHeight: 1, padding: 0 };

// [uf, název, voliči 2. kolo, Lula % 2. kolo, Lula % 1. kolo (ze dvou), účast 1. kolo %, účast 2. kolo %, hlasy Lula, hlasy Flávio]
type Rec = [string, string, number, number, number, number, number, number, number];
type Mode = 'r2' | 'shift' | 'turnout';

type Bin = { min: number; max: number; color: string; label: string };
const BINS: Record<Mode, Bin[]> = {
  r2: [
    { min: -Infinity, max: 30, color: '#272a59', label: 'Flávio 70% or more' },
    { min: 30, max: 40, color: '#4a51ab', label: 'Flávio 60–70%' },
    { min: 40, max: 45, color: '#899aeb', label: 'Flávio 55–60%' },
    { min: 45, max: 50, color: '#c9d0f5', label: 'Flávio 50–55%' },
    { min: 50, max: 55, color: '#ffcec6', label: 'Lula 50–55%' },
    { min: 55, max: 60, color: '#ff7e6e', label: 'Lula 55–60%' },
    { min: 60, max: 70, color: '#e8412c', label: 'Lula 60–70%' },
    { min: 70, max: Infinity, color: '#a32318', label: 'Lula 70% or more' },
  ],
  // posun je jiná veličina než výsledek, proto vlastní škála mimo barvy kandidátů:
  // fialová = Lula získal (brandAmethyst), oranžová = ztratil (brandOrange); Kateřina 30. 10.
  shift: [
    { min: -Infinity, max: -1, color: '#cc5f00', label: 'Lula lost more than 1 point' },
    { min: -1, max: 0, color: '#fda668', label: 'Lula lost up to 1 point' },
    { min: 0, max: 1, color: '#e0c8ee', label: 'Lula gained up to 1 point' },
    { min: 1, max: 2, color: '#c49ad8', label: 'gained 1–2 points' },
    { min: 2, max: 3, color: '#b262c0', label: 'gained 2–3 points' },
    { min: 3, max: 5, color: '#9f319e', label: 'gained 3–5 points' },
    { min: 5, max: Infinity, color: '#522a7a', label: 'gained 5 points or more' },
  ],
  turnout: [
    { min: -Infinity, max: -1, color: '#bcbcb0', label: 'fell by more than 1 point' },
    { min: -1, max: 0, color: '#e8e8dc', label: 'fell by up to 1 point' },
    { min: 0, max: 1, color: '#d2d8e9', label: 'rose by up to 1 point' },
    { min: 1, max: 2, color: '#a6b0d4', label: 'rose by 1–2 points' },
    { min: 2, max: 4, color: '#7889be', label: 'rose by 2–4 points' },
    { min: 4, max: Infinity, color: '#2f325c', label: 'rose by 4 points or more' },
  ],
};
const MODES: { key: Mode; label: string }[] = [
  { key: 'r2', label: '2nd-round result' },
  { key: 'shift', label: "Lula's shift between rounds" },
  { key: 'turnout', label: 'Change in turnout' },
];

const nf = (v: number) => Math.round(v).toLocaleString('en-GB');
const pf = (v: number, d = 1) => v.toFixed(d);
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

export interface BrazilMunicipalMapEnProps {
  geoUrl: string;
  dataUrl: string;
  title?: string;
  subtitle?: string;
  source?: string;
}

export default function BrazilMunicipalMapEn({ geoUrl, dataUrl, title, subtitle, source }: BrazilMunicipalMapEnProps) {
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
  const proj = useMemo(() => {
    if (!geo || !width) return null;
    return geoMercator().fitSize([width, height], { type: 'FeatureCollection', features: geo.obce });
  }, [geo, width, height]);
  const path = useMemo(() => (proj ? geoPath(proj) : null), [proj]);

  // přibližování: Ctrl/⌘ + kolečko, dva prsty, tlačítka; posun tažením, když je přiblíženo
  const [tf, setTf] = useState<Zoom>({ k: 1, x: 0, y: 0 });
  useEffect(() => { setTf({ k: 1, x: 0, y: 0 }); }, [width]);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomAt = useCallback((factor: number, cx: number, cy: number) => {
    setTf((t) => {
      const k = Math.max(1, Math.min(64, t.k * factor));
      if (k === 1) return { k: 1, x: 0, y: 0 };
      const f = k / t.k;
      return { k, x: cx - (cx - t.x) * f, y: cy - (cy - t.y) * f };
    });
  }, []);
  useEffect(() => {
    const el = svgRef.current; if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const b = el.getBoundingClientRect();
      zoomAt(Math.exp(-e.deltaY * 0.004), e.clientX - b.left, e.clientY - b.top);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [path, zoomAt]);
  const ptrs = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<number | null>(null);
  const loc = (e: React.PointerEvent) => { const b = svgRef.current!.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; };
  const onDown = (e: React.PointerEvent) => {
    ptrs.current.set(e.pointerId, loc(e));
    if (ptrs.current.size === 2) { const [a, b] = Array.from(ptrs.current.values()); pinch.current = Math.hypot(a.x - b.x, a.y - b.y); }
  };
  const onMove = (e: React.PointerEvent) => {
    const prev = ptrs.current.get(e.pointerId); if (!prev) return;
    const p = loc(e); ptrs.current.set(e.pointerId, p);
    if (ptrs.current.size === 2 && pinch.current) {
      const [a, b] = Array.from(ptrs.current.values()); const d = Math.hypot(a.x - b.x, a.y - b.y);
      zoomAt(d / pinch.current, (a.x + b.x) / 2, (a.y + b.y) / 2); pinch.current = d;
    } else if (tf.k > 1 && (e.buttons || e.pointerType !== 'mouse')) {
      setTf((t) => ({ ...t, x: t.x + p.x - prev.x, y: t.y + p.y - prev.y }));
    }
  };
  const onUp = (e: React.PointerEvent) => { ptrs.current.delete(e.pointerId); if (ptrs.current.size < 2) pinch.current = null; };

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

  // vyhledaná obec: přiblížit tak, aby zabrala zhruba třetinu mapy (a okolí s podkladem zůstalo vidět)
  const zoomTo = (id: string) => {
    const f = geo?.obce.find((g) => String(g.properties?.id ?? g.id) === id);
    if (!f || !path) return;
    const [[x0, y0], [x1, y1]] = path.bounds(f);
    const k = Math.max(1, Math.min(64, 0.33 * Math.min(width / Math.max(1, x1 - x0), height / Math.max(1, y1 - y0))));
    setTf({ k, x: width / 2 - k * (x0 + x1) / 2, y: height / 2 - k * (y0 + y1) / 2 });
  };

  const focusId = hover?.id ?? picked;
  const focus = focusId && data ? data[focusId] : null;
  const narrow = width < 560;

  return (
    <ChartCard title={title} subtitle={subtitle} source={source}>
      <div style={{ fontFamily: FONT, color: INK }}>
        <div role="group" aria-label="What the map shows" style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
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
          <input type="search" value={query} placeholder="Find a municipality (e.g. São Paulo)…" aria-label="Find a municipality"
            onChange={(e) => { setQuery(e.target.value); setPicked(null); }}
            style={{ width: '100%', fontFamily: FONT, fontSize: 14, padding: '6px 10px', border: '1px solid #d4d4c8', borderRadius: 4, background: '#fff' }} />
          {matches.length > 0 && !picked && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: `1px solid ${GRID}`, borderRadius: 4, zIndex: 3, boxShadow: '0 4px 14px rgba(16,20,50,.10)' }}>
              {matches.map(([id, r]) => (
                <button key={id} type="button" onClick={() => { setPicked(id); setQuery(r[1]); zoomTo(id); }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '5px 10px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 14, color: INK }}>
                  {r[1]} <span style={{ color: MUTED }}>· {r[0]}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div ref={wrapRef} style={{ position: 'relative', width: '100%' }} onMouseLeave={() => setHover(null)}>
          {!path && <div style={{ height: Math.max(height, 300), display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED }}>Loading municipal map…</div>}
          {path && proj && geo && data && (
            <>
            <svg ref={svgRef} width={width} height={height} role="img"
              style={{ display: 'block', touchAction: tf.k > 1 ? 'none' : 'pan-y', cursor: tf.k > 1 ? 'grab' : 'default', background: '#fbfaf6' }}
              onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
              aria-label="Map of Brazilian municipalities: Lula won across the whole North-east and much of the North, Flávio Bolsonaro in the South, the Centre-West and most municipalities of the South-east.">
              <g transform={`translate(${tf.x},${tf.y}) scale(${tf.k})`}>
              <OsmPodklad scale={proj.scale()} translate={proj.translate()} width={width} height={height} tf={tf} />
              {/* barva obce násobená s podkladem: silnice, řeky, města a názvy prosvítají */}
              <g style={{ mixBlendMode: 'multiply' }}>
                {paths.map(({ id, d }) => {
                  const r = data[id];
                  const i = r ? binOf(value(r, mode), mode) : -1;
                  return (
                    <path key={id} d={d} fill={i >= 0 ? BINS[mode][i].color : NODATA} fillOpacity={0.85} stroke="none"
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
              <path d={path(geo.ufs) ?? ''} fill="none" stroke="#fff" strokeWidth={1.2} vectorEffect="non-scaling-stroke" pointerEvents="none" />
              <path d={path(geo.outline) ?? ''} fill="none" stroke="#bcbcb0" strokeWidth={0.8} vectorEffect="non-scaling-stroke" pointerEvents="none" />
              {focusId && (() => {
                const f = geo.obce.find((g) => String(g.properties?.id ?? g.id) === focusId);
                return f ? <path d={path(f) ?? ''} fill="none" stroke={INK} strokeWidth={1.8} vectorEffect="non-scaling-stroke" pointerEvents="none" /> : null;
              })()}
              </g>
            </svg>
            <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <button type="button" aria-label="Zoom in" style={zbtn} onClick={() => zoomAt(1.6, width / 2, height / 2)}>+</button>
              <button type="button" aria-label="Zoom out" style={zbtn} onClick={() => zoomAt(1 / 1.6, width / 2, height / 2)}>−</button>
              {tf.k > 1 && <button type="button" aria-label="Show all of Brazil" style={{ ...zbtn, fontSize: 14 }} onClick={() => setTf({ k: 1, x: 0, y: 0 })}>⟲</button>}
            </div>
            </>
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
              <div style={{ color: MUTED }}>{nf(focus[2])} voters</div>
              <div style={{ marginTop: 4 }}>
                <span style={{ color: '#e8412c' }}>●</span> Lula <strong>{pf(focus[3])}%</strong> ({nf(focus[7])})<br />
                <span style={{ color: '#4a51ab' }}>●</span> Flávio Bolsonaro <strong>{pf(100 - focus[3])}%</strong> ({nf(focus[8])})
              </div>
              <div style={{ color: MUTED, marginTop: 2 }}>
                Lula in 1st round {pf(focus[4])}% of votes for the two ({sg(focus[3] - focus[4])} points)<br />
                turnout {pf(focus[6])}% ({sg(focus[6] - focus[5])} points vs 1st round)
              </div>
            </div>
          )}
        </div>

        <div style={{ fontSize: 12.5, color: MUTED, marginTop: 8 }}>
          Shares are of valid votes for the two candidates. Lula&rsquo;s shift compares his share of the votes cast for the Lula–Flávio pair in the 1st round with the 2nd-round result. Voters abroad are not included in the map. Zoom with Ctrl + scroll wheel, two fingers or the buttons.
          <span style={{ display: 'block', marginTop: 2 }}><OsmAttribution color={MUTED} /></span>
        </div>
      </div>
    </ChartCard>
  );
}
