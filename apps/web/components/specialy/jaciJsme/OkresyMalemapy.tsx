'use client';

// Malé mapy okresů vedle sebe (small multiples): pro každý ukazatel dvojice map 1991 | 2021 se
// společnou barevnou škálou (sekvenční karmínová brand škála z ThemeProvideru), aby bylo vidět,
// jestli se rozdíly mezi okresy za 30 let zmenšily, nebo zvětšily. Najetí/ťuknutí na okres ho
// zvýrazní ve všech mapách a ukáže popisek s oběma hodnotami (DESIGN.md §10 tooltip).
// Geometrie: dnešních 77 okresů (RÚIAN, S-JTSK), zjednodušený GeoJSON ve složce článku
// (`okresy-geo.json`, cesta v datech `geo`), načtený fetchem jako u ObceHodnotaMap.
// Data = JSON ve složce článku (`dataFile`), scope.jaciJsmeData (lib/articleData.ts).
// Formát: typ OkresyData níže; vzor: …-1989-a-dnes/_data_pipeline/07_okresy.py.

import { useEffect, useMemo, useRef, useState } from 'react';
import { geoIdentity, geoPath } from 'd3-geo';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import ChartCard from '@/components/charts/ChartCard';
import { ChybiData, EDGE, FONT, GRID, INK, MUTED, num, sJednotkou, srOnly, typo } from './spolecne';

export type OkresyUkazatel = {
  id: string;
  nazev: string;
  popis?: string;
  zjisteni?: string;          // věta pod názvem (generuje skript z čísel)
  proc?: string;              // proč je ukazatel srovnatelný / výhrada
  jednotka: string;
  desetinna?: number;
  cr: [number, number];       // hodnota za celé Česko v obou letech
  skala: { hranice: number[]; barvy: string[] }; // barvy.length = hranice.length + 1
  hodnoty: Record<string, [number | null, number | null]>; // kód okresu (LAU1) → [1991, 2021]
};

export type OkresyData = {
  title?: string;
  subtitle?: string;
  zdroj?: string;
  poznamka?: string;
  geo: string;                // URL GeoJSONu okresů (id = LAU1 kód)
  roky: [string, string];
  okresy: Record<string, string>;      // kód → název
  pozn_okres?: Record<string, string>; // kód → poznámka do popisku (např. Jeseník 1991)
  ukazatele: OkresyUkazatel[];
};

export interface OkresyMalemapyProps {
  data?: OkresyData;
  dataFile?: string;
  title?: string;
  subtitle?: string;
  source?: string;
}

type Hover = { kod: string; u: number; r: number; x: number; y: number };

function svetla(hex: string) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 165;
}

function barva(u: OkresyUkazatel, v: number | null | undefined) {
  if (v === null || v === undefined) return '#f8f6f0';
  const i = u.skala.hranice.findIndex((h) => v < h);
  return u.skala.barvy[i === -1 ? u.skala.barvy.length - 1 : i];
}

const RATIO = 0.62; // poměr výšky a šířky Česka v S-JTSK

export default function OkresyMalemapy({ data, dataFile, title, subtitle, source }: OkresyMalemapyProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [geo, setGeo] = useState<FeatureCollection<Geometry> | null>(null);
  const [hover, setHover] = useState<Hover | null>(null);

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width)));
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!data?.geo) return;
    let alive = true;
    fetch(data.geo).then((r) => r.json()).then((g) => { if (alive) setGeo(g as FeatureCollection<Geometry>); });
    return () => { alive = false; };
  }, [data?.geo]);

  // ťuknutí mimo mapy zavře popisek (dotyková zařízení nemají mouseleave)
  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setHover(null);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  const uzky = width > 0 && width < 520;
  const GAP = 16;
  const mapW = uzky ? width : Math.floor((width - GAP) / 2);
  const mapH = Math.round(mapW * RATIO);

  // cesty okresů spočítané jednou pro danou šířku, sdílené všemi mapami
  const cesty = useMemo(() => {
    if (!geo || mapW <= 0) return [] as { kod: string; d: string }[];
    const proj = geoIdentity().reflectY(true).fitSize([mapW, mapH], geo);
    const path = geoPath(proj);
    return geo.features.map((f: Feature<Geometry>) => ({ kod: String(f.id), d: path(f) ?? '' }));
  }, [geo, mapW, mapH]);

  if (!data) return <ChybiData co="OkresyMalemapy" dataFile={dataFile} />;

  const [rok1, rok2] = data.roky;
  const hoverD = hover ? cesty.find((c) => c.kod === hover.kod)?.d : undefined;

  const pozice = (e: React.MouseEvent, el: HTMLElement | null) => {
    const box = el?.getBoundingClientRect();
    return box ? { x: e.clientX - box.left, y: e.clientY - box.top } : { x: 0, y: 0 };
  };

  const legenda = (u: OkresyUkazatel) => {
    const d = u.desetinna ?? 1;
    const h = u.skala.hranice;
    const f = (v: number) => num(v, Number.isInteger(v) ? 0 : d);
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 10px', fontSize: 13, color: INK, marginTop: 6 }}>
        {u.skala.barvy.map((b, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
            <span style={{ width: 13, height: 13, borderRadius: 2, background: b, border: svetla(b) ? `1px solid ${GRID}` : 'none', boxSizing: 'border-box' }} />
            {i === 0 ? `pod ${f(h[0])}` : i === h.length ? `${f(h[i - 1])} a víc` : `${f(h[i - 1])}–${f(h[i])}`}
          </span>
        ))}
        <span style={{ color: MUTED }}>({u.jednotka})</span>
      </div>
    );
  };

  return (
    <ChartCard title={title ?? data.title} subtitle={subtitle ?? data.subtitle} source={source ?? data.zdroj}>
      <div ref={wrapRef} style={{ fontFamily: FONT, color: INK }} onMouseLeave={() => setHover(null)}>
        {width === 0 && <div style={{ height: 240 }} />}
        {width > 0 && data.ukazatele.map((u, ui) => {
          const d = u.desetinna ?? 1;
          return (
            <section key={u.id} style={{ marginBottom: ui < data.ukazatele.length - 1 ? 26 : 4 }} aria-label={u.nazev}>
              <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.25 }}>{u.nazev}</div>
              {u.popis && <div style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.3 }}>{typo(u.popis)}</div>}
              {u.zjisteni && <div style={{ fontSize: 15, lineHeight: 1.35, marginTop: 4 }}>{typo(u.zjisteni)}</div>}
              <div style={{ display: 'flex', flexDirection: uzky ? 'column' : 'row', gap: uzky ? 10 : GAP, marginTop: 8 }}>
                {[0, 1].map((ri) => {
                  const aktivni = hover && hover.u === ui && hover.r === ri;
                  return (
                    <div key={ri} style={{ position: 'relative', width: mapW }} data-mapa={`${u.id}-${ri}`}>
                      <div style={{ fontSize: 14, marginBottom: 2 }}>
                        <strong>{ri === 0 ? rok1 : rok2}</strong>
                        <span style={{ color: MUTED }}> · Česko {sJednotkou(u.cr[ri], d, u.jednotka)}</span>
                      </div>
                      {cesty.length === 0 ? (
                        <div style={{ height: mapH, display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED, fontSize: 13 }}>Načítám mapu okresů…</div>
                      ) : (
                        <svg width={mapW} height={mapH} role="img" style={{ display: 'block' }}
                          aria-label={`${u.nazev} podle okresů, ${ri === 0 ? rok1 : rok2}; Česko ${sJednotkou(u.cr[ri], d, u.jednotka)}`}>
                          {cesty.map(({ kod, d: p }) => {
                            const b = barva(u, u.hodnoty[kod]?.[ri]);
                            return (
                              <path key={kod} d={p} fill={b} stroke={svetla(b) ? EDGE : '#fff'} strokeWidth={0.6}
                                onMouseMove={(e) => setHover({ kod, u: ui, r: ri, ...pozice(e, (e.currentTarget.ownerSVGElement?.parentElement) ?? null) })}
                                onClick={(e) => setHover({ kod, u: ui, r: ri, ...pozice(e, (e.currentTarget.ownerSVGElement?.parentElement) ?? null) })} />
                            );
                          })}
                          {hoverD && <path d={hoverD} fill="none" stroke={INK} strokeWidth={1.8} pointerEvents="none" />}
                        </svg>
                      )}
                      {aktivni && hover && (() => {
                        const v = u.hodnoty[hover.kod] ?? [null, null];
                        const b = barva(u, v[ri]);
                        const zmena = v[0] !== null && v[1] !== null ? v[1] - v[0] : null;
                        // vpravo od kurzoru, když se nevejde, tak vlevo; nikdy přes okraj mapy
                        const TW = Math.min(200, mapW);
                        let left = hover.x + 12;
                        if (left + TW > mapW) left = hover.x - 12 - TW;
                        left = Math.max(0, Math.min(left, mapW - TW));
                        return (
                          <div style={{
                            position: 'absolute', pointerEvents: 'none', zIndex: 2,
                            top: Math.max(18, Math.min(hover.y + 12, mapH - 40)), left, width: TW, boxSizing: 'border-box',
                            background: 'rgba(248,246,240,0.97)', border: `1px solid ${EDGE}`, borderRadius: 7,
                            boxShadow: '0 4px 10px rgba(16,20,50,0.14)', overflow: 'hidden', fontSize: 13, lineHeight: 1.4, color: INK,
                          }}>
                            <div style={{ background: b, color: svetla(b) ? INK : '#fff', fontWeight: 700, fontSize: 13.5, padding: '5px 12px' }}>
                              {data.okresy[hover.kod] ?? hover.kod}
                            </div>
                            <div style={{ padding: '6px 12px 8px' }}>
                              <div style={{ color: MUTED }}>{u.nazev}</div>
                              <div>{rok1}: <strong>{v[0] === null ? '–' : sJednotkou(v[0], d, u.jednotka)}</strong></div>
                              <div>{rok2}: <strong>{v[1] === null ? '–' : sJednotkou(v[1], d, u.jednotka)}</strong></div>
                              {zmena !== null && (
                                <div style={{ color: MUTED }}>změna {zmena >= 0 ? '+' : ''}{sJednotkou(zmena, d, u.jednotka === '%' ? 'p. b.' : u.jednotka)}</div>
                              )}
                              {data.pozn_okres?.[hover.kod] && <div style={{ color: MUTED, fontSize: 12.5 }}>{typo(data.pozn_okres[hover.kod])}</div>}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
              {legenda(u)}
              {u.proc && <div style={{ fontSize: 12.5, color: MUTED, marginTop: 4, lineHeight: 1.35 }}>{typo(u.proc)}</div>}
              {/* čtečky: hodnoty všech okresů v tabulce */}
              <div style={srOnly}><table>
                <caption>{u.nazev} podle okresů, {rok1} a {rok2}</caption>
                <thead><tr><th>Okres</th><th>{rok1}</th><th>{rok2}</th></tr></thead>
                <tbody>
                  {Object.entries(u.hodnoty).map(([kod, v]) => (
                    <tr key={kod}><td>{data.okresy[kod]}</td><td>{v[0] === null ? '–' : num(v[0], d)}</td><td>{v[1] === null ? '–' : num(v[1], d)}</td></tr>
                  ))}
                </tbody>
              </table></div>
            </section>
          );
        })}
        {data.poznamka && <div style={{ fontSize: 12.5, color: MUTED, marginTop: 10, lineHeight: 1.35 }}>{typo(data.poznamka)}</div>}
      </div>
    </ChartCard>
  );
}
