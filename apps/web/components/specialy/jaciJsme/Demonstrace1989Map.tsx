'use client';

// Animovaná bublinová mapa demonstrací 9. 11. – 26. 12. 1989 (speciál „Jací jsme byli, jací jsme“,
// kapitola Svoboda). Den po dni: bublina = akce s číslem (plocha ∝ počet účastníků, sqrt škála),
// modrý bod = obec zmíněná bez čísla, dřívější akce zůstávají jako bledá stopa (v každé obci
// největší dosavadní akce). Přehrát/Pauza + posuvník data, velké datum nahoře, tooltip podle
// DESIGN.md §10 (pruh s názvem obce v barvě značky, ink řádky; nad kurzor, jinak pod něj).
// prefers-reduced-motion: žádné automatické přehrání ani animace, mapa ukáže poslední den se
// všemi stopami. Geometrie krajů (S-JTSK) i souřadnice obcí jsou přímo v datech.
// Data = JSON ve složce článku (`dataFile`), scope.jaciJsmeData (lib/articleData.ts);
// generuje analyza-2026-11-17-jaci-jsme-svoboda/_data_pipeline/demonstrace.py.

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { geoIdentity, geoPath } from 'd3-geo';
import type { FeatureCollection, MultiLineString, MultiPolygon } from 'geojson';
import ChartCard from '@/components/charts/ChartCard';
import { renderSource } from '@/components/charts/chartText';
import { ChybiData, DNES, EDGE, FONT, FONT_PLEX, GRID, INK, MUTED, TEHDY, num, srOnly, tlacitko } from './spolecne';

const ZEME = '#e9e9dd';
const OBRYS = '#bcbcb0';
const STROKE = '#a81134'; // brand.8

type Odhad = { kdo: string; min: number | null; max: number | null; text: string; zdroj: string };
type Akce = {
  d: number; o: string; min: number | null; max: number | null; v: number | null;
  text: string; kdo: string; typ: string; zdroj: string; jine?: Odhad[];
};
export type Demonstrace1989Data = {
  title?: string;
  subtitle?: string;
  zdroj?: string;
  poznamka?: string;
  dny: string[];
  kdo: Record<string, string>;
  obce: Record<string, { n: string; x: number; y: number; kraj?: string }>;
  akce: Akce[];
  kraje: FeatureCollection<MultiPolygon>;
  obrys: MultiLineString;
};

export interface Demonstrace1989MapProps {
  data?: Demonstrace1989Data;
  dataFile?: string;
  title?: string;
  subtitle?: string;
  source?: string;
}

const MESICE = ['ledna', 'února', 'března', 'dubna', 'května', 'června', 'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'];
const DNY_TYDNE = ['neděle', 'pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota'];
const NBSP = ' ';

function rozloz(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return { y, m, d, wd: new Date(y, m - 1, d).getDay() };
}
const datumDlouhe = (iso: string) => { const { y, m, d } = rozloz(iso); return `${d}.${NBSP}${MESICE[m - 1]} ${y}`; };
const datumKratke = (iso: string) => { const { m, d } = rozloz(iso); return `${d}.${NBSP}${m}.`; };
const obci = (n: number) => (n === 1 ? 'obec' : n >= 2 && n <= 4 ? 'obce' : 'obcí');
const akci = (n: number) => (n === 1 ? 'akce' : n >= 2 && n <= 4 ? 'akce' : 'akcí');

function pocet(a: { min: number | null; max: number | null }) {
  if (a.min !== null && a.max !== null) return a.min === a.max ? num(a.min) : `${num(a.min)}–${num(a.max)}`;
  const v = a.max ?? a.min;
  return v === null ? null : num(v);
}

function useReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setR(mq.matches);
    const f = (e: MediaQueryListEvent) => setR(e.matches);
    mq.addEventListener('change', f);
    return () => mq.removeEventListener('change', f);
  }, []);
  return r;
}

// dny, na kterých animace chvíli postojí (17. 11. a největší akce v datech)
const DRZET = new Set(['1989-11-17']);
const KROK_MS = 650;
const DRZET_MS = 1800;

type Hover = { kind: 'dnes' | 'stopa'; o: string; x: number; y: number };

export default function Demonstrace1989Map({ data, dataFile, title, subtitle, source }: Demonstrace1989MapProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const reduced = useReducedMotion();
  const posledni = (data?.dny.length ?? 1) - 1;
  const [den, setDen] = useState(0);
  const [hraje, setHraje] = useState(false);
  const [sahnuto, setSahnuto] = useState(false); // čtenář už ovládal → žádné automatické přehrání
  const [hover, setHover] = useState<Hover | null>(null);
  const [tipH, setTipH] = useState(0);

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width)));
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // omezený pohyb: statický stav = poslední den se všemi stopami
  useEffect(() => {
    if (reduced && !sahnuto) { setDen(posledni); setHraje(false); }
  }, [reduced, sahnuto, posledni]);

  // automatické přehrání jednou, když je mapa poprvé z větší části vidět (ne při omezeném pohybu)
  useEffect(() => {
    if (reduced || sahnuto || !mapRef.current) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setSahnuto(true); setDen(0); setHraje(true); io.disconnect(); }
    }, { threshold: 0.5 });
    io.observe(mapRef.current);
    return () => io.disconnect();
  }, [reduced, sahnuto]);

  // krokování animace
  useEffect(() => {
    if (!hraje || !data) return;
    if (den >= posledni) { setHraje(false); return; }
    const t = window.setTimeout(() => setDen((d) => Math.min(d + 1, posledni)), DRZET.has(data.dny[den]) || den === nejDen ? DRZET_MS : KROK_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hraje, den, posledni, data]);

  // ťuknutí mimo mapu zavře popisek
  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (mapRef.current && !mapRef.current.contains(e.target as Node)) setHover(null);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  // na mobilu mapa přes celou šíři karty (přes její 16px vnitřní okraj), ovládání zůstává pod ní
  const BLEED = width > 0 && width < 560 ? 16 : 0;
  const mapW = width + 2 * BLEED;
  const mapH = Math.round(mapW * 0.6);

  const proj = useMemo(() => {
    if (!data || mapW <= 0) return null;
    const pad = Math.max(6, mapW * 0.02);
    return geoIdentity().reflectY(true).fitExtent([[pad, pad], [mapW - pad, mapH - pad]], data.kraje);
  }, [data, mapW, mapH]);
  const path = useMemo(() => (proj ? geoPath(proj) : null), [proj]);
  const krajeD = useMemo(() => (path && data ? data.kraje.features.map((f) => path(f) ?? '') : []), [path, data]);
  const obrysD = useMemo(() => (path && data ? path(data.obrys) ?? '' : ''), [path, data]);
  const xy = useMemo(() => {
    const m: Record<string, [number, number]> = {};
    if (!proj || !data) return m;
    for (const [k, o] of Object.entries(data.obce)) {
      const p = proj([o.x, o.y]);
      if (p) m[k] = [p[0], p[1]];
    }
    return m;
  }, [proj, data]);

  const vMax = useMemo(() => (data ? Math.max(...data.akce.map((a) => a.v ?? 0)) : 1), [data]);
  const nejDen = useMemo(() => {
    if (!data) return -1;
    let best: Akce | null = null;
    for (const a of data.akce) if (a.v !== null && (!best || a.v > (best.v ?? 0))) best = a;
    return best ? best.d : -1;
  }, [data]);
  const rMax = Math.max(18, mapW * 0.075);
  const R_MIN = 2.5;
  const R_BOD = mapW < 560 ? 3 : 3.6;
  const polomer = useCallback((v: number) => Math.max(R_MIN, rMax * Math.sqrt(v / vMax)), [rMax, vMax]);

  // stav pro zvolený den
  const stav = useMemo(() => {
    if (!data) return null;
    const dnes = data.akce.filter((a) => a.d === den).sort((a, b) => (b.v ?? -1) - (a.v ?? -1));
    const stopy: Record<string, { nej: Akce | null; pocet: number; od: number }> = {};
    for (const a of data.akce) {
      if (a.d >= den) continue;
      const s = stopy[a.o] ?? (stopy[a.o] = { nej: null, pocet: 0, od: a.d });
      s.pocet += 1;
      s.od = Math.min(s.od, a.d);
      if (a.v !== null && (!s.nej || a.v > (s.nej.v ?? 0))) s.nej = a;
    }
    const celkem = new Set(data.akce.filter((a) => a.d <= den).map((a) => a.o)).size;
    return { dnes, stopy, celkem, sCislem: dnes.filter((a) => a.v !== null).length };
  }, [data, den]);

  useLayoutEffect(() => {
    setTipH(tipRef.current ? tipRef.current.offsetHeight : 0);
  }, [hover, den]);

  if (!data) return <ChybiData co="Demonstrace1989Map" dataFile={dataFile} />;

  const iso = data.dny[den];
  const { wd } = rozloz(iso);
  const uzky = width > 0 && width < 560;

  const pozice = (e: React.MouseEvent) => {
    const box = mapRef.current?.getBoundingClientRect();
    return box ? { x: e.clientX - box.left, y: e.clientY - box.top } : { x: 0, y: 0 };
  };
  const najet = (kind: Hover['kind'], o: string) => (e: React.MouseEvent) => { e.stopPropagation(); setHover({ kind, o, ...pozice(e) }); };

  const ovladat = (d: number) => { setSahnuto(true); setHraje(false); setDen(d); };
  const prehrat = () => {
    setSahnuto(true);
    if (hraje) { setHraje(false); return; }
    if (den >= posledni) setDen(0);
    setHraje(true);
  };

  // popisky u největších dnešních akcí (klíčové hodnoty čitelné bez najetí)
  const popisky: { x: number; y: number; t: string; anchor: 'start' | 'end' }[] = [];
  if (stav) {
    const boxy: [number, number, number, number][] = [];
    for (const a of stav.dnes.filter((a) => a.v !== null).slice(0, uzky ? 2 : 4)) {
      const p = xy[a.o];
      if (!p) continue;
      const r = polomer(a.v as number);
      const t = `${data.obce[a.o].n} ${pocet(a)}`;
      const w = t.length * (uzky ? 6.6 : 7.4);
      const vpravo = p[0] + r + 4 + w < mapW;
      const x = vpravo ? p[0] + r + 4 : p[0] - r - 4;
      const box: [number, number, number, number] = vpravo ? [x, p[1] - 9, x + w, p[1] + 7] : [x - w, p[1] - 9, x, p[1] + 7];
      if (boxy.some((b) => !(box[2] < b[0] || box[0] > b[2] || box[3] < b[1] || box[1] > b[3]))) continue;
      boxy.push(box);
      popisky.push({ x, y: p[1] + 4, t, anchor: vpravo ? 'start' : 'end' });
    }
  }

  // obsah popisku
  const radekAkce = (a: Akce, nadpisDatum: boolean) => {
    const p = pocet(a);
    return (
      <>
        {nadpisDatum && <div style={{ color: MUTED }}>{datumDlouhe(data.dny[a.d])} · {a.typ}</div>}
        <div>Účastníků: <strong>{p ?? 'počet pramen neuvádí'}</strong></div>
        {a.text && a.text !== 'bez počtu' && <div style={{ color: MUTED, fontSize: 12.5 }}>v prameni: „{a.text}“</div>}
        <div>podle odhadu: {data.kdo[a.kdo] ?? a.kdo}</div>
        {(a.jine ?? []).map((j, i) => (
          <div key={i} style={{ fontSize: 12.5 }}>jiný odhad: <strong>{pocet(j)}</strong> ({data.kdo[j.kdo] ?? j.kdo})</div>
        ))}
        <div style={{ color: MUTED, fontSize: 12 }}>zdroj: {a.zdroj}</div>
      </>
    );
  };

  let tip: { barva: string; svetla: boolean; nazev: string; telo: React.ReactNode } | null = null;
  if (hover && stav) {
    const o = data.obce[hover.o];
    if (hover.kind === 'dnes') {
      const a = stav.dnes.find((x) => x.o === hover.o);
      if (a) tip = {
        barva: a.v !== null ? DNES : TEHDY, svetla: false, nazev: o.n,
        telo: <>{radekAkce(a, true)}</>,
      };
    } else {
      const s = stav.stopy[hover.o];
      if (s) {
        const posledniBezCisla = data.akce.filter((a) => a.o === hover.o && a.d < den).slice(-1)[0];
        const a = s.nej ?? posledniBezCisla;
        tip = {
          barva: GRID, svetla: true, nazev: o.n,
          telo: (
            <>
              <div style={{ color: MUTED }}>
                dřívější {akci(s.pocet)} v datech: {s.pocet} (od {datumKratke(data.dny[s.od])})
              </div>
              <div style={{ fontWeight: 700, marginTop: 2 }}>{s.nej ? 'největší' : 'poslední'}: {datumDlouhe(data.dny[a.d])}, {a.typ}</div>
              {radekAkce(a, false)}
            </>
          ),
        };
      }
    }
  }

  const tipW = Math.min(280, mapW - 8);
  let tipTop = 0, tipLeft = 0;
  if (hover) {
    tipTop = hover.y - tipH - 14;
    if (tipTop < 0) tipTop = hover.y + 18; // nad kurzor, když není místo, pod něj
    tipLeft = Math.max(0, Math.min(hover.x - tipW / 2, mapW - tipW));
  }

  const anim = !reduced;
  const legendaKruhy = [10000, 100000, 500000].filter((v) => v <= vMax);
  const lr = legendaKruhy.map((v) => polomer(v));
  const lH = Math.ceil(2 * (lr[lr.length - 1] ?? 10)) + 4;

  return (
    <ChartCard title={title ?? data.title} subtitle={subtitle ?? data.subtitle} source={source ?? data.zdroj}>
      <style>{`
        @keyframes dt-demo-pop { from { transform: scale(0); opacity: 0 } to { transform: scale(1); opacity: 1 } }
        .dt-demo-novy { transform-box: fill-box; transform-origin: center; animation: dt-demo-pop 380ms cubic-bezier(.2,.7,.2,1) both }
        .dt-demo-slider { width: 100%; accent-color: ${DNES}; height: 28px; margin: 0; cursor: pointer }
      `}</style>
      <div ref={wrapRef} style={{ fontFamily: FONT, color: INK }}>
        {/* velké datum + stav dne */}
        <div aria-live="polite" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0 14px', marginBottom: 4 }}>
          <div style={{ fontFamily: FONT_PLEX, fontWeight: 700, fontSize: uzky ? 26 : 34, lineHeight: 1.1, whiteSpace: 'nowrap' }}>
            {datumDlouhe(iso)}
          </div>
          <div style={{ color: MUTED, fontSize: 15 }}>{DNY_TYDNE[wd]}</div>
        </div>
        {stav && (
          <div style={{ fontSize: 14.5, lineHeight: 1.35, minHeight: 20 }}>
            {stav.dnes.length === 0
              ? <span style={{ color: MUTED }}>Tento den prameny žádnou akci neuvádějí.</span>
              : <>Tento den: <strong>{stav.dnes.length}{NBSP}{obci(stav.dnes.length)}</strong>{stav.sCislem < stav.dnes.length ? `, z toho s počtem účastníků ${stav.sCislem}` : ''}</>}
            <span style={{ color: MUTED }}> · od 9.{NBSP}listopadu celkem {stav.celkem}{NBSP}{obci(stav.celkem)}</span>
          </div>
        )}

        {/* mapa */}
        <div ref={mapRef} style={{ position: 'relative', width: mapW || '100%', margin: `6px ${-BLEED}px 0` }} onMouseLeave={() => setHover(null)}>
          {width === 0 || !path ? (
            <div style={{ height: Math.max(mapH, 200) }} />
          ) : (
            <svg width={mapW} height={mapH} role="img" style={{ display: 'block', overflow: 'visible' }}
              aria-label={`Mapa Česka, ${datumDlouhe(iso)}: ${stav?.dnes.length ?? 0} ${obci(stav?.dnes.length ?? 0)} s demonstrací v datech. Podrobnosti v tabulce pod mapou.`}>
              <g>
                {krajeD.map((d, i) => <path key={i} d={d} fill={ZEME} stroke="#fff" strokeWidth={1.2} />)}
                <path d={obrysD} fill="none" stroke={OBRYS} strokeWidth={0.9} />
              </g>
              {/* stopa: největší dosavadní akce v každé obci */}
              <g>
                {stav && Object.entries(stav.stopy).map(([o, s]) => {
                  const p = xy[o];
                  if (!p) return null;
                  const dnesTu = stav.dnes.some((a) => a.o === o);
                  if (s.nej) {
                    const r = polomer(s.nej.v as number);
                    return (
                      <circle key={o} cx={p[0]} cy={p[1]} r={r} fill={DNES} fillOpacity={dnesTu ? 0.06 : 0.1}
                        stroke={DNES} strokeOpacity={0.4} strokeWidth={0.8} strokeDasharray={dnesTu ? '2 2' : undefined}
                        style={{ cursor: 'pointer', transition: anim ? 'fill-opacity 400ms' : undefined }}
                        onMouseMove={najet('stopa', o)} onClick={najet('stopa', o)} />
                    );
                  }
                  if (dnesTu) return null;
                  return (
                    <circle key={o} cx={p[0]} cy={p[1]} r={R_BOD - 0.6} fill={TEHDY} fillOpacity={0.35}
                      style={{ cursor: 'pointer' }} onMouseMove={najet('stopa', o)} onClick={najet('stopa', o)} />
                  );
                })}
              </g>
              {/* akce zvoleného dne */}
              <g>
                {stav && stav.dnes.map((a) => {
                  const p = xy[a.o];
                  if (!p) return null;
                  const on = hover?.kind === 'dnes' && hover.o === a.o;
                  const r = a.v !== null ? polomer(a.v) : R_BOD;
                  return (
                    <g key={`${den}-${a.o}`} className={anim ? 'dt-demo-novy' : undefined}>
                      {a.v !== null ? (
                        <circle cx={p[0]} cy={p[1]} r={r} fill={DNES} fillOpacity={0.55} stroke={on ? INK : STROKE} strokeWidth={on ? 2 : 1} pointerEvents="none" />
                      ) : (
                        <circle cx={p[0]} cy={p[1]} r={r} fill={TEHDY} stroke={on ? INK : '#fff'} strokeWidth={on ? 2 : 1.2} pointerEvents="none" />
                      )}
                      {/* větší neviditelná plocha pro najetí a ťuknutí */}
                      <circle cx={p[0]} cy={p[1]} r={Math.max(r, 10)} fill="transparent" style={{ cursor: 'pointer' }}
                        onMouseMove={najet('dnes', a.o)} onClick={najet('dnes', a.o)} />
                    </g>
                  );
                })}
              </g>
              <g pointerEvents="none" style={{ fontFamily: FONT, fontSize: uzky ? 12 : 13.5, fontWeight: 700 }}>
                {popisky.map((l, i) => (
                  <text key={`${den}-${i}`} x={l.x} y={l.y} textAnchor={l.anchor} fill={INK}
                    stroke="rgba(248,246,240,0.9)" strokeWidth={3} paintOrder="stroke" strokeLinejoin="round">
                    {l.t}
                  </text>
                ))}
              </g>
            </svg>
          )}

          {hover && tip && (
            <div ref={tipRef} style={{
              position: 'absolute', pointerEvents: 'none', zIndex: 3, top: tipTop, left: tipLeft, width: tipW,
              background: 'rgba(248,246,240,0.97)', border: `1px solid ${EDGE}`, borderRadius: 7,
              boxShadow: '0 4px 10px rgba(16,20,50,0.14)', overflow: 'hidden', fontSize: 13, lineHeight: 1.4, color: INK,
            }}>
              <div style={{ background: tip.barva, color: tip.svetla ? INK : '#fff', fontWeight: 700, fontSize: 13.5, padding: '5px 12px' }}>
                {tip.nazev}
              </div>
              <div style={{ padding: '6px 12px 8px' }}>{tip.telo}</div>
            </div>
          )}
        </div>

        {/* ovládání pod mapou */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
          <button type="button" onClick={prehrat} aria-label={hraje ? 'Pozastavit animaci' : 'Přehrát animaci den po dni'}
            style={{ ...tlacitko(true), flex: '0 0 auto', minWidth: 112, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
              {hraje
                ? <><rect x="2" y="1" width="3.6" height="12" fill="#fff" /><rect x="8.4" y="1" width="3.6" height="12" fill="#fff" /></>
                : <path d="M2.5 1 L12.5 7 L2.5 13 Z" fill="#fff" />}
            </svg>
            {hraje ? 'Pauza' : 'Přehrát'}
          </button>
          <div style={{ flex: '1 1 auto', minWidth: 0 }}>
            <input type="range" className="dt-demo-slider" min={0} max={posledni} step={1} value={den}
              aria-label="Datum" aria-valuetext={datumDlouhe(iso)}
              onChange={(e) => ovladat(Number(e.target.value))} />
            <div style={{ position: 'relative', height: 16, fontSize: 12, color: MUTED }}>
              {[0, data.dny.indexOf('1989-11-17'), data.dny.indexOf('1989-12-01'), posledni].filter((i, k, arr) => i >= 0 && arr.indexOf(i) === k).map((i) => {
                const pct = (i / posledni) * 100;
                return (
                  <span key={i} style={{
                    position: 'absolute', left: `${pct}%`, whiteSpace: 'nowrap',
                    transform: i === 0 ? 'none' : i === posledni ? 'translateX(-100%)' : 'translateX(-50%)',
                  }}>{datumKratke(data.dny[i])}</span>
                );
              })}
            </div>
          </div>
        </div>

        {/* legenda */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '6px 20px', marginTop: 12, fontSize: 13.5 }}>
          <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 6 }}>
            <svg width={Math.ceil(2 * (lr[lr.length - 1] ?? 10)) + 2} height={lH} aria-hidden>
              {legendaKruhy.map((v, i) => (
                <circle key={v} cx={(lr[lr.length - 1] ?? 10) + 1} cy={lH - 1 - lr[i]} r={lr[i]} fill={DNES} fillOpacity={0.12} stroke={STROKE} strokeWidth={0.8} />
              ))}
            </svg>
            <span>účastníků: {legendaKruhy.map((v) => num(v)).join(' / ')}</span>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <svg width="12" height="12" aria-hidden><circle cx="6" cy="6" r="4.2" fill={TEHDY} stroke="#fff" strokeWidth="1.2" /></svg>
            akce bez čísla
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <svg width="16" height="16" aria-hidden><circle cx="8" cy="8" r="7" fill={DNES} fillOpacity={0.1} stroke={DNES} strokeOpacity={0.4} strokeWidth="0.8" /></svg>
            dřívější akce (největší v obci)
          </span>
        </div>

        {data.poznamka && (
          <div style={{ fontSize: 13, color: MUTED, marginTop: 10, lineHeight: 1.4 }}>{renderSource(data.poznamka)}</div>
        )}

        {/* čtečky: všechny akce v tabulce */}
        <div style={srOnly}><table>
          <caption>Demonstrace a shromáždění 9. listopadu – 26. prosince 1989 podle obcí</caption>
          <thead><tr><th>Datum</th><th>Obec</th><th>Účastníků</th><th>Podle odhadu</th><th>Zdroj</th></tr></thead>
          <tbody>
            {data.akce.map((a, i) => (
              <tr key={i}>
                <td>{datumDlouhe(data.dny[a.d])}</td><td>{data.obce[a.o]?.n}</td>
                <td>{pocet(a) ?? 'neuvedeno'}</td><td>{data.kdo[a.kdo] ?? a.kdo}</td><td>{a.zdroj}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
    </ChartCard>
  );
}
