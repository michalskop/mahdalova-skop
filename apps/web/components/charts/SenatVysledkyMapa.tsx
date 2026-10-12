'use client';

// Senát 2026, 1. kolo – výsledky a jak brzy je predikce znala (27 obvodů).
// mapaUrl   = senat-mapa.json (polygony obvodů, obrys ČR; Praha ve výřezu pod mapou)
// prubehUrl = prubeh_se.json – průběh predikce a sčítání po dávkách ČSÚ + milník „kdy jsme to věděli“ (prubeh_senat.py)
// Plocha obvodu = barva vítěze 1. kola (prvního v pořadí), bílé hranice mezi obvody. Klik / ťuknutí nebo seznam → karta pod mapou
// se stejným grafem průběhu a pruhy jako u mapy měst (ObceKvVysledkyMapa).

import { useEffect, useMemo, useRef, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import ChartCard from './ChartCard';
import PrubehPredikceGraf, { PrubehPruhy, hhmm, stavV, MILNIKY, type MilnikKey, type PrubehZ } from './PrubehPredikceGraf';

const INK = '#101432';
const MUTED = '#4c4f8e';
const MIMO = '#ebe8de';  // obvody, kde se letos nevolilo
const FONT = 'var(--font-roboto-condensed), Arial, sans-serif';

type ObvodF = Feature<Geometry, { o: number; n: string }>;
type MapData = { vol: number[]; obvody: FeatureCollection<Geometry, { o: number; n: string }>; outline: Geometry };
type Prubeh = { se: Record<string, PrubehZ> };

const pct = (v: number, d = 1) => `${(v * 100).toFixed(d).replace('.', ',')} %`;

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

export interface SenatVysledkyMapaProps {
  mapaUrl: string;
  prubehUrl: string;
  vychoziObvod?: number;
  title?: string;
  subtitle?: string;
  source?: string;
}

export default function SenatVysledkyMapa({ mapaUrl, prubehUrl, vychoziObvod, title, subtitle, source }: SenatVysledkyMapaProps) {
  const [wrapRef, width] = useWidth<HTMLDivElement>();
  const [data, setData] = useState<MapData | null>(null);
  const [prubeh, setPrubeh] = useState<Prubeh | null>(null);
  const [hover, setHover] = useState<{ o: number; x: number; y: number } | null>(null);
  const [sel, setSel] = useState<number | null>(null);
  const [okamzik, setOkamzik] = useState<number | null>(null);  // vybraný čas v grafu průběhu, minuty (null = výchozí)
  const [hraje, setHraje] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([mapaUrl, prubehUrl].map((u) => fetch(u).then((r) => r.json()))).then(([m, p]) => {
      if (!alive) return;
      setData(m as MapData); setPrubeh(p as Prubeh);
    });
    return () => { alive = false; };
  }, [mapaUrl, prubehUrl]);

  const vol = useMemo(() => data?.vol ?? [], [data]);
  useEffect(() => {
    if (sel !== null || !vol.length) return;
    setSel(vychoziObvod != null && vol.includes(vychoziObvod) ? vychoziObvod : vol[0]);
  }, [vol, sel, vychoziObvod]);

  const height = Math.round(width * 0.56);
  const narrow = width < 560;

  const geo = useMemo(() => {
    if (!data || !width) return null;
    const outline: Feature = { type: 'Feature', properties: {}, geometry: data.outline };
    const proj = geoMercator().fitExtent([[4, 4], [width - 4, height - 4]], outline);
    const feats = data.obvody.features as ObvodF[];
    const praha = feats.filter((f) => f.properties.n.startsWith('Praha'));
    const iw = narrow ? Math.round(width * 0.7) : Math.round(width * 0.42);
    const ih = Math.round(iw * 0.6);
    const ix = Math.round((width - iw) / 2); const iy = height + 10;
    const iproj = geoMercator().fitExtent([[ix + 6, iy + 18], [ix + iw - 6, iy + ih - 6]], { type: 'FeatureCollection', features: praha } as FeatureCollection);
    return { path: geoPath(proj), ipath: geoPath(iproj), feats: feats.filter((f) => !f.properties.n.startsWith('Praha')), praha, outline, inset: { x: ix, y: iy, w: iw, h: ih } };
  }, [data, width, height, narrow]);

  const local = (e: React.PointerEvent) => {
    const box = wrapRef.current?.getBoundingClientRect();
    return box ? { x: e.clientX - box.left, y: e.clientY - box.top } : { x: 0, y: 0 };
  };
  const pick = (o: number) => {
    setSel(o); setOkamzik(null); setHraje(false);
    requestAnimationFrame(() => {
      const el = cardRef.current; if (!el) return;
      if (el.getBoundingClientRect().top > window.innerHeight - 80) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  };
  const nazev = (o: number) => data?.obvody.features.find((f) => f.properties.o === o)?.properties.n ?? '';
  const barva = (o: number) => (vol.includes(o) ? prubeh?.se[String(o)]?.l[0]?.c ?? '#b8b4a6' : MIMO);

  const selPr = sel !== null ? prubeh?.se[String(sel)] : undefined;
  const milniky = selPr ? (Object.keys(MILNIKY) as MilnikKey[]).filter((k) => selPr.m[k]) : [];
  const posledni = selPr ? selPr.t.length - 1 : 0;
  const cas = selPr ? (okamzik ?? selPr.t[(milniky.length ? selPr.m[milniky[0]]!.i : Math.max(0, selPr.f.findIndex((f) => f >= 1) - 1))]) : 0;
  const idx = selPr ? Math.min(posledni, stavV(selPr, cas)) : 0;
  useEffect(() => {
    if (!hraje) return;
    const konec = selPr ? selPr.konec : 0;
    if (cas >= konec) { setHraje(false); return; }
    const t = setTimeout(() => setOkamzik(Math.min(konec, cas + 3)), 40);
    return () => clearTimeout(t);
  }, [hraje, cas, selPr]);
  const hovPr = hover ? prubeh?.se[String(hover.o)] : undefined;
  const btn = { fontFamily: FONT, fontSize: 13, border: '1px solid #cfccc0', background: '#fff', color: INK, borderRadius: 12, padding: '1px 10px', cursor: 'pointer' };

  const plocha = (f: ObvodF, d: string | null) => {
    const o = f.properties.o; const on = vol.includes(o); const hl = sel === o || hover?.o === o;
    return (
      <path key={o} d={d ?? ''} fill={barva(o)} fillOpacity={on ? (hover?.o === o ? 0.85 : 1) : 1}
        stroke={hl && on ? INK : '#fff'} strokeWidth={hl && on ? 2.5 : 1}
        style={{ cursor: on ? 'pointer' : 'default' }}
        onPointerMove={on ? (e) => setHover({ o, ...local(e) }) : () => setHover(null)}
        onPointerLeave={() => setHover(null)}
        onClick={on ? () => pick(o) : undefined} />
    );
  };

  return (
    <div style={{ clear: 'both' }}>
      <ChartCard title={title} subtitle={subtitle} source={source}>
        <div style={{ fontFamily: FONT, color: INK }}>
          {data && (
            <select
              aria-label="Vyberte obvod"
              value=""
              onChange={(e) => { if (e.target.value) pick(Number(e.target.value)); }}
              style={{ fontFamily: FONT, fontSize: 15, padding: '6px 8px', border: '1px solid #cfccc0', borderRadius: 4, background: '#fff', color: INK, marginBottom: 8, maxWidth: '100%' }}
            >
              <option value="">Vyberte obvod ze seznamu…</option>
              {[...vol].sort((a, b) => a - b).map((o) => <option key={o} value={o}>{o} – {nazev(o)}</option>)}
            </select>
          )}

          <div ref={wrapRef} style={{ position: 'relative', width: '100%' }} onMouseLeave={() => setHover(null)}>
            {!geo && <div style={{ height: Math.max(height, 240), display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED }}>Načítám mapu…</div>}
            {geo && (
              <svg width={width} height={geo.inset.y + geo.inset.h + 2} role="img" aria-label="Mapa senátních obvodů s výsledky 1. kola" style={{ display: 'block', touchAction: 'manipulation' }}>
                <path d={geo.path({ type: 'Feature', properties: {}, geometry: data!.outline }) ?? ''} fill={MIMO} stroke="#d6d3c7" />
                {geo.feats.map((f) => plocha(f, geo.path(f)))}
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
                <rect x={geo.inset.x} y={geo.inset.y} width={geo.inset.w} height={geo.inset.h} rx={6} fill="#fff" stroke="#e0ddd2" />
                <text x={geo.inset.x + 8} y={geo.inset.y + 14} fontSize={12} fontWeight={700} fill={MUTED} style={{ fontFamily: FONT }}>Praha</text>
                {geo.praha.map((f) => plocha(f, geo.ipath(f)))}
              </svg>
            )}
            {hover && hovPr && (
              <div style={{
                position: 'absolute', pointerEvents: 'none', zIndex: 2, top: Math.max(0, hover.y - 64),
                left: hover.x > width - 240 ? undefined : hover.x + 14, right: hover.x > width - 240 ? width - hover.x + 14 : undefined,
                background: '#fff', border: '1px solid #e6e3d9', borderRadius: 6, padding: '7px 10px', fontSize: 13, lineHeight: 1.4,
                boxShadow: '0 4px 14px rgba(16,20,50,.12)', maxWidth: 260,
              }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{hover.o} – {nazev(hover.o)}</div>
                <div style={{ color: MUTED }}>1. místo {hovPr.l[0].a} ({pct(hovPr.l[0].v / 1000)})</div>
              </div>
            )}
          </div>

          {/* karta vybraného obvodu */}
          <div ref={cardRef} style={{ marginTop: 14, background: '#fff', border: '1px solid #e6e3d9', borderRadius: 8, padding: narrow ? 12 : '14px 18px' }}>
            {sel !== null && selPr && (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '4px 12px', marginBottom: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: 20 }}>{sel} – {nazev(sel)}</span>
                  <span style={{ color: MUTED, fontSize: 14 }}>{selPr.nt} okrsků</span>
                </div>
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
                <PrubehPruhy z={selPr} idx={idx} nazvy={{}} />
              </>
            )}
          </div>
        </div>
      </ChartCard>
    </div>
  );
}
