'use client';

// Obecný kartogram obcí Česka podle jedné hodnoty (např. znečištění ovzduší). Barva obce = pásmo
// stupnice z dat (tlumená béžová pod limitem, karmínové odstíny brand škály nad ním), volitelná
// vrstva bodů (měřicí stanice) se stejnou stupnicí, hledání obce a tooltip podle DESIGN.md §10
// (krémová karta, pruh s názvem obce v barvě jejího pásma, ink-blue řádky).
// Geometrie = sdílená mapa obcí (volební okrsky ČSÚ 2022 sloučené do obcí, S-JTSK) jako u
// ObceKandidatkyMap / ObceVoliciMap. Data = JSON ve složce článku (`dataFile`), načtený při stavbě
// webu (lib/articleData.ts → scope.obceHodnotaData). Body mají souřadnice v S-JTSK (EPSG:5514).
// Formát dat: viz typ RawData níže; vzor: analyza-2026-11-17-jaci-jsme-ovzdusi/_data_pipeline/cisla.py.

import { useEffect, useMemo, useRef, useState } from 'react';
import { geoIdentity, geoPath } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { Feature, Geometry } from 'geojson';
import ChartCard from './ChartCard';

const INK = '#101432';      // brandNavy.9
const MUTED = '#4c4f8e';    // brandNavy.7
const NODATA = '#f8f6f0';   // background.2
const EDGE = '#e8e3d2';
const FONT = 'var(--font-roboto-condensed), Arial, sans-serif';

type Pasmo = { do: number | null; barva: string; popisek: string };
type Doplnek = { nazev: string; format: 'pocet' | 'procenta' | 'desetinne1' | 'desetinne2' };
// obec: [název, index kraje, hodnota, ...doplňky v pořadí `doplnky`]
type ObecRec = [string, number, number | null, ...(number | null)[]];
type Bod = { n: string; x: number; y: number; v: number };
export type ObceHodnotaData = {
  ukazatel: { nazev: string; jednotka: string; desetinna?: number; popis?: string };
  limit?: number;
  skala: Pasmo[];
  kraje: string[];
  doplnky?: Doplnek[];
  obce: Record<string, ObecRec>;
  body_nazev?: string;
  body?: Bod[];
};

const num = (v: number, d = 0) => v.toLocaleString('cs-CZ', { minimumFractionDigits: d, maximumFractionDigits: d });

function fmt(v: number | null | undefined, f: Doplnek['format']) {
  if (v === null || v === undefined || Number.isNaN(v)) return '–';
  if (f === 'pocet') return num(Math.round(v));
  if (f === 'procenta') return `${num(v)} %`;
  if (f === 'desetinne2') return num(v, 2);
  return num(v, 1);
}

// světlé barvy pásma → ink písmo v pruhu tooltipu, jinak bílé
function lightColor(hex: string) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 165;
}

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

export interface ObceHodnotaMapProps {
  geoUrl: string;
  data?: ObceHodnotaData;
  dataFile?: string;
  title?: string;
  subtitle?: string;
  source?: string;
  note?: string;
}

type Hover = { kind: 'obec' | 'bod'; id: string; x: number; y: number };

export default function ObceHodnotaMap({ geoUrl, data, dataFile, title, subtitle, source, note }: ObceHodnotaMapProps) {
  const [wrapRef, width] = useWidth<HTMLDivElement>();
  const [topo, setTopo] = useState<Topology | null>(null);
  const [hover, setHover] = useState<Hover | null>(null);
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<string | null>(null);
  const [showBody, setShowBody] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch(geoUrl).then((r) => r.json()).then((g) => { if (alive) setTopo(g as Topology); });
    return () => { alive = false; };
  }, [geoUrl]);

  // ťuknutí mimo mapu zavře popisek (na dotykových zařízeních nepřijde mouseleave)
  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setHover(null);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [wrapRef]);

  const geo = useMemo(() => {
    if (!topo) return null;
    const obce = feature(topo, topo.objects.obce as GeometryCollection) as unknown as { features: Feature<Geometry, { id?: string }>[] };
    const kraje = mesh(topo, topo.objects.kraje as GeometryCollection, (a: unknown, b: unknown) => a !== b);
    const outline = mesh(topo, topo.objects.kraje as GeometryCollection, (a: unknown, b: unknown) => a === b);
    return { obce: obce.features, kraje, outline };
  }, [topo]);

  const height = Math.round(width * 0.58);
  const proj = useMemo(() => {
    if (!geo || !width) return null;
    // S-JTSK: rovinné souřadnice, stačí otočit osu y a vměstnat
    return geoIdentity().reflectY(true).fitSize([width, height], { type: 'FeatureCollection', features: geo.obce });
  }, [geo, width, height]);
  const path = useMemo(() => (proj ? geoPath(proj) : null), [proj]);

  const paths = useMemo(() => {
    if (!geo || !path) return [];
    return geo.obce.map((f) => ({ id: String(f.id ?? f.properties?.id), d: path(f) ?? '' }));
  }, [geo, path]);

  const skala = data?.skala ?? [];
  const pasmo = (v: number | null | undefined) => {
    if (v === null || v === undefined) return null;
    return skala.find((p) => p.do === null || v <= p.do) ?? skala[skala.length - 1];
  };

  const counts = useMemo(() => {
    const c = new Array(skala.length).fill(0);
    if (!data) return c;
    for (const o of Object.values(data.obce)) {
      const v = o[2];
      if (v === null) continue;
      const i = skala.findIndex((p) => p.do === null || v <= p.do);
      c[i >= 0 ? i : skala.length - 1] += 1;
    }
    return c;
  }, [data, skala]);

  const matches = useMemo(() => {
    if (!data || query.trim().length < 2) return [];
    const q = query.trim().toLocaleLowerCase('cs');
    return Object.entries(data.obce)
      .filter(([, o]) => o[0].toLocaleLowerCase('cs').startsWith(q))
      .sort((a, b) => Number(b[1][3] ?? 0) - Number(a[1][3] ?? 0))
      .slice(0, 8);
  }, [data, query]);

  if (!data) {
    return <div className="text-red-500">ObceHodnotaMap: data nenalezena ({dataFile})</div>;
  }

  const u = data.ukazatel;
  const dec = u.desetinna ?? 1;
  const limit = data.limit;
  const body = data.body ?? [];
  const R = Math.max(2.2, (5 * width) / 876);
  const SW = width < 560 ? 0.9 : 1.3;

  const pos = (e: React.MouseEvent) => {
    const box = wrapRef.current?.getBoundingClientRect();
    return box ? { x: e.clientX - box.left, y: e.clientY - box.top } : null;
  };
  const onObec = (id: string) => (e: React.MouseEvent) => {
    const p = pos(e);
    if (p && data.obce[id]) setHover({ kind: 'obec', id, ...p });
  };
  const onBod = (i: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    const p = pos(e);
    if (p) setHover({ kind: 'bod', id: String(i), ...p });
  };

  // co ukazuje tooltip / detail: najetá obec či bod, jinak vyhledaná obec (v levém dolním rohu)
  const focusObecId = hover?.kind === 'obec' ? hover.id : !hover ? picked : null;
  const focusObec = focusObecId ? data.obce[focusObecId] : null;
  const focusBod = hover?.kind === 'bod' ? body[Number(hover.id)] : null;
  const focusVal = focusObec ? focusObec[2] : focusBod ? focusBod.v : null;
  const focusColor = pasmo(focusVal)?.barva ?? NODATA;
  const nadLimitem = limit !== undefined && focusVal !== null && focusVal > limit;

  // pásma rozdělená limitem na „pod“ a „nad“
  const pod = skala.map((p, i) => ({ p, i })).filter(({ p }) => limit === undefined || (p.do !== null && p.do <= limit));
  const nad = skala.map((p, i) => ({ p, i })).filter(({ p }) => limit !== undefined && (p.do === null || p.do > limit));
  const swatch = (p: Pasmo, i: number) => (
    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
      <span style={{ width: 13, height: 13, borderRadius: 2, background: p.barva, flex: '0 0 auto', border: lightColor(p.barva) ? '1px solid #d4d4c8' : 'none', boxSizing: 'border-box' }} />
      {p.popisek} <span style={{ color: MUTED }}>({num(counts[i])})</span>
    </span>
  );

  return (
    <ChartCard title={title} subtitle={subtitle} source={source}>
      <div style={{ fontFamily: FONT, color: INK }}>
        {/* Legenda: pásma pod limitem a nad ním, počet obcí v závorce */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13.5, marginBottom: 8 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '3px 12px' }}>
            <span style={{ fontWeight: 700 }}>{u.nazev} v {u.jednotka}{limit !== undefined ? ', pod limitem:' : ':'}</span>
            {pod.map(({ p, i }) => swatch(p, i))}
          </div>
          {nad.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '3px 12px' }}>
              <span style={{ fontWeight: 700 }}>nad limitem {num(limit as number)}&nbsp;{u.jednotka}:</span>
              {nad.map(({ p, i }) => swatch(p, i))}
            </div>
          )}
          <div style={{ color: MUTED, fontSize: 12.5 }}>V závorce počet obcí.</div>
          {body.length > 0 && (
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', width: 'fit-content' }}>
              <input type="checkbox" checked={showBody} onChange={(e) => setShowBody(e.target.checked)} />
              <svg width="14" height="14" aria-hidden><circle cx="7" cy="7" r="5" fill="#ffb3c0" stroke={INK} strokeWidth="1.4" /></svg>
              {data.body_nazev ?? 'Body'} ({num(body.length)})
            </label>
          )}
        </div>

        {/* Hledání obce */}
        <div style={{ position: 'relative', marginBottom: 8, maxWidth: 320 }}>
          <input
            type="search"
            value={query}
            placeholder="Najít obec…"
            aria-label="Najít obec"
            onChange={(e) => { setQuery(e.target.value); setPicked(null); }}
            style={{ width: '100%', fontFamily: FONT, fontSize: 14, padding: '6px 10px', border: '1px solid #d4d4c8', borderRadius: 4, background: '#fff' }}
          />
          {matches.length > 0 && !picked && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: `1px solid ${EDGE}`, borderRadius: 4, zIndex: 3, boxShadow: '0 4px 14px rgba(16,20,50,.10)' }}>
              {matches.map(([id, o]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => { setPicked(id); setQuery(o[0]); setHover(null); }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '5px 10px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 14, color: INK }}
                >
                  {o[0]} <span style={{ color: MUTED }}>· {data.kraje[o[1]]}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div ref={wrapRef} style={{ position: 'relative', width: '100%' }} onMouseLeave={() => setHover(null)}>
          {!path && <div style={{ height: Math.max(height, 240), display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED }}>Načítám mapu obcí…</div>}
          {path && geo && proj && (
            <svg width={width} height={height} role="img" aria-label={`Mapa obcí: ${u.nazev}, ${u.popis ?? ''}`} style={{ display: 'block' }}>
              <g>
                {paths.map(({ id, d }) => {
                  const o = data.obce[id];
                  const p = pasmo(o?.[2]);
                  return (
                    <path
                      key={id}
                      d={d}
                      fill={p?.barva ?? NODATA}
                      stroke={p && !lightColor(p.barva) ? 'none' : '#fff'}
                      strokeWidth={0.25}
                      onMouseMove={onObec(id)}
                      onClick={onObec(id)}
                    />
                  );
                })}
              </g>
              <path d={path(geo.kraje) ?? ''} fill="none" stroke="#fff" strokeWidth={1.4} pointerEvents="none" />
              <path d={path(geo.outline) ?? ''} fill="none" stroke="#bcbcb0" strokeWidth={0.8} pointerEvents="none" />
              {focusObecId && (() => {
                const f = geo.obce.find((g) => String(g.id ?? g.properties?.id) === focusObecId);
                return f ? <path d={path(f) ?? ''} fill="none" stroke={INK} strokeWidth={1.6} pointerEvents="none" /> : null;
              })()}
              {showBody && (
                <g>
                  {body.map((b, i) => {
                    const c = proj([b.x, b.y]);
                    if (!c) return null;
                    const on = hover?.kind === 'bod' && hover.id === String(i);
                    return (
                      <circle key={i} cx={c[0]} cy={c[1]} r={on ? R + 1.5 : R} fill={pasmo(b.v)?.barva ?? NODATA}
                        stroke={INK} strokeWidth={on ? 2 : SW} onMouseMove={onBod(i)} onClick={onBod(i)} style={{ cursor: 'pointer' }} />
                    );
                  })}
                </g>
              )}
            </svg>
          )}

          {(focusObec || focusBod) && (
            <div
              style={{
                position: 'absolute', pointerEvents: 'none',
                top: hover ? Math.min(Math.max(0, hover.y - 70), Math.max(0, height - 130)) : undefined,
                bottom: hover ? undefined : 0,
                left: hover ? (hover.x > width - 250 ? undefined : hover.x + 14) : 0,
                right: hover && hover.x > width - 250 ? width - hover.x + 14 : undefined,
                background: 'rgba(248,246,240,0.97)', border: `1px solid ${EDGE}`, borderRadius: 7,
                boxShadow: '0 4px 10px rgba(16,20,50,0.14)', overflow: 'hidden',
                fontSize: 13, lineHeight: 1.4, maxWidth: 260, minWidth: 180, zIndex: 2, color: INK,
              }}
            >
              <div style={{ background: focusColor, color: lightColor(focusColor) ? INK : '#fff', fontWeight: 700, fontSize: 13.5, padding: '5px 12px' }}>
                {focusObec ? focusObec[0] : focusBod?.n}
              </div>
              <div style={{ padding: '6px 12px 8px' }}>
                <div style={{ color: MUTED }}>{focusObec ? data.kraje[focusObec[1]] : data.body_nazev}</div>
                <div>
                  {u.nazev}: <strong>{focusVal === null ? '–' : `${num(focusVal, dec)} ${u.jednotka}`}</strong>
                  {limit !== undefined && focusVal !== null && <span style={{ color: MUTED }}> ({nadLimitem ? 'nad limitem' : 'pod limitem'})</span>}
                </div>
                {focusObec && (data.doplnky ?? []).map((d, i) => (
                  <div key={i}>{d.nazev}: <strong>{fmt(focusObec[3 + i] as number | null, d.format)}</strong></div>
                ))}
              </div>
            </div>
          )}
        </div>

        {note && <div style={{ fontSize: 12.5, color: MUTED, marginTop: 8 }}>{note}</div>}
      </div>
    </ChartCard>
  );
}
