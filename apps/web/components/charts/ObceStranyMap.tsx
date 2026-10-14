'use client';

// Mapa všech obcí Česka: kde strany přišly o zastupitele, kde je ztratily, získaly,
// mají stejně jako dosud, nebo kde vůbec kandidovaly (komunální volby 2022 → 2026).
// Nahoře přepínač, barva = strana, strany se zapínají a vypínají klikací legendou.
// Kliknutím na město s městskými částmi se pod mapou otevře rozpad po částech.
// Geometrie sdílí s ObceKandidatkyMap (volební okrsky ČSÚ 2022 sloučené do obcí),
// data = registry kandidátů volby.gov.cz, zastupitelé podle navrhující strany.

import { useEffect, useMemo, useRef, useState } from 'react';
import { geoIdentity, geoPath } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { Feature, Geometry } from 'geojson';
import ChartCard from './ChartCard';
import ChartLegend from './ChartLegend';

// Barvy stran z predikce (volby2026.datatimes.cz), ostatní ze závazné palety (ThemeProvider.tsx)
// kss = KSČM a Stačilo! dohromady (navržení oběma stranami, viz _data_pipeline/build.py)
type Party = 'spd' | 'ano' | 'aut' | 'kss' | 'pro';
const PARTIES: Party[] = ['spd', 'ano', 'aut', 'kss', 'pro'];
const COLOR: Record<Party, string> = {
  spd: '#a47d03', // SPD – brandYellow.9
  ano: '#272a59', // ANO – brandRoyalBlue.8
  aut: '#1a9fbd', // Motoristé – brandTeal.5
  kss: '#c5143c', // KSČM a Stačilo! – brand.7 (barva KSČM/Stačilo! z predikce)
  pro: '#9f319e', // PRO – brandAmethyst.6
};
const DEFAULT_CAT: 'maji' = 'maji';
const NONE = '#e9e9dd';     // background.5
const INK = '#101432';      // brandNavy.9
const MUTED = '#4c4f8e';    // brandNavy.7
const GRID = '#eeeae2';     // background.4
const FONT = 'var(--font-roboto-condensed), Arial, sans-serif';

type Cat = 'maji' | 'meli' | 'vse' | 'ztratili' | 'ziskali' | 'stejne' | 'kand';
type Icon = 'up' | 'down' | 'eq' | 'out' | 'ballot';
// Názvosloví podle britských komunálních voleb (BBC, Guardian: gain / hold / loss):
// krátké sloveso, co se straně stalo, plné znění v title.
const CATS: { id: Cat; label: string; title: string; icon?: Icon; row: 1 | 2 }[] = [
  // 1. řádek: stav před volbami → letošní kandidáti → stav po volbách
  { id: 'meli', label: 'Volby 2022', title: 'Kde strana měla zastupitele po volbách 2022', row: 1 },
  { id: 'kand', label: 'Kandidovali 2026', title: 'Kde strana letos postavila kandidáty', icon: 'ballot', row: 1 },
  { id: 'maji', label: 'Volby 2026', title: 'Kde strana má zastupitele po letošních volbách', row: 1 },
  // 2. řádek: co se straně stalo
  { id: 'stejne', label: 'Udrželi', title: 'Stejný počet zastupitelů jako dosud', icon: 'eq', row: 2 },
  { id: 'ztratili', label: 'Ztratili', title: 'Zastupitelů ubylo, ale někoho si udrželi', icon: 'down', row: 2 },
  { id: 'ziskali', label: 'Získali', title: 'Zastupitelů přibylo, včetně míst, kde dosud nikoho neměli', icon: 'up', row: 2 },
  { id: 'vse', label: 'Úplně vypadli', title: 'Přišli o všechny zastupitele', icon: 'out', row: 2 },
];

// Malé piktogramy k přepínači (barvy z palety; na aktivním tlačítku bílé)
const ICON_COL: Record<Icon, string> = {
  up: '#0e839e',    // brandTeal.6
  down: '#de1743',  // brand.6
  eq: '#7889be',    // brandNavy.5
  out: '#de1743',   // brand.6
  ballot: '#4c4f8e', // brandNavy.7
};
function Pikto({ icon, on }: { icon: Icon; on: boolean }) {
  const c = on ? '#fff' : ICON_COL[icon];
  const common = { width: 14, height: 14, viewBox: '0 0 14 14', 'aria-hidden': true, style: { flex: '0 0 auto' } } as const;
  switch (icon) {
    case 'up': return <svg {...common}><path d="M7 2 L12.5 9 H9 V12.5 H5 V9 H1.5 Z" fill={c} /></svg>;
    case 'down': return <svg {...common}><path d="M7 12 L12.5 5 H9 V1.5 H5 V5 H1.5 Z" fill={c} /></svg>;
    case 'eq': return <svg {...common}><rect x="2" y="3.5" width="10" height="2.4" rx="1" fill={c} /><rect x="2" y="8.1" width="10" height="2.4" rx="1" fill={c} /></svg>;
    case 'out': return <svg {...common}><path d="M3 3 L11 11 M11 3 L3 11" stroke={c} strokeWidth="2.6" strokeLinecap="round" /></svg>;
    case 'ballot': return (
      <svg {...common}>
        <rect x="1.5" y="6.5" width="11" height="6" rx="1" fill={c} />
        <rect x="4" y="1.5" width="6" height="6.5" rx="0.6" fill="none" stroke={c} strokeWidth="1.3" />
        <path d="M5.3 4.6 L6.6 5.8 L8.8 3.2" fill="none" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }
}

// [zastupitelé před volbami, kandidáti 2026, zastupitelé 2026, kandidáti 2022]
type Rec = [m22: number, k26: number, m26: number, k22: number];
type Cast = { n: string } & Partial<Record<Party, Rec>>;
type Obec = { n: string; o: string; p: number; m: number; casti?: Cast[] } & Partial<Record<Party | `${Party}_mc`, Rec>>;
type RawData = { strany: Record<Party, string>; obce: Record<string, Obec> };

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

// Obec + součet jejích městských částí (Praha, Brno, Ostrava…)
function recOf(o: Obec | undefined, p: Party): Rec {
  const a = (o?.[p] as Rec | undefined) ?? [0, 0, 0, 0];
  const mc = o?.[`${p}_mc`] as Rec | undefined;
  return (mc ? a.map((v, i) => v + mc[i]) : a) as Rec;
}

// Patří záznam strany v obci do zvoleného pohledu? Vrací váhu (čím vyšší, tím spíš
// obec dostane barvu této strany), nebo -1.
function weight([m22, k26, m26]: Rec, cat: Cat): number {
  switch (cat) {
    case 'maji': return m26 > 0 ? m26 : -1;
    case 'meli': return m22 > 0 ? m22 : -1;
    case 'vse': return m22 && !m26 ? m22 : -1;
    case 'ztratili': return m26 && m26 < m22 ? m22 - m26 : -1;
    case 'ziskali': return m26 > m22 ? m26 - m22 : -1;
    case 'stejne': return m22 && m26 === m22 ? m22 : -1;
    case 'kand': return k26 > 0 ? k26 : -1;
  }
}

export interface ObceStranyMapProps {
  geoUrl: string;
  dataUrl: string;
  title?: string;
  subtitle?: string;
  source?: string;
  initialCat?: Cat;
}

export default function ObceStranyMap({ geoUrl, dataUrl, title, subtitle, source, initialCat = DEFAULT_CAT }: ObceStranyMapProps) {
  const [wrapRef, width] = useWidth<HTMLDivElement>();
  const [topo, setTopo] = useState<Topology | null>(null);
  const [data, setData] = useState<RawData | null>(null);
  const [cat, setCat] = useState<Cat>(initialCat);
  const [active, setActive] = useState<Party[]>(PARTIES);
  const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(null);
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<string | null>(null);

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

  const paths = useMemo(() => {
    if (!geo || !path) return [];
    return geo.obce.map((f) => ({ id: String(f.id ?? f.properties?.id), d: path(f) ?? '' }));
  }, [geo, path]);

  // Pro každou obec strana, jejíž barvou se obarví: ze zapnutých stran ve zvolené
  // kategorii ta s největší změnou počtu zastupitelů. Počty obcí po stranách do legendy.
  const { fill, counts } = useMemo(() => {
    const f: Record<string, Party> = {};
    const c = Object.fromEntries(PARTIES.map((p) => [p, 0])) as Record<Party, number>;
    if (!data) return { fill: f, counts: c };
    for (const [id, o] of Object.entries(data.obce)) {
      let best: Party | null = null;
      let bestD = -1;
      for (const p of PARTIES) {
        const d = weight(recOf(o, p), cat);
        if (d < 0) continue;
        c[p] += 1;
        if (active.includes(p) && d > bestD) { best = p; bestD = d; }
      }
      if (best) f[id] = best;
    }
    return { fill: f, counts: c };
  }, [data, cat, active]);

  // obarvené obce kreslit nahoru, aby jim šedé sousedky nepřekryly obrys
  const ordered = useMemo(
    () => [...paths].sort((a, b) => Number(Boolean(fill[a.id])) - Number(Boolean(fill[b.id]))),
    [paths, fill],
  );

  const matches = useMemo(() => {
    if (!data || query.trim().length < 2) return [];
    const q = query.trim().toLocaleLowerCase('cs');
    return Object.entries(data.obce)
      .filter(([, o]) => o.n.toLocaleLowerCase('cs').startsWith(q))
      .sort((a, b) => b[1].p - a[1].p)
      .slice(0, 8);
  }, [data, query]);

  const focusId = hover?.id ?? picked;
  const focus = focusId && data ? data.obce[focusId] : undefined;

  const btn = (on: boolean): React.CSSProperties => ({
    fontFamily: FONT, fontSize: 14, padding: '4px 10px', borderRadius: 4, cursor: 'pointer',
    border: `1px solid ${on ? INK : '#d4d4c8'}`,
    background: on ? INK : '#fff', color: on ? '#fff' : INK, fontWeight: on ? 700 : 400,
  });

  const legendItems = PARTIES.filter((p) => data?.strany[p]).map((p) => ({
    key: p,
    color: COLOR[p],
    label: `${data!.strany[p]} (${nf(counts[p])} ${plural(counts[p], 'obec', 'obce', 'obcí')})`,
  }));

  return (
    <ChartCard title={title} subtitle={subtitle} source={source}>
      <div style={{ fontFamily: FONT, color: INK }}>
        <div role="group" aria-label="Co se stalo" style={{ marginBottom: 12 }}>
          {([1, 2] as const).map((row) => (
            <div key={row} style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: row === 1 ? 4 : 0 }}>
              {CATS.filter((c) => c.row === row).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCat(c.id)}
                  aria-pressed={c.id === cat}
                  title={c.title}
                  style={{ ...btn(c.id === cat), display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  {c.icon && <Pikto icon={c.icon} on={c.id === cat} />}
                  {c.label}
                </button>
              ))}
            </div>
          ))}
        </div>

        {data && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ flex: '1 1 auto' }}>
              <ChartLegend
                items={legendItems}
                activeKeys={active}
                onChange={(keys) => setActive(PARTIES.filter((p) => keys.includes(p)))}
                marginBottom={8}
              />
            </div>
            {/* Domeček: zpět na výchozí stav – všechny strany, volby 2026, bez vybrané obce */}
            <button
              type="button"
              title="Zpět na výchozí zobrazení"
              aria-label="Zpět na výchozí zobrazení"
              onClick={() => { setActive(PARTIES); setCat(DEFAULT_CAT); setPicked(null); setQuery(''); setHover(null); }}
              style={{ ...btn(false), padding: '4px 7px', display: 'inline-flex', alignItems: 'center', flex: '0 0 auto' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                <path d="M2 7.5 L8 2.2 L14 7.5" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 6.8 V13.5 H6.8 V9.8 H9.2 V13.5 H12 V6.8" fill="none" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
              </svg>
            </button>
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
            <svg width={width} height={height} role="img" aria-label={`Mapa obcí: ${CATS.find((c) => c.id === cat)?.label}`} style={{ display: 'block' }}>
              <g>
                {ordered.map(({ id, d }) => {
                  const p = fill[id];
                  return (
                    <path
                      key={id}
                      d={d}
                      fill={p ? COLOR[p] : NONE}
                      stroke={p ? '#fff' : '#fff'}
                      strokeWidth={p ? 0.5 : 0.25}
                      onMouseMove={(e) => {
                        const box = wrapRef.current?.getBoundingClientRect();
                        if (box) setHover({ id, x: e.clientX - box.left, y: e.clientY - box.top });
                      }}
                      onClick={(e) => {
                        const box = wrapRef.current?.getBoundingClientRect();
                        if (box) setHover({ id, x: e.clientX - box.left, y: e.clientY - box.top });
                        setPicked(id);
                        setQuery(data.obce[id]?.n ?? '');
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

          {/* Tooltip / detail obce: všechny strany, které tu měly nebo mají zastupitele */}
          {focus && (() => {
            const rows = PARTIES.map((p) => ({ p, r: recOf(focus, p) })).filter(({ r }) => r[0] || r[1] || r[2]);
            return (
              <div
                style={{
                  position: 'absolute', pointerEvents: 'none',
                  top: hover ? Math.min(Math.max(0, hover.y - 70), height - 140) : undefined,
                  bottom: hover ? undefined : 0,
                  left: hover ? (hover.x > width - 280 ? undefined : hover.x + 14) : 0,
                  right: hover && hover.x > width - 280 ? width - hover.x + 14 : undefined,
                  background: '#fff', border: `1px solid ${GRID}`, borderRadius: 6, padding: '8px 10px',
                  fontSize: 13, lineHeight: 1.5, boxShadow: '0 4px 14px rgba(16,20,50,.10)', maxWidth: 280, zIndex: 2,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 14 }}>{focus.n}</div>
                <div style={{ color: MUTED, marginBottom: 4 }}>okres {focus.o} · {nf(focus.p)} obyvatel</div>
                {rows.length === 0 && <div>Žádná z těchto stran tu neměla zastupitele ani letos nekandidovala.</div>}
                {rows.map(({ p, r }) => (
                  <div key={p} style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 2, background: COLOR[p], flex: '0 0 auto', transform: 'translateY(1px)' }} />
                    <span>
                      <strong>{data!.strany[p]}</strong> {r[0]} → <strong>{r[2]}</strong>
                      <span style={{ color: MUTED }}>
                        {' · '}
                        {r[1] ? `${nf(r[1])} ${plural(r[1], 'kandidát', 'kandidáti', 'kandidátů')}` : 'letos nekandidovali'}
                        {r[2] > 0 && r[2] === r[1] && ', zvoleni všichni'}
                      </span>
                    </span>
                  </div>
                ))}
                {focus.casti && (
                  <div style={{ marginTop: 4, color: MUTED }}>
                    Součet města a {focus.casti.length} městských částí. {picked === focusId ? 'Rozpad je pod mapou.' : 'Kliknutím zobrazíte rozpad pod mapou.'}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Rozpad města s městskými částmi: zastupitelstvo města a každá část zvlášť */}
        {picked && data?.obce[picked]?.casti && (() => {
          const o = data.obce[picked];
          // strana se v řádku ukáže, jen když tu měla nebo má zastupitele, nebo letos kandidovala
          const has = (r: Rec | undefined): r is Rec => Boolean(r && (r[0] || r[1] || r[2]));
          const mesto: Cast = { n: `Zastupitelstvo města ${o.n}` };
          for (const p of PARTIES) if (o[p]) mesto[p] = o[p] as Rec;
          // sloupce jen pro zapnuté strany, které tu někde něco mají
          const shown = PARTIES.filter((p) => active.includes(p) && data.strany[p]
            && [mesto, ...(o.casti ?? [])].some((c) => has(c[p])));
          const radky = [mesto, ...(o.casti ?? [])].filter((c, i) => i === 0 || shown.some((p) => has(c[p])));
          const cell = (r: Rec | undefined) => (!has(r) ? <span style={{ color: '#bcbcb0' }}>–</span> : (
            <>
              {r[0]} → <strong>{r[2]}</strong>
              <span style={{ color: MUTED }}> ({nf(r[1])})</span>
            </>
          ));
          return (
            <div style={{ marginTop: 12, overflowX: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                <strong style={{ fontSize: 15 }}>{o.n}: město a městské části</strong>
                <button type="button" onClick={() => { setPicked(null); setQuery(''); }} style={{ ...btn(false), fontSize: 13, padding: '2px 8px' }}>
                  Zavřít
                </button>
              </div>
              <table style={{ borderCollapse: 'collapse', fontSize: 13.5, width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '4px 8px 4px 0', borderBottom: `1px solid ${INK}` }} />
                    {shown.map((p) => (
                      <th key={p} style={{ textAlign: 'left', padding: '4px 8px', borderBottom: `1px solid ${INK}`, whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: 2, background: COLOR[p], marginRight: 5 }} />
                        {data.strany[p]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {radky.map((c, i) => (
                    <tr key={c.n} style={{ background: i === 0 ? GRID : undefined }}>
                      <td style={{ padding: '3px 8px 3px 0', borderBottom: `1px solid ${GRID}`, fontWeight: i === 0 ? 700 : 400 }}>{c.n}</td>
                      {shown.map((p) => (
                        <td key={p} style={{ padding: '3px 8px', borderBottom: `1px solid ${GRID}`, whiteSpace: 'nowrap' }}>{cell(c[p])}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ fontSize: 12.5, color: MUTED, marginTop: 4 }}>
                Zastupitelé před volbami → po volbách 2026, v závorce počet kandidátů 2026. Uvedeny jsou jen části, kde některá ze zapnutých stran kandidovala nebo měla zastupitele.
              </div>
            </div>
          );
        })()}

        <div style={{ fontSize: 12.5, color: MUTED, marginTop: 8 }}>
          Počty zastupitelů před volbami a po nich. Zastupitel strany = zvolený kandidát, kterého strana navrhla, i na společné kandidátce. U měst s městskými částmi (Praha, Brno, Ostrava, Plzeň…) se sčítá město i jeho části. Když se zvolený pohled v obci týká víc stran, má obec barvu té s víc zastupiteli (u změn s větší změnou, u kandidátů s víc kandidáty).
        </div>
      </div>
    </ChartCard>
  );
}
