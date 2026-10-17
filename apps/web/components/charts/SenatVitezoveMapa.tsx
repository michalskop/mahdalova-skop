'use client';

// Senát 2026 – kdo vyhrál v 27 obvodech: tečková mapa ČR + výřez Prahy, barva = předpokládaný klub vítěze.
// Přepínač 1. kolo (jen zvolení v 1. kole, u ostatních postupující dvojice) / 2. kolo (všech 27 vítězů).
// <SenatVitezoveMapa mapaUrl=".../senat-mapa.json" apiUrl="https://volby2026-2.datatimes.cz/api/latest.json" klubyUrl=".../kluby.json" />
// Vítězové a podíly z predikce (volby2026-2.datatimes.cz, po dosčítání = výsledek ČSÚ), kluby a navrhující strany z kluby.json.

import { useEffect, useMemo, useRef, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import ChartCard from './ChartCard';
import { pollJson } from '@/lib/pollJson';

const INK = '#101432';
const MUTED = '#4c4f8e';
const DOT = '#d6d3c7';
const FONT = 'var(--font-roboto-condensed), Arial, sans-serif';

type MapData = {
  obvody: FeatureCollection<Geometry, { o: number; n: string }>;
  outline: Geometry;
  dots: [number, number, number][];
};
type Cand = { name: string; party: string; r1?: number; share?: number };
type Ob = { ob: number; name: string; status: string; final?: boolean; a?: Cand; b?: Cand; winner?: Cand; a_share?: number; p_a?: number };
type Api = { generated: string; se2: Record<string, Ob>; decided?: Record<string, { name: string; revoked?: boolean }> };
type Klub = { id: string; nazev: string; kratce: string; barva: string };
type Kluby = { kluby: Klub[]; kandidati: Record<string, Record<string, { klub: string; z?: boolean; navrh?: string }>> };

const pct = (v: number) => `${(v * 100).toFixed(1).replace('.', ',')} %`;
// „Zelení, STAN, Piráti, TOP 09, SEN 21“ → „Zelení, STAN, Piráti, TOP 09 a SEN 21“
const hezky = (s: string) => { const p = s.split(', '); return p.length > 1 ? `${p.slice(0, -1).join(', ')} a ${p[p.length - 1]}` : s; };

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

export default function SenatVitezoveMapa({ mapaUrl, apiUrl, klubyUrl }: { mapaUrl: string; apiUrl: string; klubyUrl: string }) {
  const [wrapRef, width] = useWidth<HTMLDivElement>();
  const [data, setData] = useState<MapData | null>(null);
  const [api, setApi] = useState<Api | null>(null);
  const [kl, setKl] = useState<Kluby | null>(null);
  const [kolo, setKolo] = useState<1 | 2>(2);
  const [hover, setHover] = useState<{ o: number; x: number; y: number } | null>(null);

  useEffect(() => { fetch(mapaUrl).then((r) => r.json()).then(setData).catch(() => {}); }, [mapaUrl]);
  useEffect(() => { fetch(klubyUrl).then((r) => r.json()).then(setKl).catch(() => {}); }, [klubyUrl]);
  useEffect(() => pollJson(apiUrl, (d) => setApi(d as Api), 60_000), [apiUrl]);

  const height = Math.round(width * 0.56);
  const narrow = width < 560;

  // výsledek obvodu: vítěz, poražený, kolo, klub
  const vys = useMemo(() => {
    const r: Record<number, { o: Ob; win: Cand; los?: Cand; winShare: number; losShare?: number; kolo: 1 | 2; klub?: Klub; z: boolean } | null> = {};
    if (!api || !kl) return r;
    for (const o of Object.values(api.se2)) {
      const info = (n: string) => kl.kandidati[String(o.ob)]?.[n];
      if (o.status === 'decided_r1' && o.winner) {
        const k = kl.kluby.find((x) => x.id === info(o.winner!.name)?.klub);
        r[o.ob] = { o, win: o.winner, winShare: o.winner.share ?? 0, kolo: 1, klub: k, z: !!info(o.winner.name)?.z };
        continue;
      }
      if (!o.a || !o.b) { r[o.ob] = null; continue; }
      const ev = api.decided?.[String(o.ob)];
      if (!o.final && !(ev && !ev.revoked)) { r[o.ob] = null; continue; }
      const aWin = ev && !ev.revoked ? ev.name === o.a.name : (o.p_a ?? 0) >= 0.5;
      const win = aWin ? o.a : o.b, los = aWin ? o.b : o.a;
      const sa = o.a_share ?? 0.5;
      const k = kl.kluby.find((x) => x.id === info(win.name)?.klub);
      r[o.ob] = { o, win, los, winShare: aWin ? sa : 1 - sa, losShare: aWin ? 1 - sa : sa, kolo: 2, klub: k, z: !!info(win.name)?.z };
    }
    return r;
  }, [api, kl]);

  const vol = useMemo(() => (api ? Object.keys(api.se2).map(Number) : []), [api]);
  const colorOf = (o: number) => {
    const v = vys[o];
    if (!vol.includes(o)) return DOT;
    if (!v || (kolo === 1 && v.kolo === 2)) return '#b9b5a6'; // 1. kolo: postup do 2. kola
    return v.klub?.barva ?? '#9a9a92';
  };

  const geo = useMemo(() => {
    if (!data || !width) return null;
    const outline: Feature = { type: 'Feature', properties: {}, geometry: data.outline };
    const proj = geoMercator().fitExtent([[4, 4], [width - 4, height - 4]], outline);
    const path = geoPath(proj);
    const a = proj([15, 49.8])!; const b = proj([15, 49.86])!;
    const r = Math.max(1.4, Math.abs(a[1] - b[1]) * 0.87 * 0.3);
    const dots = data.dots.map(([lon, lat, o]) => { const p = proj([lon, lat])!; return { x: p[0], y: p[1], o }; });
    const feats = data.obvody.features.filter((f) => vol.includes(f.properties.o));
    const praha = data.obvody.features.filter((f) => f.properties.n.startsWith('Praha'));
    const iw = narrow ? Math.round(width * 0.7) : Math.round(width * 0.42);
    const ih = Math.round(iw * 0.6);
    const ix = Math.round((width - iw) / 2); const iy = height + 10;
    const iproj = geoMercator().fitExtent([[ix + 6, iy + 18], [ix + iw - 6, iy + ih - 6]], { type: 'FeatureCollection', features: praha } as FeatureCollection);
    return { path, ipath: geoPath(iproj), dots, r, feats, praha, inset: { x: ix, y: iy, w: iw, h: ih } };
  }, [data, width, height, narrow, vol]);

  const local = (e: React.PointerEvent) => {
    const box = wrapRef.current?.getBoundingClientRect();
    return box ? { x: e.clientX - box.left, y: e.clientY - box.top } : { x: 0, y: 0 };
  };
  const nazev = (o: number) => data?.obvody.features.find((f) => f.properties.o === o)?.properties.n ?? '';
  const navrh = (o: number, c: Cand) => hezky(kl?.kandidati[String(o)]?.[c.name]?.navrh ?? c.party);

  // legenda: kluby, které v mapě skutečně jsou (v daném kole)
  const legenda = useMemo(() => {
    if (!kl) return [];
    return kl.kluby.map((k) => ({ k, n: Object.values(vys).filter((v) => v && v.klub?.id === k.id && (kolo === 2 || v.kolo === 1)).length })).filter((x) => x.n > 0);
  }, [kl, vys, kolo]);

  const hv = hover ? vys[hover.o] : null;
  const btn = (on: boolean): React.CSSProperties => ({
    fontFamily: FONT, fontSize: 14, padding: '6px 14px', cursor: 'pointer', border: `1px solid ${INK}`,
    background: on ? INK : '#fff', color: on ? '#fff' : INK,
  });

  return (
    <div style={{ clear: 'both' }}>
      <ChartCard
        title="Kdo vyhrál v 27 senátních obvodech"
        subtitle="Barva obvodu = předpokládaný senátorský klub vítěze. Najeďte nebo ťukněte na obvod."
        source="ČSÚ – výsledky voleb do Senátu 2026 a senátní obvody; predikce Kateřina Mahdalová & Michal Škop"
      >
        <div style={{ fontFamily: FONT, color: INK }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div role="group" aria-label="Kolo voleb" style={{ display: 'inline-flex' }}>
              <button type="button" onClick={() => setKolo(1)} aria-pressed={kolo === 1} style={{ ...btn(kolo === 1), borderRadius: '8px 0 0 8px' }}>1. kolo</button>
              <button type="button" onClick={() => setKolo(2)} aria-pressed={kolo === 2} style={{ ...btn(kolo === 2), borderRadius: '0 8px 8px 0', borderLeft: 0 }}>2. kolo</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', fontSize: 14 }}>
              {legenda.map(({ k, n }) => (
                <span key={k.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 11, height: 11, borderRadius: 6, background: k.barva }} />{k.kratce} <b>{n}</b>
                </span>
              ))}
              {kolo === 1 && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 11, height: 11, borderRadius: 6, background: '#b9b5a6' }} />postup do 2. kola <b>{vol.length - legenda.reduce((s, x) => s + x.n, 0)}</b>
                </span>
              )}
            </div>
          </div>

          <div ref={wrapRef} style={{ position: 'relative', width: '100%' }} onMouseLeave={() => setHover(null)}>
            {!geo && <div style={{ height: Math.max(height, 240), display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED }}>Načítám mapu…</div>}
            {geo && (
              <svg width={width} height={geo.inset.y + geo.inset.h + 2} role="img" aria-label="Mapa senátních obvodů: vítězové voleb 2026" style={{ display: 'block', touchAction: 'manipulation' }}>
                {geo.feats.map((f) => {
                  const o = f.properties.o;
                  return (
                    <path key={o} d={geo.path(f) ?? ''} fill={colorOf(o)} fillOpacity={hover?.o === o ? 0.28 : 0.1} stroke="none"
                      style={{ cursor: 'pointer', transition: 'fill-opacity .15s, fill .4s' }}
                      onPointerMove={(e) => setHover({ o, ...local(e) })} onPointerLeave={() => setHover(null)}
                      onClick={(e) => setHover({ o, ...local(e as unknown as React.PointerEvent) })} />
                  );
                })}
                <g pointerEvents="none">
                  {geo.dots.map((d, i) => {
                    const on = vol.includes(d.o);
                    return <circle key={i} cx={d.x} cy={d.y} r={on ? geo.r * (hover?.o === d.o ? 1.35 : 1.12) : geo.r} fill={colorOf(d.o)} style={{ transition: 'fill .4s' }} />;
                  })}
                </g>
                <g>
                  <rect x={geo.inset.x} y={geo.inset.y} width={geo.inset.w} height={geo.inset.h} rx={6} fill="#fff" stroke="#e0ddd2" />
                  <text x={geo.inset.x + 8} y={geo.inset.y + 14} fontSize={12} fontWeight={700} fill={MUTED} style={{ fontFamily: FONT }}>Praha</text>
                  {geo.praha.map((f) => {
                    const o = f.properties.o; const on = vol.includes(o);
                    return (
                      <path key={o} d={geo.ipath(f) ?? ''} fill={on ? colorOf(o) : '#ebe8de'} stroke="#fff" strokeWidth={hover?.o === o ? 2.5 : 1}
                        style={{ cursor: on ? 'pointer' : 'default', transition: 'fill .4s' }}
                        onPointerMove={on ? (e) => setHover({ o, ...local(e) }) : () => setHover(null)}
                        onClick={on ? (e) => setHover({ o, ...local(e as unknown as React.PointerEvent) }) : undefined} />
                    );
                  })}
                </g>
              </svg>
            )}
            {hover && (
              <div style={{
                position: 'absolute', pointerEvents: 'none', zIndex: 2, top: Math.max(0, hover.y - 80),
                left: hover.x > width - 280 ? undefined : hover.x + 14, right: hover.x > width - 280 ? width - hover.x + 14 : undefined,
                background: '#fff', border: '1px solid #e6e3d9', borderRadius: 6, padding: '8px 11px', fontSize: 13.5, lineHeight: 1.45,
                boxShadow: '0 4px 14px rgba(16,20,50,.12)', maxWidth: 280,
              }}>
                <div style={{ fontWeight: 700, fontSize: 14.5, borderBottom: `3px solid ${colorOf(hover.o)}`, paddingBottom: 3, marginBottom: 4 }}>
                  {nazev(hover.o)} <span style={{ color: MUTED, fontWeight: 400 }}>(obv. {hover.o})</span>
                </div>
                {!hv && <div style={{ color: MUTED }}>Zatím nerozhodnuto.</div>}
                {hv && hv.kolo === 1 && (
                  <div><strong>{hv.win.name}</strong> ({navrh(hover.o, hv.win)}) zvolen{hv.z ? 'a' : ''} už v 1. kole s {pct(hv.winShare)}.</div>
                )}
                {hv && hv.kolo === 2 && kolo === 1 && hv.o.a && hv.o.b && (
                  <div>Do 2. kola postoupili <strong>{hv.o.a.name}</strong> ({navrh(hover.o, hv.o.a)}, {pct(hv.o.a.r1 ?? 0)}) a <strong>{hv.o.b.name}</strong> ({navrh(hover.o, hv.o.b)}, {pct(hv.o.b.r1 ?? 0)}).</div>
                )}
                {hv && hv.kolo === 2 && kolo === 2 && (
                  <>
                    <div>Vyhrál{hv.z ? 'a' : ''} <strong>{hv.win.name}</strong> ({navrh(hover.o, hv.win)}) s {pct(hv.winShare)}.</div>
                    {hv.los && <div style={{ color: MUTED }}>Proti: {hv.los.name} ({navrh(hover.o, hv.los)}), {pct(hv.losShare ?? 0)}.</div>}
                  </>
                )}
                {hv?.klub && (kolo === 2 || hv.kolo === 1) && <div style={{ color: MUTED, fontSize: 12.5, marginTop: 3 }}>Předpokládaný klub: {hv.klub.nazev}</div>}
              </div>
            )}
          </div>
        </div>
      </ChartCard>
    </div>
  );
}
