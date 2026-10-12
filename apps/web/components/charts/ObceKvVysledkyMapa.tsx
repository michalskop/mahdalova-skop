'use client';

// Komunální volby 2026 – výsledky a jak brzy je predikce znala (184 zastupitelstev, městské části sloučené do bodu města).
// mapaUrl   = senat-mapa.json (obrys ČR a tečkový podklad – sdílený s mapou Senátu)
// obceUrl   = obce-mapa.json [{ n, lon, lat, keys }] – první klíč = hlavní zastupitelstvo obce
// odhadUrl  = odhad_kv.json – konečný stav (/api/latest po sečtení 100 %), názvy kandidátek
// prubehUrl = prubeh_kv.json – průběh predikce a sčítání po dávkách ČSÚ + milníky „kdy jsme to věděli“ (prubeh_predikce.py)
// Bod: výplň = barva vítězné kandidátky. Klik / ťuknutí → karta pod mapou s milníky, grafem průběhu a pruhy.

import { useEffect, useMemo, useRef, useState } from 'react';
import { geoMercator } from 'd3-geo';
import type { Feature, Geometry } from 'geojson';
import ChartCard from './ChartCard';
import PrubehPredikceGraf, { PrubehPruhy, hhmm, stavV, MILNIKY, type MilnikKey, type PrubehZ } from './PrubehPredikceGraf';

const INK = '#101432';
const MUTED = '#4c4f8e';
const DOT = '#d6d3c7';
const FONT = 'var(--font-roboto-condensed), Arial, sans-serif';

type Lst = { a: string; nm: string; c?: string; e: number; s: number };
type Zast = { n: string; seats: number; nt: number; l?: Lst[] };
type Odhad = { kv: Record<string, Zast> };
type Obec = { n: string; lon: number; lat: number; keys: string[] };
type MapData = { outline: Geometry; dots: [number, number, number][] };
type Prubeh = { kv: Record<string, PrubehZ> };

const pct = (v: number, d = 1) => `${(v * 100).toFixed(d).replace('.', ',')} %`;
const pl = (n: number, a: string, b: string, c: string) => (n === 1 ? a : n >= 2 && n <= 4 ? b : c);

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

export interface ObceKvVysledkyMapaProps {
  mapaUrl: string;
  obceUrl: string;
  odhadUrl: string;
  prubehUrl: string;
  title?: string;
  subtitle?: string;
  source?: string;
}

export default function ObceKvVysledkyMapa({ mapaUrl, obceUrl, odhadUrl, prubehUrl, title, subtitle, source }: ObceKvVysledkyMapaProps) {
  const [wrapRef, width] = useWidth<HTMLDivElement>();
  const [map, setMap] = useState<MapData | null>(null);
  const [obce, setObce] = useState<Obec[] | null>(null);
  const [odhad, setOdhad] = useState<Odhad | null>(null);
  const [prubeh, setPrubeh] = useState<Prubeh | null>(null);
  const [hover, setHover] = useState<{ n: string; x: number; y: number } | null>(null);
  const [sel, setSel] = useState<{ obec: string; key: string } | null>(null);
  const [okamzik, setOkamzik] = useState<number | null>(null);  // vybraný čas v grafu průběhu, minuty od 10. 10. 0:00 (null = výchozí)
  const [hraje, setHraje] = useState(false);                     // přehrávání večera
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([mapaUrl, obceUrl, odhadUrl, prubehUrl].map((u) => fetch(u).then((r) => r.json()))).then(([m, o, od, pr]) => {
      if (!alive) return;
      setMap(m as MapData); setObce(o as Obec[]); setOdhad(od as Odhad); setPrubeh(pr as Prubeh);
    });
    return () => { alive = false; };
  }, [mapaUrl, obceUrl, odhadUrl, prubehUrl]);

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

  const radius = (o: Obec) => {
    const seats = odhad?.kv[o.keys[0]]?.seats ?? 21;
    return (narrow ? 0.75 : 1) * Math.max(4, Math.min(11, Math.sqrt(seats) * 1.35));
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
  const vyber = (obec: string, key: string) => { setSel({ obec, key }); setOkamzik(null); setHraje(false); };
  const pick = (o: Obec) => {
    vyber(o.n, o.keys[0]);
    requestAnimationFrame(() => {
      const el = cardRef.current; if (!el) return;
      if (el.getBoundingClientRect().top > window.innerHeight - 80) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  };

  const selObec = sel && obce ? obce.find((o) => o.n === sel.obec) : undefined;
  const selZ = sel ? odhad?.kv[sel.key] : undefined;
  const selPr = sel ? prubeh?.kv[sel.key] : undefined;
  const milniky = selPr ? (Object.keys(MILNIKY) as MilnikKey[]).filter((k) => selPr.m[k]).sort((a, b) => selPr.m[a]!.i - selPr.m[b]!.i) : [];
  const posledni = selPr ? selPr.t.length - 1 : 0;
  // výchozí okamžik = kdy jsme znali vítěze, jinak první milník, jinak poslední stav před koncem sčítání
  const cas = selPr ? (okamzik ?? selPr.t[selPr.m.vitez?.i ?? (milniky.length ? selPr.m[milniky[0]]!.i : Math.max(0, selPr.f.findIndex((f) => f >= 1) - 1))]) : 0;
  const idx = selPr ? Math.min(posledni, stavV(selPr, cas)) : 0;
  useEffect(() => {
    if (!hraje) return;
    const konec = selPr ? selPr.konec : 0;
    if (cas >= konec) { setHraje(false); return; }
    const t = setTimeout(() => setOkamzik(Math.min(konec, cas + 3)), 40);
    return () => clearTimeout(t);
  }, [hraje, cas, selPr]);
  const hovObec = hover && obce ? obce.find((o) => o.n === hover.n) : undefined;
  const hovZ = hovObec ? odhad?.kv[hovObec.keys[0]] : undefined;
  const btn = { fontFamily: FONT, fontSize: 13, border: '1px solid #cfccc0', background: '#fff', color: INK, borderRadius: 12, padding: '1px 10px', cursor: 'pointer' };

  return (
    <div style={{ clear: 'both' }}>
      <ChartCard title={title} subtitle={subtitle} source={source}>
        <div style={{ fontFamily: FONT, color: INK }}>
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
                width={width} height={height} role="img" aria-label="Mapa obcí s výsledky komunálních voleb"
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
                    const lead = odhad?.kv[o.keys[0]]?.l?.[0];
                    const on = sel?.obec === o.n || hover?.n === o.n;
                    return (
                      <circle key={o.n} cx={o.x} cy={o.y} r={radius(o) * (on ? 1.35 : 1)} fill={lead?.c ?? '#e8e6de'}
                        stroke={on ? INK : '#fff'} strokeWidth={on ? 2.5 : 1.2} />
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
                {hovZ?.l?.length ? <div style={{ color: MUTED }}>vyhrál {hovZ.l[0].a} ({pct(hovZ.l[0].e)})</div> : null}
              </div>
            )}
          </div>

          {/* karta vybrané obce */}
          <div ref={cardRef} style={{ marginTop: 14, background: '#fff', border: '1px solid #e6e3d9', borderRadius: 8, padding: narrow ? 12 : '14px 18px' }}>
            {selObec && (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 12px', marginBottom: 10 }}>
                  {selObec.keys.length > 1 ? (
                    <select
                      aria-label="Zastupitelstvo"
                      value={sel?.key}
                      onChange={(e) => vyber(selObec.n, e.target.value)}
                      style={{ fontFamily: FONT, fontSize: 18, fontWeight: 700, padding: '3px 6px', border: '1px solid #cfccc0', borderRadius: 4, background: '#fff', color: INK, maxWidth: '100%' }}
                    >
                      {selObec.keys.map((k) => <option key={k} value={k}>{odhad?.kv[k]?.n ?? k}</option>)}
                    </select>
                  ) : <span style={{ fontWeight: 700, fontSize: 20 }}>{selZ?.n ?? selObec.n}</span>}
                  {selZ && <span style={{ color: MUTED, fontSize: 14 }}>{selZ.seats} {pl(selZ.seats, 'mandát', 'mandáty', 'mandátů')} · {selZ.nt} okrsků</span>}
                </div>
                {selPr && (
                  <>
                    <div style={{ margin: '2px 0 14px' }}>
                      <PrubehPredikceGraf z={selPr} width={Math.max(0, width - (narrow ? 26 : 38))} cas={cas} onCas={(m) => { setHraje(false); setOkamzik(m); }} />
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '4px 10px', margin: '0 0 10px' }}>
                      <span style={{ fontSize: 15, fontWeight: 700 }}>{selPr.f[idx] >= 1 ? 'Výsledek' : `Stav v ${hhmm(Math.round(cas))}`}</span>
                      <span style={{ fontSize: 14, color: MUTED }}>sečteno {pct(selPr.f[idx], 0)} okrsků</span>
                      <span style={{ display: 'inline-flex', gap: 6, marginLeft: 'auto' }}>
                        <button type="button" style={btn} onClick={() => { if (!hraje && selPr && cas >= selPr.konec) setOkamzik(selPr.t[0]); setHraje(!hraje); }}>{hraje ? '❚❚ zastavit' : '▶ přehrát večer'}</button>
                        <button type="button" style={btn} onClick={() => { setHraje(false); setOkamzik(selPr.konec); }}>výsledek</button>
                      </span>
                    </div>
                    <PrubehPruhy z={selPr} idx={idx} nazvy={Object.fromEntries((selZ?.l ?? []).map((l) => [l.a, l.nm]))} />
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </ChartCard>
    </div>
  );
}
