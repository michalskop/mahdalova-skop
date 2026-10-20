'use client';

// Mapa síly stran v obcích: přepínač stran nahoře, každá strana zvlášť. Puntík = obec, kde strana
// kandidovala, plocha ∝ kolik voličů tam zastupují její zastupitelé (voliči obce / křesla × křesla strany),
// prázdný kroužek = kandidovala, křeslo nezískala. Podklad = jemné hranice obcí ze sdílené geometrie
// (ObceKandidatkyMap / ObceStranyMap: volební okrsky ČSÚ 2022 sloučené do obcí).
// Data: <článek>/mapa-stran.json z _data_pipeline/build.py + mapa.py (článek o podílu voličů po KV 2026).

import { useEffect, useMemo, useRef, useState } from 'react';
import { geoIdentity, geoPath } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { Feature, Geometry } from 'geojson';
import ChartCard from './ChartCard';

const INK = '#101432';      // brandNavy.9
const MUTED = '#4c4f8e';    // brandNavy.7
const LAND = '#e9e9dd';     // background.5
const GRID = '#eeeae2';     // background.4
const ACTIVE = '#d4d4c8';   // background.7 – aktivní strana (tmavá béžová, ne ink: ANO a Piráti jsou samy tmavé)
const FONT = 'var(--font-roboto-condensed), Arial, sans-serif';
// Světlé strany by na béžovém podkladu zanikly: puntík i kroužek dostanou obrys v tmavším odstínu
// téže škály (ThemeProvider.tsx). Ostatní strany mají bílý obrys.
const EDGE: Record<string, string> = {
  'KDU-ČSL': '#a47d03',          // brandYellow.9 k #ffcf02
  'místní a ostatní': '#6267a3', // brandNavy.6 k #c3c6d8
  nezávislí: '#4c4f8e',          // brandNavy.7 k #8a8fb0
};

// strana v obci: [křesla (u společných kandidátek zlomek podle preferenčních hlasů), zastoupení voliči]
type Rec = [number, number];
type Obec = { n: string; v: number; m: number; s: Record<string, Rec> };
type Souhrn = { obci: number; pokryti: number; tam: number; celkem: number };
type RawData = { strany: string[]; barvy: Record<string, string>; souhrn: Record<string, Souhrn>; obce: Record<string, Obec> };

// shoda přísudku: hnutí ANO (s.), STAN (m.), Piráti, Zelení, Motoristé a skupiny (mn. č.), ostatní strany (ž.)
const ROD: Record<string, string> = { ANO: 'o', STAN: '', Piráti: 'i', Zelení: 'i', Motoristé: 'i', nezávislí: 'i', 'místní a ostatní': 'i' };
const KDO: Record<string, string> = { nezávislí: 'Nezávislí', 'místní a ostatní': 'Místní hnutí a menší strany' };

const nf = (v: number) => Math.round(v).toLocaleString('cs-CZ');
const pct = (v: number) => `${v.toLocaleString('cs-CZ', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;
const kresla = (k: number) => (Number.isInteger(k) ? String(k) : k.toLocaleString('cs-CZ', { maximumFractionDigits: 1 }));

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

export interface ObceVoliciMapProps {
  geoUrl: string;
  dataUrl: string;
  title?: string;
  subtitle?: string;
  source?: string;
  initial?: string;
}

export default function ObceVoliciMap({ geoUrl, dataUrl, title, subtitle, source, initial = 'ANO' }: ObceVoliciMapProps) {
  const [wrapRef, width] = useWidth<HTMLDivElement>();
  const [topo, setTopo] = useState<Topology | null>(null);
  const [data, setData] = useState<RawData | null>(null);
  const [cur, setCur] = useState(initial);
  const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([fetch(geoUrl).then((r) => r.json()), fetch(dataUrl).then((r) => r.json())]).then(([g, d]) => {
      if (!alive) return;
      setTopo(g as Topology);
      setData(d as RawData);
    });
    return () => { alive = false; };
  }, [geoUrl, dataUrl]);

  const geo = useMemo(() => {
    if (!topo) return null;
    const obce = feature(topo, topo.objects.obce as GeometryCollection) as unknown as { features: Feature<Geometry, { id?: string }>[] };
    const kraje = mesh(topo, topo.objects.kraje as GeometryCollection, (a: unknown, b: unknown) => a !== b);
    const outline = mesh(topo, topo.objects.kraje as GeometryCollection, (a: unknown, b: unknown) => a === b);
    return { obce: obce.features, kraje, outline };
  }, [topo]);

  const height = Math.round(width * 0.58);
  const path = useMemo(() => {
    if (!geo || !width) return null;
    // S-JTSK East-North: rovinné souřadnice, stačí otočit osu y a vměstnat
    const proj = geoIdentity().reflectY(true).fitSize([width, height], { type: 'FeatureCollection', features: geo.obce });
    return geoPath(proj);
  }, [geo, width, height]);

  const shapes = useMemo(() => {
    if (!geo || !path) return [];
    return geo.obce.map((f) => ({ id: String(f.id ?? f.properties?.id), d: path(f) ?? '', c: path.centroid(f) }));
  }, [geo, path]);
  const centroid = useMemo(() => Object.fromEntries(shapes.map((s) => [s.id, s.c])), [shapes]);

  // plocha ∝ voliči, stejné měřítko pro všechny strany: 100 000 voličů ≈ poloměr 16 px při šířce 876 px
  const R100 = (16 * width) / 876;
  const rad = (v: number) => Math.max(1.3, Math.sqrt(v / 100000) * R100);

  const dots = useMemo(() => {
    if (!data) return [];
    const out: { id: string; k: number; v: number }[] = [];
    for (const [id, o] of Object.entries(data.obce)) {
      const r = o.s[cur];
      if (r) out.push({ id, k: r[0], v: r[1] });
    }
    return out.sort((a, b) => b.v - a.v); // velké dospod, malé navrch
  }, [data, cur]);

  // ťuknutí mimo mapu zavře popisek (na dotykových zařízeních nepřijde mouseleave)
  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setHover(null);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [wrapRef]);

  // popisek a obrys jen u obcí, kde vybraná strana kandidovala; jinde mapa jen podkreslí hranice
  const point = (id: string) => (e: React.MouseEvent) => {
    const box = wrapRef.current?.getBoundingClientRect();
    if (!data?.obce[id]?.s[cur]) { setHover(null); return; }
    if (box) setHover({ id, x: e.clientX - box.left, y: e.clientY - box.top });
  };

  const color = data?.barvy[cur] ?? INK;
  const edge = EDGE[cur];
  const s = data?.souhrn[cur];
  const r = ROD[cur] ?? 'a';
  const focus = hover && data ? data.obce[hover.id] : undefined;
  const focusRec = focus?.s[cur];

  const btn = (on: boolean): React.CSSProperties => ({
    fontFamily: FONT, fontSize: 14, padding: '4px 10px', borderRadius: 4, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 6,
    border: `1px solid ${on ? '#bcbcb0' : '#d4d4c8'}`,
    background: on ? ACTIVE : '#fff', color: INK, fontWeight: on ? 700 : 400,
  });

  return (
    <ChartCard title={title} subtitle={subtitle} source={source}>
      <div style={{ fontFamily: FONT, color: INK }}>
        {data && (
          <div role="group" aria-label="Strana" style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
            {data.strany.map((p) => (
              <button key={p} type="button" onClick={() => setCur(p)} aria-pressed={p === cur} style={btn(p === cur)}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: data.barvy[p], flex: '0 0 auto' }} />
                {p}
              </button>
            ))}
          </div>
        )}

        {s && (
          <div style={{ fontSize: 15, lineHeight: 1.4, marginBottom: 6 }}>
            <strong>{KDO[cur] ?? cur} kandidoval{r} v {nf(s.obci)} obcích</strong>, kde žije {pct(s.pokryti)} voličů.
            {' '}Tam {r === 'i' ? 'zastupují' : 'zastupuje'} {pct(s.tam)} voličů, v celém Česku {pct(s.celkem)}.
          </div>
        )}

        {/* legenda velikostí */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 14px', fontSize: 13.5, color: '#333', marginBottom: 6 }}>
          <span>Kolik voličů v obci zastupují:</span>
          {width > 0 && [1000, 10000, 100000].map((v) => {
            const rr = rad(v), d = Math.ceil(2 * rr + 2);
            return (
              <span key={v} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <svg width={d} height={d} aria-hidden><circle cx={d / 2} cy={d / 2} r={rr} fill={color} fillOpacity={0.85} stroke={edge ?? '#fff'} strokeWidth={edge ? 1 : 0.8} /></svg>
                {nf(v)}
              </span>
            );
          })}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <svg width="14" height="14" aria-hidden><circle cx="7" cy="7" r="4" fill="none" stroke={edge ?? color} strokeWidth="1.6" /></svg>
            kandidovali, ale bez křesla
          </span>
        </div>

        <div ref={wrapRef} style={{ position: 'relative', width: '100%' }} onMouseLeave={() => setHover(null)}>
          {!path && <div style={{ height: Math.max(height, 240), display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED }}>Načítám mapu obcí…</div>}
          {path && geo && data && (
            <svg width={width} height={height} role="img" aria-label={`Mapa obcí: kde kandidovala strana ${cur} a kolik voličů tam zastupuje`} style={{ display: 'block' }}>
              <g>
                {shapes.map(({ id, d }) => (
                  <path key={id} d={d} fill={LAND} stroke="#fff" strokeWidth={0.3} onMouseMove={point(id)} onClick={point(id)} />
                ))}
              </g>
              <path d={path(geo.kraje) ?? ''} fill="none" stroke="#fff" strokeWidth={1.4} pointerEvents="none" />
              <path d={path(geo.outline) ?? ''} fill="none" stroke="#bcbcb0" strokeWidth={0.8} pointerEvents="none" />
              <g>
                {dots.map(({ id, k, v }) => {
                  const c = centroid[id];
                  if (!c || Number.isNaN(c[0])) return null;
                  return k > 0
                    ? <circle key={id} cx={c[0]} cy={c[1]} r={rad(v)} fill={color} fillOpacity={0.85} stroke={edge ?? '#fff'} strokeWidth={edge ? 0.8 : rad(v) > 4 ? 0.9 : 0.4} onMouseMove={point(id)} onClick={point(id)} />
                    : <circle key={id} cx={c[0]} cy={c[1]} r={2} fill="none" stroke={edge ?? color} strokeWidth={1} strokeOpacity={0.9} onMouseMove={point(id)} onClick={point(id)} />;
                })}
              </g>
              {hover && (() => {
                const f = geo.obce.find((g) => String(g.id ?? g.properties?.id) === hover.id);
                return f ? <path d={path(f) ?? ''} fill="none" stroke={INK} strokeWidth={1.4} pointerEvents="none" /> : null;
              })()}
            </svg>
          )}

          {focus && hover && (
            <div
              style={{
                position: 'absolute', pointerEvents: 'none',
                top: Math.min(Math.max(0, hover.y - 60), Math.max(0, height - 120)),
                left: hover.x > width - 260 ? undefined : hover.x + 14,
                right: hover.x > width - 260 ? width - hover.x + 14 : undefined,
                background: '#fff', border: `1px solid ${GRID}`, borderRadius: 6, padding: '8px 10px',
                fontSize: 13, lineHeight: 1.5, boxShadow: '0 4px 14px rgba(16,20,50,.10)', maxWidth: 260, zIndex: 2,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14 }}>{focus.n}</div>
              <div style={{ color: MUTED }}>{nf(focus.v)} voličů · {focus.m} zastupitelů · 1 zastupitel = {nf(focus.v / focus.m)} voličů</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                <span style={{ width: 9, height: 9, borderRadius: 2, background: color, flex: '0 0 auto', transform: 'translateY(1px)' }} />
                <span>
                  <strong>{cur}</strong>{' '}
                  {focusRec && focusRec[0] > 0 ? <>– {kresla(focusRec[0])} z {focus.m} křesel, {r === 'i' ? 'zastupují' : 'zastupuje'} <strong>{nf(focusRec[1])}</strong> voličů</>
                    : 'kandidoval' + (r === 'i' ? 'i' : r) + ', křeslo nezískal' + (r === 'i' ? 'i' : r)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div style={{ fontSize: 12.5, color: MUTED, marginTop: 8 }}>
          Kde puntík chybí, strana nekandidovala. Zastoupení voliči = voliči obce dělení počtem zastupitelů, krát počet křesel strany; křesla společných kandidátek jsou rozdělená podle preferenčních hlasů kandidátů jednotlivých stran. Praha a statutární města jako celek, bez městských částí.
        </div>
      </div>
    </ChartCard>
  );
}
