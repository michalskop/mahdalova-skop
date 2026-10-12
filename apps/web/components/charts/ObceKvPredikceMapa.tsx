'use client';

// Komunální volby 2026 – průběžný odhad pro 184 zastupitelstev (140 obcí, městské části sloučené do bodu města).
// mapaUrl  = senat-mapa.json (obrys ČR a tečkový podklad – sdílený s mapou Senátu)
// obceUrl  = obce-mapa.json [{ n, lon, lat, keys }] – první klíč = hlavní zastupitelstvo obce
// odhadUrl = odhad_kv.json – snímek /api/latest z volby2026.datatimes.cz (skript aktualizuj_odhad.py)
// predikceUrl = predikce_rana.json – nejranější zveřejněná predikce, jejíž součet odchylek od konečného výsledku
//            byl nejvýš `prah` p. b. (predikce_rana.py); v kartě se ukáže světlejší pruh pod výsledkem
// Bod: výplň = barva vedoucí kandidátky, okraj = jistota (semafor). Klik / ťuknutí → karta pod mapou.

import { useEffect, useMemo, useRef, useState } from 'react';
import { geoMercator } from 'd3-geo';
import type { Feature, Geometry } from 'geojson';
import ChartCard from './ChartCard';
import { pollJson } from '@/lib/pollJson';

const INK = '#101432';
const MUTED = '#4c4f8e';
const DOT = '#d6d3c7';
const FONT = 'var(--font-roboto-condensed), Arial, sans-serif';

const LEVELS = {
  vysoka: { color: '#2e9e5b', label: 'vysoká jistota' },
  stredni: { color: '#f2a31b', label: 'střední jistota' },
  nizka: { color: '#de1743', label: 'nízká jistota' },
  nic: { color: '#c4c0b2', label: 'čekáme na data' },
} as const;
type Level = keyof typeof LEVELS;

type Lst = { a: string; nm: string; c?: string; e: number; lo: number; hi: number; s: number; ps?: number };
type Zast = { n: string; seats: number; st: string; frac: number; nc: number; nt: number; rel?: string; l?: Lst[] };
type Odhad = { generated: string; kv: Record<string, Zast> };
type Obec = { n: string; lon: number; lat: number; keys: string[] };
type MapData = { outline: Geometry; dots: [number, number, number][] };
type PredZ = { t: string; frac: number; E?: number; l: Record<string, [number, number | null, (number | null)?, (number | null)?]>; zdroj?: string };
type Predikce = { prah?: number; kv: Record<string, PredZ | { nesplneno: true; minE: number }> };

const pct = (v: number, d = 1) => `${(v * 100).toFixed(d).replace('.', ',')} %`;
const pl = (n: number, a: string, b: string, c: string) => (n === 1 ? a : n >= 2 && n <= 4 ? b : c);

// stejná logika jako dashboard: průměrná jistota počtu mandátů u kandidátek nad 5 %
function jistota(z?: Zast): { level: Level; p: number } {
  if (!z?.l?.length || z.st !== 'ok') return { level: 'nic', p: 0 };
  if (z.frac >= 0.999) return { level: 'vysoka', p: 1 };
  const big = z.l.filter((l) => l.e >= 0.05 && l.ps != null);
  const p = big.length ? big.reduce((s, l) => s + (l.ps as number), 0) / big.length : 0;
  const level: Level = p >= 0.99 && z.frac >= 0.3 ? 'vysoka' : p >= 0.9 && z.frac >= 0.15 ? 'stredni' : 'nizka';
  return { level, p };
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

export interface ObceKvPredikceMapaProps {
  mapaUrl: string;
  obceUrl: string;
  odhadUrl: string;
  predikceUrl?: string;
  title?: string;
  subtitle?: string;
  source?: string;
}

export default function ObceKvPredikceMapa({ mapaUrl, obceUrl, odhadUrl, predikceUrl, title, subtitle, source }: ObceKvPredikceMapaProps) {
  const [wrapRef, width] = useWidth<HTMLDivElement>();
  const [map, setMap] = useState<MapData | null>(null);
  const [obce, setObce] = useState<Obec[] | null>(null);
  const [odhad, setOdhad] = useState<Odhad | null>(null);
  const [pred, setPred] = useState<Predikce | null>(null);
  const [hover, setHover] = useState<{ n: string; x: number; y: number } | null>(null);
  const [sel, setSel] = useState<{ obec: string; key: string } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([fetch(mapaUrl).then((r) => r.json()), fetch(obceUrl).then((r) => r.json())]).then(([m, o]) => {
      if (!alive) return;
      setMap(m as MapData);
      setObce(o as Obec[]);
    });
    return () => { alive = false; };
  }, [mapaUrl, obceUrl]);
  useEffect(() => {
    if (!predikceUrl) return;
    let alive = true;
    fetch(predikceUrl).then((r) => r.json()).then((p) => { if (alive) setPred(p as Predikce); });
    return () => { alive = false; };
  }, [predikceUrl]);
  // odhad se během večera mění – obnova každou minutu (jen na viditelné kartě)
  useEffect(() => pollJson(odhadUrl, (o) => setOdhad(o as Odhad)), [odhadUrl]);

  // výchozí výběr: Praha
  useEffect(() => {
    if (sel || !obce) return;
    const p = obce.find((o) => o.n === 'Praha') ?? obce[0];
    if (p) setSel({ obec: p.n, key: p.keys[0] });
  }, [obce, sel]);

  const height = Math.round(width * 0.56);
  const narrow = width < 560;

  const geo = useMemo(() => {
    if (!map || !obce || !width) return null;
    const outline: Feature = { type: 'Feature', properties: {}, geometry: map.outline };
    const proj = geoMercator().fitExtent([[4, 4], [width - 4, height - 4]], outline);
    const a = proj([15, 49.8])!; const b = proj([15, 49.86])!;
    const r = Math.max(1.2, Math.abs(a[1] - b[1]) * 0.87 * 0.26);
    const dots = map.dots.map(([lon, lat]) => proj([lon, lat])!);
    const pts = obce.map((o) => { const p = proj([o.lon, o.lat])!; return { ...o, x: p[0], y: p[1] }; });
    return { dots, r, pts };
  }, [map, obce, width, height]);

  const counts = useMemo(() => {
    const c: Record<Level, number> = { vysoka: 0, stredni: 0, nizka: 0, nic: 0 };
    if (odhad) for (const z of Object.values(odhad.kv)) c[jistota(z).level] += 1;
    return c;
  }, [odhad]);

  const radius = (o: Obec) => {
    const seats = odhad?.kv[o.keys[0]]?.seats ?? 21;
    const k = narrow ? 0.75 : 1;
    return k * Math.max(4, Math.min(11, Math.sqrt(seats) * 1.35));
  };

  const nearest = (x: number, y: number) => {
    if (!geo) return null;
    let best: (typeof geo.pts)[number] | null = null; let bd = Infinity;
    for (const p of geo.pts) { const d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < bd) { bd = d; best = p; } }
    return best && bd < (narrow ? 22 : 18) ** 2 ? best : null;
  };
  const local = (e: React.PointerEvent | React.MouseEvent) => {
    const box = wrapRef.current?.getBoundingClientRect();
    return box ? { x: e.clientX - box.left, y: e.clientY - box.top } : { x: 0, y: 0 };
  };
  const pick = (o: Obec) => {
    setSel({ obec: o.n, key: o.keys[0] });
    requestAnimationFrame(() => {
      const el = cardRef.current; if (!el) return;
      if (el.getBoundingClientRect().top > window.innerHeight - 80) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  };

  const selObec = sel && obce ? obce.find((o) => o.n === sel.obec) : undefined;
  const selZ = sel ? odhad?.kv[sel.key] : undefined;
  const selJ = jistota(selZ);
  const rows = (selZ?.l ?? []).filter((l) => l.e >= 0.01 || l.s > 0);
  const selPz = sel ? pred?.kv[sel.key] : undefined;
  const selP = selPz && !('nesplneno' in selPz) ? selPz : undefined;
  const pOf = (l: Lst) => selP?.l[`${l.a}|${l.nm}`];
  const scaleMax = Math.max(0.3, ...rows.map((l) => Math.max(l.hi, pOf(l)?.[0] ?? 0, pOf(l)?.[3] ?? 0)));
  const hovObec = hover && obce ? obce.find((o) => o.n === hover.n) : undefined;
  const hovZ = hovObec ? odhad?.kv[hovObec.keys[0]] : undefined;

  return (
    <div style={{ clear: 'both' }}>
      <ChartCard title={title} subtitle={subtitle} source={source}>
        <div style={{ fontFamily: FONT, color: INK }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '6px 16px', marginBottom: 8, fontSize: 14 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px' }}>
              {(Object.keys(LEVELS) as Level[]).map((l) => (
                <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 7, background: '#fff', border: `3px solid ${LEVELS[l].color}`, boxSizing: 'border-box' }} />
                  {LEVELS[l].label} <strong>{counts[l]}</strong>
                </span>
              ))}
            </div>
            {odhad && <div style={{ color: MUTED }}>stav k {odhad.generated.slice(11, 16)}</div>}
          </div>
          <div style={{ fontSize: 13, color: MUTED, marginBottom: 8 }}>Výplň bodu = barva vedoucí kandidátky, okraj = jistota odhadu. Počty platí pro všech 184 zastupitelstev včetně městských částí.</div>
          {obce && (
            <select
              aria-label="Vyberte obec"
              value=""
              onChange={(e) => { const o = obce.find((x) => x.n === e.target.value); if (o) pick(o); }}
              style={{ fontFamily: FONT, fontSize: 15, padding: '6px 8px', border: '1px solid #cfccc0', borderRadius: 4, background: '#fff', color: INK, marginBottom: 8, maxWidth: '100%' }}
            >
              <option value="">Vyberte obec ze seznamu…</option>
              {obce.map((o) => <option key={o.n} value={o.n}>{o.n}</option>)}
            </select>
          )}

          <div ref={wrapRef} style={{ position: 'relative', width: '100%' }} onMouseLeave={() => setHover(null)}>
            {!geo && <div style={{ height: Math.max(height, 240), display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED }}>Načítám mapu…</div>}
            {geo && (
              <svg
                width={width} height={height} role="img" aria-label="Mapa obcí s průběžným odhadem komunálních voleb"
                style={{ display: 'block', touchAction: 'manipulation', cursor: 'pointer' }}
                onPointerMove={(e) => { const p = local(e); const o = nearest(p.x, p.y); setHover(o ? { n: o.n, ...p } : null); }}
                onClick={(e) => { const p = local(e); const o = nearest(p.x, p.y); if (o) pick(o); }}
              >
                <g pointerEvents="none">
                  {geo.dots.map((d, i) => <circle key={i} cx={d[0]} cy={d[1]} r={geo.r} fill={DOT} />)}
                </g>
                {/* logo v pravém horním rohu nad Moravskoslezským krajem */}
                {(() => {
                  const s = narrow ? 13 : 26; const fs = narrow ? 9.5 : 16;
                  const x = width - 4 - fs * 6.4 - s - 4;
                  return (
                    <g pointerEvents="none">
                      <image href="/images/datatimes-donut.svg" x={x} y={2} width={s} height={s} />
                      <text x={x + s + 6} y={2 + s / 2 + fs * 0.36} fontSize={fs} fontWeight={700} fill={INK}
                        style={{ fontFamily: 'var(--font-roboto-slab), Georgia, serif' }}>DataTimes.cz</text>
                    </g>
                  );
                })()}
                <g pointerEvents="none">
                  {[...geo.pts].sort((a, b) => radius(b) - radius(a)).map((o) => {
                    const z = odhad?.kv[o.keys[0]];
                    const lead = z?.l?.[0];
                    const j = jistota(z);
                    const on = sel?.obec === o.n || hover?.n === o.n;
                    const r = radius(o) * (on ? 1.35 : 1);
                    return (
                      <circle key={o.n} cx={o.x} cy={o.y} r={r} fill={lead?.c ?? '#e8e6de'}
                        stroke={LEVELS[j.level].color} strokeWidth={on ? 3.2 : 2.2} />
                    );
                  })}
                </g>
              </svg>
            )}
            {hover && hovObec && (
              <div style={{
                position: 'absolute', pointerEvents: 'none', zIndex: 2, top: Math.max(0, hover.y - 64),
                left: hover.x > width - 240 ? undefined : hover.x + 14, right: hover.x > width - 240 ? width - hover.x + 14 : undefined,
                background: '#fff', border: '1px solid #e6e3d9', borderRadius: 6, padding: '7px 10px', fontSize: 13, lineHeight: 1.4,
                boxShadow: '0 4px 14px rgba(16,20,50,.12)', maxWidth: 240,
              }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{hovObec.n}</div>
                <div style={{ color: MUTED }}>
                  {hovZ?.l?.length ? <>vede {hovZ.l[0].a} ({pct(hovZ.l[0].e)}) · sečteno {pct(hovZ.frac, 0)}</> : 'zatím bez sečtených okrsků'}
                </div>
              </div>
            )}
          </div>

          {/* karta vybrané obce */}
          <div ref={cardRef} style={{ marginTop: 14, background: '#fff', border: '1px solid #e6e3d9', borderRadius: 8, padding: narrow ? 12 : '14px 18px' }}>
            {selObec && (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 10px' }}>
                  <div style={{ fontWeight: 700, fontSize: 20 }}>{selZ?.n ?? selObec.n}</div>
                  <span style={{
                    fontSize: 12, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', padding: '2px 9px', borderRadius: 10,
                    background: LEVELS[selJ.level].color, color: selJ.level === 'stredni' || selJ.level === 'nic' ? INK : '#fff',
                  }}>
                    {selZ && selZ.frac >= 0.999 ? 'sečteno' : LEVELS[selJ.level].label}
                  </span>
                </div>
                {selObec.keys.length > 1 && (
                  <select
                    aria-label="Zastupitelstvo"
                    value={sel?.key}
                    onChange={(e) => setSel({ obec: selObec.n, key: e.target.value })}
                    style={{ fontFamily: FONT, fontSize: 14, padding: '4px 6px', border: '1px solid #cfccc0', borderRadius: 4, background: '#fff', color: INK, margin: '6px 0 2px', maxWidth: '100%' }}
                  >
                    {selObec.keys.map((k) => <option key={k} value={k}>{odhad?.kv[k]?.n ?? k}</option>)}
                  </select>
                )}
                <div style={{ color: MUTED, fontSize: 14, margin: '4px 0 12px' }}>
                  {selZ ? `${selZ.seats} ${pl(selZ.seats, 'mandát', 'mandáty', 'mandátů')} · stav k ${odhad?.generated.slice(11, 16)}, sečteno ${selZ.nc} z ${selZ.nt} okrsků (${pct(selZ.frac, 0)})` : ''}
                  {selP && (
                    <div style={{ color: INK, marginTop: 2 }}>
                      Naše predikce z <strong>{selP.t}</strong>, kdy bylo sečteno {pct(selP.frac, 0)} okrsků – světlejší pruh
                    </div>
                  )}
                </div>
                {!rows.length && <div style={{ color: MUTED, fontSize: 15 }}>Zatím bez sečtených okrsků.</div>}
                <div style={{ display: 'grid', gap: 9 }}>
                  {rows.map((l) => {
                    const X = (v: number) => `${(v / scaleMax) * 100}%`;
                    return (
                      <div key={l.a + l.nm}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 15 }}>
                          <span style={{ minWidth: 0 }}>
                            <strong>{l.a}</strong>
                            {l.nm && l.nm !== l.a && <span style={{ color: MUTED, fontSize: 13 }}> · {l.nm}</span>}
                          </span>
                          <span style={{ whiteSpace: 'nowrap' }}>
                            <strong>{pct(l.e)}</strong>
                            <span style={{ color: MUTED, marginLeft: 8 }}>{l.s} {pl(l.s, 'mandát', 'mandáty', 'mandátů')}</span>
                          </span>
                        </div>
                        <div style={{ position: 'relative', height: 10, background: '#f1efe7', borderRadius: 3, marginTop: 4 }}>
                          <div style={{ position: 'absolute', left: 0, width: X(l.e), top: 0, bottom: 0, background: l.c ?? '#b8b4a6', borderRadius: 3 }} />
                          {l.hi > l.lo && (
                            <div style={{ position: 'absolute', left: X(l.lo), width: `calc(${X(l.hi)} - ${X(l.lo)})`, top: -2, bottom: -2, border: `1.5px solid ${INK}`, borderRadius: 3, opacity: 0.45 }} />
                          )}
                        </div>
                        {pOf(l) && (
                          <>
                            <div style={{ position: 'relative', height: 7, background: '#f1efe7', borderRadius: 3, marginTop: 3 }}>
                              <div style={{ position: 'absolute', left: 0, width: X(pOf(l)![0]), top: 0, bottom: 0, background: l.c ?? '#b8b4a6', opacity: 0.38, borderRadius: 3 }} />
                              {pOf(l)![2] != null && pOf(l)![3] != null && (pOf(l)![3] as number) > (pOf(l)![2] as number) && (
                                <div style={{ position: 'absolute', left: X(pOf(l)![2] as number), width: `calc(${X(pOf(l)![3] as number)} - ${X(pOf(l)![2] as number)})`, top: -2, bottom: -2, border: `1.5px solid ${INK}`, borderRadius: 3, opacity: 0.4 }} />
                              )}
                            </div>
                            <div style={{ fontSize: 12.5, color: MUTED, textAlign: 'right', marginTop: 1 }}>
                              predikce {pct(pOf(l)![0])}
                              {pOf(l)![2] != null && pOf(l)![3] != null ? ` (${pct(pOf(l)![2] as number)}–${pct(pOf(l)![3] as number)})` : ''}
                              {pOf(l)![1] != null ? ` · ${pOf(l)![1]} ${pl(pOf(l)![1] as number, 'mandát', 'mandáty', 'mandátů')}` : ''}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
                {rows.length > 0 && (
                  <div style={{ fontSize: 12.5, color: MUTED, marginTop: 10 }}>
                    {selP
                      ? `Plný pruh = konečný výsledek, světlejší pruh = naše predikce z ${selP.t}, rámeček kolem něj = její 90% interval.`
                      : 'Pruh = odhad konečného podílu hlasů, rámeček = 90% interval, mandáty = nejpravděpodobnější počet.'}
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
