'use client';

// Senát 2026 – průběžný odhad po obvodech (model volby2026.datatimes.cz).
// mapaUrl  = senat-mapa.json (polygony obvodů a tečkový podklad)
// odhadUrl = odhad.json – snímek /api/latest z volby2026.datatimes.cz (skript aktualizuj_odhad.py v článku)
// Obvody se barví jako semafor podle jistoty odhadu; klik / ťuknutí ukáže pod mapou kartu obvodu.

import { useEffect, useMemo, useRef, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import ChartCard from './ChartCard';
import { pollJson } from '@/lib/pollJson';

const INK = '#101432';
const MUTED = '#4c4f8e';
const DOT = '#d6d3c7';
const BLUE = '#0070F4';
const FONT = 'var(--font-roboto-condensed), Arial, sans-serif';

// semafor jistoty
const LEVELS = {
  vysoka: { color: '#2e9e5b', label: 'vysoká jistota' },
  stredni: { color: '#f2a31b', label: 'střední jistota' },
  nizka: { color: '#de1743', label: 'nízká jistota' },
  nic: { color: '#c4c0b2', label: 'čekáme na data' },
} as const;
type Level = keyof typeof LEVELS;

type ObvodProps = { o: number; n: string; sen?: string; obh?: string };
type MapData = {
  obvody: FeatureCollection<Geometry, ObvodProps & { vol?: number }>;
  outline: Geometry;
  dots: [number, number, number][];
  vol: number[]; // obvody, kde se letos volí
};
type Kand = { no: number; name: string; party: string; counted_share: number; est_share: number; sd: number; p_win_round1: number; p_top2: number };
type ObvodOdhad = {
  status: string; n_total?: number; n_counted?: number; frac_counted?: number;
  p_decided_round1?: number; reliability?: string; candidates?: Kand[];
};
type Odhad = { generated: string; se: Record<string, ObvodOdhad> };

const pct = (v: number, d = 1) => `${(v * 100).toFixed(d).replace('.', ',')} %`;
const timeOf = (iso: string) => {
  const m = /T(\d\d):(\d\d)/.exec(iso);
  return m ? `${m[1]}:${m[2]}` : iso;
};

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

// Vyhodnocení obvodu: pořadí kandidátů, jistota (pravděpodobnost, že sedí vítěz 1. kola,
// resp. postupová dvojice – dolní odhad p1 + p2 − 1) a úroveň semaforu.
function vyhodnot(od?: ObvodOdhad) {
  if (!od || od.status !== 'ok' || !od.candidates?.length) return null;
  const c = [...od.candidates].sort((a, b) => b.est_share - a.est_share);
  const p1 = od.p_decided_round1 ?? 0;
  const kolo1 = p1 >= 0.5;
  const jistota = kolo1 ? (c[0].p_win_round1 ?? p1) : Math.max(0, (c[0].p_top2 ?? 0) + (c[1]?.p_top2 ?? 0) - 1);
  const frac = od.frac_counted ?? 0;
  const level: Level = jistota >= 0.99 && frac >= 0.3 ? 'vysoka' : jistota >= 0.9 ? 'stredni' : 'nizka';
  return { c, p1, kolo1, jistota, frac, level, hotovo: frac >= 0.999 };
}

export interface SenatPredikceMapaProps {
  mapaUrl: string;
  odhadUrl: string;
  title?: string;
  subtitle?: string;
  source?: string;
}

export default function SenatPredikceMapa({ mapaUrl, odhadUrl, title, subtitle, source }: SenatPredikceMapaProps) {
  const [wrapRef, width] = useWidth<HTMLDivElement>();
  const [data, setData] = useState<MapData | null>(null);
  const [odhad, setOdhad] = useState<Odhad | null>(null);
  const [hover, setHover] = useState<{ o: number; x: number; y: number } | null>(null);
  const [sel, setSel] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    fetch(mapaUrl).then((r) => r.json()).then((m) => { if (alive) setData(m as MapData); });
    return () => { alive = false; };
  }, [mapaUrl]);
  // odhad se během večera mění – obnova každou minutu (jen na viditelné kartě)
  useEffect(() => pollJson(odhadUrl, (o) => setOdhad(o as Odhad)), [odhadUrl]);

  const height = Math.round(width * 0.56);
  const narrow = width < 560;
  const vol = useMemo(() => data?.vol ?? [], [data]);
  const ev = useMemo(() => {
    const r: Record<number, ReturnType<typeof vyhodnot>> = {};
    for (const o of vol) r[o] = vyhodnot(odhad?.se[String(o)]);
    return r;
  }, [vol, odhad]);
  const levelOf = (o: number): Level => ev[o]?.level ?? 'nic';
  const counts = useMemo(() => {
    const c: Record<Level, number> = { vysoka: 0, stredni: 0, nizka: 0, nic: 0 };
    for (const o of vol) c[levelOf(o)] += 1;
    return c;
  }, [vol, ev]); // eslint-disable-line react-hooks/exhaustive-deps

  // výchozí výběr: obvod s nejvíc sečtenými okrsky
  useEffect(() => {
    if (sel !== null || !odhad) return;
    const best = vol.filter((o) => ev[o]).sort((a, b) => (ev[b]!.frac) - (ev[a]!.frac))[0];
    if (best) setSel(best);
  }, [odhad, vol, ev, sel]);

  const geo = useMemo(() => {
    if (!data || !width) return null;
    const outline: Feature = { type: 'Feature', properties: {}, geometry: data.outline };
    const proj = geoMercator().fitExtent([[4, 4], [width - 4, height - 4]], outline);
    const path = geoPath(proj);
    const a = proj([15, 49.8])!; const b = proj([15, 49.86])!;
    const r = Math.max(1.4, Math.abs(a[1] - b[1]) * 0.87 * 0.3);
    const dots = data.dots.map(([lon, lat, o]) => { const p = proj([lon, lat])!; return { x: p[0], y: p[1], o }; });
    const feats = data.obvody.features.filter((f) => data.vol.includes(f.properties.o));
    const praha = data.obvody.features.filter((f) => f.properties.n.startsWith('Praha'));
    const iw = narrow ? Math.round(width * 0.7) : Math.round(width * 0.42);
    const ih = Math.round(iw * 0.6);
    const ix = Math.round((width - iw) / 2); const iy = height + 10;
    const iproj = geoMercator().fitExtent([[ix + 6, iy + 18], [ix + iw - 6, iy + ih - 6]], { type: 'FeatureCollection', features: praha } as FeatureCollection);
    return { path, ipath: geoPath(iproj), dots, r, feats, praha, inset: { x: ix, y: iy, w: iw, h: ih } };
  }, [data, width, height, narrow]);

  const local = (e: React.PointerEvent) => {
    const box = wrapRef.current?.getBoundingClientRect();
    return box ? { x: e.clientX - box.left, y: e.clientY - box.top } : { x: 0, y: 0 };
  };

  const pick = (o: number) => {
    setSel(o);
    requestAnimationFrame(() => {
      const el = cardRef.current; if (!el) return;
      if (el.getBoundingClientRect().top > window.innerHeight - 80) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  };

  const colorOf = (o: number, hl: boolean) => (hl ? INK : LEVELS[levelOf(o)].color);
  const propsOf = (o: number) => data?.obvody.features.find((f) => f.properties.o === o)?.properties;

  const selP = sel !== null ? propsOf(sel) : undefined;
  const selO = sel !== null ? odhad?.se[String(sel)] : undefined;
  const selE = sel !== null ? ev[sel] : null;
  const scaleMax = selE ? Math.max(0.5, ...selE.c.map((k) => k.est_share + 1.645 * k.sd, 0)) : 0.5;
  const hovP = hover ? propsOf(hover.o) : undefined;
  const hovE = hover ? ev[hover.o] : null;

  return (
    <div style={{ clear: 'both' }}>
      <ChartCard title={title} subtitle={subtitle} source={source}>
        <div style={{ fontFamily: FONT, color: INK }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '6px 16px', marginBottom: 10, fontSize: 14 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px' }}>
              {(Object.keys(LEVELS) as Level[]).map((l) => (
                <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 11, height: 11, borderRadius: 6, background: LEVELS[l].color }} />
                  {LEVELS[l].label} <strong>{counts[l]}</strong>
                </span>
              ))}
            </div>
            {odhad && <div style={{ color: MUTED }}>stav k {timeOf(odhad.generated)}</div>}
          </div>

          <div ref={wrapRef} style={{ position: 'relative', width: '100%' }} onMouseLeave={() => setHover(null)}>
            {!geo && <div style={{ height: Math.max(height, 240), display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED }}>Načítám mapu…</div>}
            {geo && (
              <svg width={width} height={geo.inset.y + geo.inset.h + 2} role="img" aria-label="Mapa senátních obvodů s průběžným odhadem" style={{ display: 'block', touchAction: 'manipulation' }}>
                <g pointerEvents="none">
                  {geo.dots.map((d, i) => {
                    const on = vol.includes(d.o);
                    return <circle key={i} cx={d.x} cy={d.y} r={on ? geo.r * 1.15 : geo.r} fill={on ? colorOf(d.o, hover?.o === d.o || sel === d.o) : DOT} />;
                  })}
                </g>
                {geo.feats.map((f) => {
                  const o = f.properties.o; const hl = hover?.o === o || sel === o; const c = LEVELS[levelOf(o)].color;
                  return (
                    <path key={o} d={geo.path(f) ?? ''} fill={c} fillOpacity={hl ? 0.22 : 0.1}
                      stroke={hl ? INK : c} strokeOpacity={hl ? 1 : 0.5} strokeWidth={hl ? 1.8 : 0.9}
                      style={{ cursor: 'pointer' }}
                      onPointerMove={(e) => setHover({ o, ...local(e) })}
                      onPointerLeave={() => setHover(null)}
                      onClick={() => pick(o)} />
                  );
                })}
                <g>
                  <rect x={geo.inset.x} y={geo.inset.y} width={geo.inset.w} height={geo.inset.h} rx={6} fill="#fff" stroke="#e0ddd2" />
                  <text x={geo.inset.x + 8} y={geo.inset.y + 14} fontSize={12} fontWeight={700} fill={MUTED} style={{ fontFamily: FONT }}>Praha</text>
                  {geo.praha.map((f) => {
                    const o = f.properties.o; const on = vol.includes(o); const hl = hover?.o === o || sel === o;
                    return (
                      <path key={o} d={geo.ipath(f) ?? ''} fill={on ? colorOf(o, hl) : '#ebe8de'} stroke="#fff" strokeWidth={1}
                        style={{ cursor: on ? 'pointer' : 'default' }}
                        onPointerMove={on ? (e) => setHover({ o, ...local(e) }) : () => setHover(null)}
                        onClick={on ? () => pick(o) : undefined} />
                    );
                  })}
                </g>
              </svg>
            )}
            {hover && hovP && (
              <div style={{
                position: 'absolute', pointerEvents: 'none', zIndex: 2, top: Math.max(0, hover.y - 70),
                left: hover.x > width - 240 ? undefined : hover.x + 14, right: hover.x > width - 240 ? width - hover.x + 14 : undefined,
                background: '#fff', border: '1px solid #e6e3d9', borderRadius: 6, padding: '7px 10px', fontSize: 13, lineHeight: 1.4,
                boxShadow: '0 4px 14px rgba(16,20,50,.12)', maxWidth: 240,
              }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{hovP.o} – {hovP.n}</div>
                {hovE ? (
                  <div style={{ color: MUTED }}>
                    {hovE.kolo1
                      ? <>vede {hovE.c[0].name} ({pct(hovE.c[0].est_share)}), může vyhrát v 1. kole</>
                      : <>2. kolo: {hovE.c[0].name} a {hovE.c[1]?.name}</>}
                    <div>sečteno {pct(hovE.frac, 0)} okrsků</div>
                  </div>
                ) : <div style={{ color: MUTED }}>zatím bez sečtených okrsků</div>}
              </div>
            )}
          </div>

          {/* karta vybraného obvodu */}
          <div ref={cardRef} style={{ marginTop: 14, background: '#fff', border: '1px solid #e6e3d9', borderRadius: 8, padding: narrow ? 12 : '14px 18px' }}>
            {!selP && <div style={{ color: MUTED, fontSize: 15 }}>Klikněte nebo ťukněte na obvod v mapě.</div>}
            {selP && (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 10px' }}>
                  <div style={{ fontWeight: 700, fontSize: 20 }}>{selP.o} – {selP.n}</div>
                  <span style={{
                    fontSize: 12, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', padding: '2px 9px', borderRadius: 10,
                    background: LEVELS[selE?.level ?? 'nic'].color, color: selE?.level === 'stredni' || !selE ? INK : '#fff',
                  }}>
                    {LEVELS[selE?.level ?? 'nic'].label}
                  </span>
                </div>
                <div style={{ color: MUTED, fontSize: 14, margin: '4px 0 12px' }}>
                  {selO?.n_total ? `sečteno ${selO.n_counted ?? 0} z ${selO.n_total} okrsků (${pct(selE?.frac ?? 0, 0)})` : 'zatím bez sečtených okrsků'}
                  {selE && <> · rozhodnuto v 1. kole s pravděpodobností <strong style={{ color: INK }}>{pct(selE.p1, 0)}</strong></>}
                </div>
                {selE && (
                  <div style={{ display: 'grid', gap: 10 }}>
                    {selE.c.map((k, i) => {
                      const postup = !selE.kolo1 && i < 2;
                      const vitez = selE.kolo1 && i === 0;
                      const lo = Math.max(0, k.est_share - 1.645 * k.sd); const hi = k.est_share + 1.645 * k.sd;
                      const X = (v: number) => `${(v / scaleMax) * 100}%`;
                      return (
                        <div key={k.no}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 15 }}>
                            <span>
                              <strong>{k.name}</strong> <span style={{ color: MUTED }}>· {k.party}</span>
                              {postup && <span style={{ marginLeft: 6, fontSize: 12, fontWeight: 700, color: BLUE }}>→ 2. kolo ({pct(k.p_top2, 0)})</span>}
                              {vitez && <span style={{ marginLeft: 6, fontSize: 12, fontWeight: 700, color: LEVELS.vysoka.color }}>vítěz v 1. kole ({pct(k.p_win_round1, 0)})</span>}
                            </span>
                            <strong style={{ whiteSpace: 'nowrap' }}>{pct(k.est_share)}</strong>
                          </div>
                          <div style={{ position: 'relative', height: 12, background: '#f1efe7', borderRadius: 3, marginTop: 4 }}>
                            {/* 90% interval */}
                            <div style={{ position: 'absolute', left: X(lo), width: `calc(${X(hi)} - ${X(lo)})`, top: 0, bottom: 0, background: postup || vitez ? 'rgba(0,112,244,.22)' : 'rgba(16,20,50,.12)', borderRadius: 3 }} />
                            {/* odhad */}
                            <div style={{ position: 'absolute', left: X(k.est_share), top: -2, bottom: -2, width: 3, marginLeft: -1.5, background: postup || vitez ? BLUE : MUTED, borderRadius: 1 }} />
                            {/* sečteno */}
                            <div title="podíl ze sečtených okrsků" style={{ position: 'absolute', left: X(k.counted_share), top: 2, width: 8, height: 8, marginLeft: -4, background: '#f2a31b', transform: 'rotate(45deg)' }} />
                          </div>
                        </div>
                      );
                    })}
                    {/* 50% hranice pro výhru v 1. kole */}
                    <div style={{ fontSize: 12.5, color: MUTED, display: 'flex', flexWrap: 'wrap', gap: '2px 14px' }}>
                      <span><span style={{ display: 'inline-block', width: 3, height: 11, background: BLUE, verticalAlign: 'middle', marginRight: 5 }} />odhad konečného výsledku</span>
                      <span><span style={{ display: 'inline-block', width: 14, height: 9, background: 'rgba(0,112,244,.22)', verticalAlign: 'middle', marginRight: 5 }} />90% interval</span>
                      <span><span style={{ display: 'inline-block', width: 7, height: 7, background: '#f2a31b', transform: 'rotate(45deg)', verticalAlign: 'middle', marginRight: 6 }} />podíl ze sečtených okrsků</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </ChartCard>
    </div>
  );
}
