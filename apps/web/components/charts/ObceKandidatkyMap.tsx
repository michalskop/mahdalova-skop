'use client';

// Mapa všech obcí Česka: kde o složení zastupitelstva rozhodla nabídka kandidátů,
// ne voliči. Přepínání komunálních voleb 1994–2026, tooltip s čísly obce.
// Geometrie = volební okrsky ČSÚ 2022 (S-JTSK) sloučené do obcí (mapshaper),
// data = registry kandidátů volby.gov.cz (viz článek). Kategorie:
//   0 soutěž · 1 jediná kandidátka s náhradníky · 2 jediná kandidátka, zvoleni všichni
//   3 víc kandidátek, ale zvoleni všichni · 4 nikdo nekandidoval

import { useEffect, useMemo, useRef, useState } from 'react';
import { geoIdentity, geoPath } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { Feature, Geometry } from 'geojson';
import ChartCard from './ChartCard';

// Barvy výhradně ze závazné palety (ThemeProvider.tsx)
const COL: Record<number, string> = {
  0: '#e9e9dd', // background.5 – soutěž
  1: '#c49ad8', // brandAmethyst.3 – jediná kandidátka s náhradníky
  2: '#6e227d', // brandAmethyst.7 – jediná kandidátka, zvoleni všichni
  3: '#1a9fbd', // brandTeal.5 – víc kandidátek, ale zvoleni všichni
  4: '#de1743', // brand.6 – nikdo nekandidoval
};
const NODATA = '#f8f6f0';   // background.2 – obec tehdy nebyla samostatná
const HIDDEN = '#f3f1e9';   // background.3 – kategorie vypnutá v legendě
const INK = '#101432';      // brandNavy.9
const MUTED = '#4c4f8e';    // brandNavy.7
const GRID = '#eeeae2';     // background.4
const FONT = 'var(--font-roboto-condensed), Arial, sans-serif';

const LABEL: Record<number, string> = {
  2: 'Jediná kandidátka, zvoleni všichni',
  1: 'Jediná kandidátka s náhradníky',
  3: 'Víc kandidátek, ale zvoleni všichni',
  4: 'Nikdo nekandidoval',
  0: 'Volby se soutěží',
};
const LEGEND_ORDER = [2, 1, 3, 4, 0];

type YearRec = [cat: number, mand: number, kand: number, listy: number];
type Obec = { n: string; o: string; p: number; y: Record<string, YearRec> };
type RawData = { years: number[]; obce: Record<string, { n: string; o: string; p: number; y: string }> };

const nf = (v: number) => v.toLocaleString('cs-CZ');

function plural(n: number, one: string, few: string, many: string) {
  if (n === 1) return one;
  if (n >= 2 && n <= 4) return few;
  return many;
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

function parse(raw: RawData) {
  const obce: Record<string, Obec> = {};
  for (const [id, o] of Object.entries(raw.obce)) {
    const y: Record<string, YearRec> = {};
    for (const part of o.y.split(';')) {
      if (!part) continue;
      const [yr, vals] = part.split(':');
      y[yr] = vals.split(',').map(Number) as YearRec;
    }
    obce[id] = { n: o.n, o: o.o, p: o.p, y };
  }
  return { years: raw.years, obce };
}

function describe(r: YearRec | undefined) {
  if (!r) return 'Obec v těchto volbách nebyla samostatná.';
  const [c, mand, kand, listy] = r;
  if (c === 4) return `Nikdo nepodal kandidátku (${mand} mandátů). Volby se nekonaly.`;
  const kStr = kand < 0 ? 'víc stran' : `${nf(kand)} ${plural(kand, 'kandidát', 'kandidáti', 'kandidátů')}`;
  const lStr = `${listy} ${plural(listy, 'kandidátka', 'kandidátky', 'kandidátek')}`;
  return `${lStr}, ${kStr} na ${mand} ${plural(mand, 'mandát', 'mandáty', 'mandátů')}`;
}

export interface ObceKandidatkyMapProps {
  geoUrl: string;
  dataUrl: string;
  title?: string;
  subtitle?: string;
  source?: string;
  initialYear?: number;
}

export default function ObceKandidatkyMap({ geoUrl, dataUrl, title, subtitle, source, initialYear = 2026 }: ObceKandidatkyMapProps) {
  const [wrapRef, width] = useWidth<HTMLDivElement>();
  const [topo, setTopo] = useState<Topology | null>(null);
  const [data, setData] = useState<{ years: number[]; obce: Record<string, Obec> } | null>(null);
  const [year, setYear] = useState(initialYear);
  const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(null);
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<string | null>(null);
  // klikací legenda: vypnuté kategorie se v mapě vybarví neutrálně
  const [off, setOff] = useState<Set<number>>(() => new Set());
  const toggleCat = (c: number) => setOff((prev) => {
    const next = new Set(prev);
    if (next.has(c)) next.delete(c);
    else next.add(c);
    return next;
  });
  const fillFor = (r: YearRec | undefined) => (!r ? NODATA : off.has(r[0]) ? HIDDEN : COL[r[0]]);

  useEffect(() => {
    let alive = true;
    Promise.all([fetch(geoUrl).then((r) => r.json()), fetch(dataUrl).then((r) => r.json())]).then(([g, d]) => {
      if (!alive) return;
      setTopo(g as Topology);
      setData(parse(d as RawData));
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
    // S-JTSK East-North: souřadnice jsou rovinné, stačí je jen otočit osou y a vměstnat
    const proj = geoIdentity().reflectY(true).fitSize([width, height], { type: 'FeatureCollection', features: geo.obce });
    return geoPath(proj);
  }, [geo, width, height]);

  const paths = useMemo(() => {
    if (!geo || !path) return [];
    return geo.obce.map((f) => ({ id: String(f.id ?? f.properties?.id), d: path(f) ?? '' }));
  }, [geo, path]);

  const { counts, missing } = useMemo(() => {
    const c: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    let miss = 0;
    if (!data) return { counts: c, missing: 0 };
    for (const o of Object.values(data.obce)) {
      const r = o.y[String(year)];
      if (r) c[r[0]] += 1;
      else miss += 1;
    }
    return { counts: c, missing: miss };
  }, [data, year]);

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const matches = useMemo(() => {
    if (!data || query.trim().length < 2) return [];
    const q = query.trim().toLocaleLowerCase('cs');
    return Object.entries(data.obce)
      .filter(([, o]) => o.n.toLocaleLowerCase('cs').startsWith(q))
      .sort((a, b) => b[1].p - a[1].p)
      .slice(0, 8);
  }, [data, query]);

  const focusId = hover?.id ?? picked;
  const focus = focusId && data ? data.obce[focusId] : null;
  const focusRec = focus?.y[String(year)];

  const narrow = width < 560;

  return (
    <ChartCard title={title} subtitle={subtitle} source={source}>
      <div style={{ fontFamily: FONT, color: INK }}>
        {/* Přepínač let */}
        <div role="group" aria-label="Volby" style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
          {(data?.years ?? [1994, 1998, 2002, 2006, 2010, 2014, 2018, 2022, 2026]).map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => setYear(y)}
              aria-pressed={y === year}
              style={{
                fontFamily: FONT, fontSize: 14, padding: '4px 10px', borderRadius: 4, cursor: 'pointer',
                border: `1px solid ${y === year ? INK : '#d4d4c8'}`,
                background: y === year ? INK : '#fff', color: y === year ? '#fff' : INK,
                fontWeight: y === year ? 700 : 400,
              }}
            >
              {y}
            </button>
          ))}
        </div>

        {/* Legenda s počty pro zvolený rok */}
        <div style={{ display: 'grid', gridTemplateColumns: narrow ? '1fr' : '1fr 1fr', gap: '3px 18px', fontSize: 14, marginBottom: 8 }}>
          {LEGEND_ORDER.map((c) => {
            const on = !off.has(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggleCat(c)}
                aria-pressed={on}
                title={on ? 'Kliknutím skryjete v mapě' : 'Kliknutím zobrazíte v mapě'}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', padding: 0, border: 'none',
                  background: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 14, color: INK,
                  opacity: on ? 1 : 0.45, transition: 'opacity 0.15s',
                }}
              >
                <span style={{ width: 13, height: 13, borderRadius: 2, background: on ? COL[c] : 'transparent', flex: '0 0 auto', border: on && c !== 0 ? 'none' : `1.5px solid ${c === 0 ? '#bcbcb0' : COL[c]}`, boxSizing: 'border-box' }} />
                <span>
                  {LABEL[c]}: <strong>{nf(counts[c])}</strong>
                  {total > 0 && c !== 0 && <span style={{ color: MUTED }}> ({(counts[c] / total * 100).toFixed(1).replace('.', ',')} %)</span>}
                </span>
              </button>
            );
          })}
          {missing > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 13, height: 13, borderRadius: 2, background: NODATA, flex: '0 0 auto', border: '1px solid #d4d4c8' }} />
              <span>Obec tehdy nebyla samostatná: <strong>{nf(missing)}</strong></span>
            </div>
          )}
        </div>
        {missing > 0 && (
          <div style={{ fontSize: 12.5, color: MUTED, marginBottom: 8 }}>
            Mapa ukazuje obce v dnešních hranicích. Obce, které se od té doby rozdělily nebo sloučily, se ve starších volbách nedají přiřadit, proto se počty mírně liší od grafu níže.
          </div>
        )}

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
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: `1px solid ${GRID}`, borderRadius: 4, zIndex: 3, boxShadow: '0 4px 14px rgba(16,20,50,.10)' }}>
              {matches.map(([id, o]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => { setPicked(id); setQuery(o.n); }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '5px 10px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: FONT, fontSize: 14, color: INK }}
                >
                  {o.n} <span style={{ color: MUTED }}>· okres {o.o}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div ref={wrapRef} style={{ position: 'relative', width: '100%' }} onMouseLeave={() => setHover(null)}>
          {!path && <div style={{ height: Math.max(height, 240), display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED }}>Načítám mapu obcí…</div>}
          {path && geo && data && (
            <svg width={width} height={height} role="img" aria-label={`Mapa obcí podle typu komunálních voleb ${year}`} style={{ display: 'block' }}>
              <g>
                {paths.map(({ id, d }) => {
                  const r = data.obce[id]?.y[String(year)];
                  return (
                    <path
                      key={id}
                      d={d}
                      fill={fillFor(r)}
                      stroke={r && r[0] !== 0 && !off.has(r[0]) ? 'none' : '#fff'}
                      strokeWidth={0.25}
                      onMouseMove={(e) => {
                        const box = wrapRef.current?.getBoundingClientRect();
                        if (box) setHover({ id, x: e.clientX - box.left, y: e.clientY - box.top });
                      }}
                      onClick={(e) => {
                        const box = wrapRef.current?.getBoundingClientRect();
                        if (box) setHover({ id, x: e.clientX - box.left, y: e.clientY - box.top });
                      }}
                    />
                  );
                })}
              </g>
              <path d={path(geo.kraje) ?? ''} fill="none" stroke="#fff" strokeWidth={1.4} pointerEvents="none" />
              <path d={path(geo.outline) ?? ''} fill="none" stroke="#bcbcb0" strokeWidth={0.8} pointerEvents="none" />
              {focusId && (() => {
                const f = geo.obce.find((g) => String(g.id ?? g.properties?.id) === focusId);
                return f ? <path d={path(f) ?? ''} fill="none" stroke={INK} strokeWidth={1.6} pointerEvents="none" /> : null;
              })()}
            </svg>
          )}

          {/* Tooltip / detail obce */}
          {focus && (
            <div
              style={{
                // najetí myší / ťuknutí = tooltip u kurzoru; vyhledaná obec = detail v levém dolním rohu
                // mapy (prázdné místo pod Šumavou). Vždy absolutně, aby se rozvržení stránky nehýbalo.
                position: 'absolute', pointerEvents: 'none',
                top: hover ? Math.min(Math.max(0, hover.y - 70), height - 90) : undefined,
                bottom: hover ? undefined : 0,
                left: hover ? (hover.x > width - 260 ? undefined : hover.x + 14) : 0,
                right: hover && hover.x > width - 260 ? width - hover.x + 14 : undefined,
                background: '#fff', border: `1px solid ${GRID}`, borderRadius: 6, padding: '8px 10px',
                fontSize: 13, lineHeight: 1.45, boxShadow: '0 4px 14px rgba(16,20,50,.10)', maxWidth: 260, zIndex: 2,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14 }}>{focus.n}</div>
              <div style={{ color: MUTED }}>okres {focus.o} · {nf(focus.p)} obyvatel (2026)</div>
              <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: focusRec ? COL[focusRec[0]] : NODATA, border: '1px solid #d4d4c8' }} />
                <strong>{focusRec ? LABEL[focusRec[0]] : 'Bez údajů'}</strong>
              </div>
              <div>{year}: {describe(focusRec)}</div>
            </div>
          )}
        </div>
      </div>
    </ChartCard>
  );
}
