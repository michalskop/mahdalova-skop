'use client';

// Komunální volby 2026 – kdo vyhrál v jednotlivých volebních okrscích („Jak volili vaši sousedé“).
// Data (public/data/kv2026-okrsky, pipeline v článku volby-cr-2026-10-11-komunalni-volby-jak-volili-vasi-sousede/_pipeline):
//   obce.json      { okresy: {kód: název}, obce: [[kód, název, okres, voliči, [[kód MČ, název, voliči], …]], …] }
//   okrsky.json    TopoJSON, jeden objekt na okres; feature.properties.id = "<kód obce nebo MČ>-<číslo okrsku>"
//   meta/<okres>.json  { okrsky: {id: {"1"|"2": [kód zastupitelstva, voliči, obálky, platné hlasy, [[kandidátka, hlasy], …]]}},
//                        zast: {kód: {n, l: [{n, z, m, c, s?}]}} }   ("1" = zastupitelstvo obce/města, "2" = městské části)
// Výplň okrsku = barva kandidátky s nejvíc hlasy. Detail okrsku se ukazuje v panelu vedle mapy (na mobilu pod ní),
// nikdy přes mapu – tooltip nesmí zakrývat sousední okrsky.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import ChartCard from './ChartCard';
import ChartSignature from './ChartSignature';
import OsmPodklad, { OsmAttribution } from './OsmPodklad';
import { renderTitle, renderSubtitle } from './chartText';

const INK = '#101432';
const MUTED = '#4c4f8e';
const LINE = '#e6e3d9';
const CONTEXT = '#eeeae2';
const NODATA = '#d4d4c8';
const FONT = 'var(--font-roboto-condensed), Arial, sans-serif';
const PANEL_W = 300;

type ObecRow = [number, string, number, number, [number, string, number][]];
type Index = { okresy: Record<string, string>; obce: ObecRow[] };
type ZRow = [number, number, number, number, [number, number][]];
type Meta = { okrsky: Record<string, Record<string, ZRow>>; zast: Record<string, { n: string; l: { n: string; z: string; k?: string; m: number; c: string; s?: string }[] }> };
type Entry = { kod: number; n: string; okres: number; v: number; mesto?: Entry; mc?: Entry[]; key: string };
type Topo = { objects: Record<string, unknown> } & Record<string, unknown>;

const pct = (v: number, d = 1) => `${(v * 100).toFixed(d).replace('.', ',')} %`;
const num = (v: number) => v.toLocaleString('cs-CZ');
const pl = (n: number, a: string, b: string, c: string) => (n === 1 ? a : n >= 2 && n <= 4 ? b : c);
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// callback ref: observer se napojí na každý nový uzel (ChartCard může obsah po mountu přestavět,
// a když se stránka načte ve skrytém panelu, první změřená šířka je 0)
function useWidth<T extends HTMLElement>() {
  const [el, ref] = useState<T | null>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!el) return;
    setW(Math.round(el.getBoundingClientRect().width));
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [el]);
  return [ref, w] as const;
}

export interface OkrskyKvMapaProps {
  dataUrl?: string;
  defaultObec?: number;
  title?: string;
  subtitle?: string;
  source?: string;
}

export default function OkrskyKvMapa({ dataUrl = '/data/kv2026-okrsky', defaultObec = 554804, title, subtitle, source }: OkrskyKvMapaProps) {
  const [wrapRef, width] = useWidth<HTMLDivElement>();
  const [index, setIndex] = useState<Index | null>(null);
  const [topo, setTopo] = useState<Topo | null>(null);
  const [metas, setMetas] = useState<Record<number, Meta>>({});
  const [selKey, setSelKey] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [vse, setVse] = useState(false); // rozbalené kandidátky pod 2 % v panelu
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([fetch(`${dataUrl}/obce.json`).then((r) => r.json()), fetch(`${dataUrl}/okrsky.json`).then((r) => r.json())])
      .then(([i, t]) => { if (alive) { setIndex(i as Index); setTopo(t as Topo); } })
      .catch(() => alive && setErr('Mapu se nepodařilo načíst. Zkuste prosím stránku obnovit.'));
    return () => { alive = false; };
  }, [dataUrl]);

  // rejstřík pro vyhledávání: obce + městské části / obvody
  const entries = useMemo(() => {
    if (!index) return null;
    const all: Entry[] = []; const byKey = new Map<string, Entry>();
    for (const [kod, n, okres, v, mcs] of index.obce) {
      const e: Entry = { kod, n, okres, v, key: `o${kod}` };
      if (mcs.length) e.mc = mcs.map(([k, mn, mv]) => ({ kod: k, n: mn, okres, v: mv, mesto: e, key: `m${k}` }));
      all.push(e); byKey.set(e.key, e);
      for (const m of e.mc ?? []) { all.push(m); byKey.set(m.key, m); }
    }
    return { all, byKey };
  }, [index]);

  useEffect(() => { if (entries && !selKey) setSelKey(`o${defaultObec}`); }, [entries, selKey, defaultObec]);
  const sel = selKey && entries ? entries.byKey.get(selKey) ?? null : null;

  useEffect(() => {
    if (!sel || metas[sel.okres]) return;
    let alive = true;
    fetch(`${dataUrl}/meta/${sel.okres}.json`).then((r) => r.json())
      .then((m) => { if (alive) setMetas((x) => ({ ...x, [sel.okres]: m as Meta })); })
      .catch(() => alive && setErr('Výsledky okrsků se nepodařilo načíst.'));
    return () => { alive = false; };
  }, [sel, metas, dataUrl]);
  const meta = sel ? metas[sel.okres] : undefined;

  // okrsky vybrané obce / části a ostatní okrsky okresu jako podklad
  const feats = useMemo(() => {
    if (!sel || !topo || !topo.objects[String(sel.okres)]) return null;
    const fc = feature(topo as never, topo.objects[String(sel.okres)] as never) as unknown as FeatureCollection<Geometry, { id: string }>;
    const codes = new Set(sel.mc ? sel.mc.map((m) => String(m.kod)) : [String(sel.kod)]);
    const mine: Feature<Geometry, { id: string }>[] = []; const rest: Feature<Geometry, { id: string }>[] = [];
    for (const f of fc.features) (codes.has(f.properties.id.split('-')[0]) ? mine : rest).push(f);
    return { mine, rest };
  }, [sel, topo]);

  const typ = sel?.mesto ? '2' : '1';
  const res = useMemo(() => {
    if (!feats || !meta) return null;
    const rows = new Map<string, ZRow>();
    let kz: number | null = null;
    const tot = new Map<number, number>(); const won = new Map<number, number>();
    let vol = 0, obal = 0, plhl = 0;
    for (const f of feats.mine) {
      const r = meta.okrsky[f.properties.id]?.[typ];
      if (!r) continue;
      rows.set(f.properties.id, r);
      kz ??= r[0];
      vol += r[1]; obal += r[2]; plhl += r[3];
      for (const [i, v] of r[4]) tot.set(i, (tot.get(i) ?? 0) + v);
      if (r[4].length) won.set(r[4][0][0], (won.get(r[4][0][0]) ?? 0) + 1);
    }
    const z = kz != null ? meta.zast[String(kz)] : undefined;
    const order = Array.from(tot.keys()).sort((a, b) => tot.get(b)! - tot.get(a)!);
    return { rows, z, tot, won, order, vol, obal, plhl };
  }, [feats, meta, typ]);

  // rozvržení: panel vedle mapy od 760 px, jinak pod ní
  const side = width >= 760;
  const mapW = side ? width - PANEL_W - 20 : width;
  const geo = useMemo(() => {
    if (!feats || !feats.mine.length || !mapW) return null;
    const fc: FeatureCollection = { type: 'FeatureCollection', features: feats.mine };
    const probe = geoMercator().fitWidth(mapW - 8, fc);
    const [[x0, y0], [x1, y1]] = geoPath(probe).bounds(fc);
    const ratio = (y1 - y0) / Math.max(1, x1 - x0);
    const h = Math.round(Math.max(side ? 420 : 300, Math.min(side ? 640 : 520, mapW * ratio + 8)));
    const proj = geoMercator().fitExtent([[4, 4], [mapW - 4, h - 4]], fc);
    const path = geoPath(proj);
    return {
      h,
      s: proj.scale(),
      t: proj.translate(),
      mine: feats.mine.map((f) => ({ id: f.properties.id, d: path(f) ?? '' })),
      rest: feats.rest.map((f) => ({ id: f.properties.id, d: path(f) ?? '' })),
    };
  }, [feats, mapW, side]);

  // přibližování: Ctrl/⌘ + kolečko, dva prsty, tlačítka; posun tažením, když je přiblíženo
  const [tf, setTf] = useState({ k: 1, x: 0, y: 0 });
  useEffect(() => { setTf({ k: 1, x: 0, y: 0 }); setPinned(null); setHover(null); setVse(false); }, [selKey, mapW]);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomAt = useCallback((factor: number, cx: number, cy: number) => {
    setTf((t) => {
      const k = Math.max(1, Math.min(16, t.k * factor));
      if (k === 1) return { k: 1, x: 0, y: 0 };
      const f = k / t.k;
      return { k, x: cx - (cx - t.x) * f, y: cy - (cy - t.y) * f };
    });
  }, []);
  useEffect(() => {
    const el = svgRef.current; if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const b = el.getBoundingClientRect();
      zoomAt(Math.exp(-e.deltaY * 0.004), e.clientX - b.left, e.clientY - b.top);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [geo, zoomAt]);
  const ptrs = useRef(new Map<number, { x: number; y: number }>());
  const gest = useRef<{ moved: boolean; dist?: number }>({ moved: false });
  const loc = (e: React.PointerEvent) => { const b = svgRef.current!.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; };
  const onDown = (e: React.PointerEvent) => {
    ptrs.current.set(e.pointerId, loc(e));
    gest.current = { moved: false };
    if (ptrs.current.size === 2) { const [a, b] = Array.from(ptrs.current.values()); gest.current.dist = Math.hypot(a.x - b.x, a.y - b.y); }
  };
  const onMove = (e: React.PointerEvent) => {
    const prev = ptrs.current.get(e.pointerId); if (!prev) return;
    const p = loc(e); ptrs.current.set(e.pointerId, p);
    if (ptrs.current.size === 2 && gest.current.dist) {
      const [a, b] = Array.from(ptrs.current.values()); const d = Math.hypot(a.x - b.x, a.y - b.y);
      zoomAt(d / gest.current.dist, (a.x + b.x) / 2, (a.y + b.y) / 2); gest.current.dist = d; gest.current.moved = true;
    } else if (tf.k > 1 && (e.buttons || e.pointerType !== 'mouse')) {
      const dx = p.x - prev.x, dy = p.y - prev.y;
      if (Math.abs(dx) + Math.abs(dy) > 0.5) { gest.current.moved = true; setTf((t) => ({ ...t, x: t.x + dx, y: t.y + dy })); }
    }
  };
  const onUp = (e: React.PointerEvent) => { ptrs.current.delete(e.pointerId); };

  // vyhledávání
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [act, setAct] = useState(0);
  const hits = useMemo(() => {
    if (!entries || !q.trim()) return [];
    const nq = norm(q.trim());
    const scored: [number, Entry][] = [];
    for (const e of entries.all) {
      const names = [norm(e.n), ...(e.mesto ? [norm(`${e.mesto.n} ${e.n}`)] : [])];
      let s = -1;
      for (const n of names) {
        if (n.startsWith(nq)) s = Math.max(s, 2);
        else if (n.split(/[\s-]+/).some((w) => w.startsWith(nq))) s = Math.max(s, 1);
      }
      if (s >= 0) scored.push([s, e]);
    }
    return scored.sort((a, b) => b[0] - a[0] || (b[1].mesto ?? b[1]).v - (a[1].mesto ?? a[1]).v || Number(!!a[1].mesto) - Number(!!b[1].mesto)).slice(0, 8).map((x) => x[1]);
  }, [entries, q]);
  const describe = (e: Entry) => (e.mesto ? `část města ${e.mesto.n}` : `okres ${index?.okresy[String(e.okres)] ?? ''}`);
  const choose = (e: Entry) => { setSelKey(e.key); setQ(''); setOpen(false); setAct(0); };

  const shown = pinned ?? hover;
  const shownRow = shown ? res?.rows.get(shown) : undefined;
  const mcName = (id: string) => sel?.mc?.find((m) => String(m.kod) === id.split('-')[0])?.n;
  const L = res?.z?.l ?? [];
  const label = (i: number) => L[i]?.n ?? '';
  const legend = res ? res.order.filter((i) => res.won.has(i)) : [];
  const zastLabel = sel ? (sel.mesto ? 'zastupitelstvo městské části' : sel.mc ? (sel.kod === 554782 ? 'zastupitelstvo hlavního města' : 'zastupitelstvo města') : 'zastupitelstvo obce') : '';
  const nOkr = res?.rows.size ?? 0;

  // Dlouhé seznamy (Praha, Brno…): víc než 8 kandidátek a aspoň 3 pod 2 % → ty pod 2 % až po kliknutí na „Zobrazit další“.
  const Rows = ({ r, mand = false }: { r: [number, number][]; mand?: boolean }) => {
    const plh = r.reduce((s, [, v]) => s + v, 0) || 1;
    const top = r[0]?.[1] ?? 1;
    const pod2 = r.length > 8 ? r.filter(([, v]) => v / plh < 0.02).length : 0;
    const male = pod2 >= 3 ? pod2 : 0; // schovat má smysl až od tří kandidátek
    const vidim = vse || !male ? r : r.filter(([, v]) => v / plh >= 0.02);
    return (
      <>
      <div style={{ display: 'grid', gridTemplateColumns: mand ? '12px 1fr auto 2.4em' : '12px 1fr auto', gap: '5px 8px', alignItems: 'center', fontSize: 13.5, lineHeight: 1.25 }}>
        {vidim.map(([i, v], k) => (
          <div key={i} style={{ display: 'contents' }}>
            <span style={{ width: 12, height: 12, background: L[i]?.c ?? NODATA, borderRadius: 2, border: '1px solid rgba(16,20,50,.25)' }} />
            <span style={{ minWidth: 0 }}>
              <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: k === 0 ? 700 : 400 }} title={label(i)}>{label(i)}</span>
              {/* kdo kandidátku podává (koalice, sdružení, nezávislí) – podle registru ČSÚ */}
              {L[i]?.k && <span style={{ display: 'block', fontSize: 11.5, lineHeight: 1.25, color: MUTED, marginTop: 1 }}>{L[i].k}</span>}
              <span style={{ display: 'block', height: 3, marginTop: 2, width: `${(v / top) * 100}%`, background: L[i]?.c ?? NODATA, opacity: 0.85 }} />
            </span>
            <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: k === 0 ? 700 : 400 }}>{pct(v / plh)}</span>
            {mand && <span style={{ fontVariantNumeric: 'tabular-nums', textAlign: 'right', color: L[i]?.m ? INK : MUTED }}>{L[i]?.m ?? 0}</span>}
          </div>
        ))}
      </div>
      {male > 0 && (
        <button type="button" onClick={() => setVse((x) => !x)}
          style={{ marginTop: 8, padding: 0, border: 0, background: 'none', color: MUTED, fontFamily: FONT, fontSize: 13, textDecoration: 'underline', cursor: 'pointer' }}>
          {vse ? 'Skrýt kandidátky pod 2 %' : `Zobrazit další (${male}) pod 2 %`}
        </button>
      )}
      </>
    );
  };

  const panel = (
    <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 8, padding: '12px 14px', minHeight: side ? 200 : undefined }}>
      {shown && shownRow ? (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 16 }}>Okrsek č.&nbsp;{shown.split('-')[1]}</span>
            {sel?.mc && !sel.mesto && <span style={{ color: MUTED, fontSize: 13 }}>{mcName(shown)}</span>}
            {pinned && <button type="button" onClick={() => setPinned(null)} aria-label="Zrušit připnutí" style={{ marginLeft: 'auto', border: 0, background: 'none', color: MUTED, cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>}
          </div>
          <div style={{ color: MUTED, fontSize: 13, margin: '2px 0 10px' }}>
            účast {pct(shownRow[2] / Math.max(1, shownRow[1]))} ({num(shownRow[2])} z&nbsp;{num(shownRow[1])} voličů)
          </div>
          <Rows r={shownRow[4]} />
        </>
      ) : res && res.z ? (
        <>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{sel?.n}: všechny okrsky</div>
          <div style={{ color: MUTED, fontSize: 13, margin: '2px 0 10px' }}>
            {num(nOkr)} {pl(nOkr, 'okrsek', 'okrsky', 'okrsků')} · účast {pct(res.obal / Math.max(1, res.vol))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, fontSize: 11.5, color: MUTED, marginBottom: 2 }}><span>hlasy</span><span style={{ width: '2.4em', textAlign: 'right' }}>mand.</span></div>
          <Rows r={res.order.map((i) => [i, res.tot.get(i)!] as [number, number])} mand />
          <div style={{ color: MUTED, fontSize: 12, marginTop: 10 }}>
            {side ? 'Najeďte myší na okrsek, kliknutím ho připnete.' : 'Klepněte na okrsek a uvidíte jeho výsledek.'}
          </div>
        </>
      ) : null}
    </div>
  );

  const zbtn: React.CSSProperties = { width: 30, height: 30, border: `1px solid ${LINE}`, background: '#fff', color: INK, borderRadius: 4, cursor: 'pointer', fontSize: 17, lineHeight: 1, padding: 0 };

  return (
    // mapa vystupuje z textového sloupce (až 1120 px), aby se panel s okrskem vešel vedle ní
    <div style={{ clear: 'both', width: 'min(1120px, calc(100vw - 32px))', marginLeft: 'calc(50% - min(560px, 50vw - 16px))' }}>
      <ChartCard source={source}>
        <div ref={wrapRef} style={{ fontFamily: FONT, color: INK }}>
          {title && <div className="dpbp-chart-title" style={{ fontWeight: 700, lineHeight: 1.2, color: '#1a1a1a', marginBottom: 6 }}>{renderTitle(title.replace('{obec}', sel?.n ?? ''))}</div>}
          <div className="dpbp-chart-subtitle" style={{ lineHeight: 1.3, color: '#333333', marginBottom: 12 }}>
            {subtitle ? renderSubtitle(subtitle) : `Komunální volby 2026, ${zastLabel}.`}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 12px', marginBottom: 10 }}>
            <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 420 }}>
              <input
                type="search" value={q} placeholder="Celá ČR: hledat obec nebo městskou část…" aria-label="Hledat obec nebo městskou část kdekoli v ČR"
                role="combobox" aria-expanded={open && hits.length > 0} aria-autocomplete="list"
                onChange={(e) => { setQ(e.target.value); setOpen(true); setAct(0); }}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') { e.preventDefault(); setAct((a) => Math.min(hits.length - 1, a + 1)); }
                  else if (e.key === 'ArrowUp') { e.preventDefault(); setAct((a) => Math.max(0, a - 1)); }
                  else if (e.key === 'Enter' && hits[act]) { e.preventDefault(); choose(hits[act]); }
                  else if (e.key === 'Escape') setOpen(false);
                }}
                style={{ width: '100%', boxSizing: 'border-box', fontFamily: FONT, fontSize: 16, padding: '7px 10px', border: '1px solid #cfccc0', borderRadius: 4, background: '#fff', color: INK }}
              />
              {open && hits.length > 0 && (
                <ul role="listbox" style={{ position: 'absolute', zIndex: 5, top: '100%', left: 0, right: 0, margin: '2px 0 0', padding: 4, listStyle: 'none', background: '#fff', border: `1px solid ${LINE}`, borderRadius: 6, boxShadow: '0 6px 18px rgba(16,20,50,.14)' }}>
                  {hits.map((e, i) => (
                    <li key={e.key} role="option" aria-selected={i === act}
                      onMouseDown={(ev) => { ev.preventDefault(); choose(e); }} onMouseEnter={() => setAct(i)}
                      style={{ padding: '6px 8px', borderRadius: 4, cursor: 'pointer', background: i === act ? '#f3f1e9' : 'transparent' }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{e.n}</div>
                      <div style={{ fontSize: 12.5, color: MUTED }}>{describe(e)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {sel?.mesto && (
              <button type="button" onClick={() => setSelKey(sel.mesto!.key)} style={{ fontFamily: FONT, fontSize: 14, border: `1px solid ${LINE}`, background: '#fff', color: INK, borderRadius: 14, padding: '4px 12px', cursor: 'pointer' }}>
                ← celé město {sel.mesto.n}
              </button>
            )}
            <ChartSignature size={24} layout="inline" textWeight={400} style={{ marginLeft: 'auto', lineHeight: 1 }} />
          </div>

          {/* legenda: kandidátky, které vyhrály aspoň jeden okrsek, s podílem hlasů v celé obci */}
          {res && legend.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', fontSize: 13.5, marginBottom: 10 }}>
              {legend.map((i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, maxWidth: '100%' }}>
                  <span style={{ flex: 'none', width: 13, height: 13, background: L[i]?.c, borderRadius: 2, border: '1px solid rgba(16,20,50,.25)' }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }} title={label(i)}>{label(i)}</span>
                  <span style={{ color: MUTED, fontVariantNumeric: 'tabular-nums' }}>{pct(res.tot.get(i)! / Math.max(1, res.plhl))}</span>
                </span>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: side ? 'row' : 'column', gap: 20, alignItems: 'flex-start' }}>
            <div style={{ position: 'relative', width: mapW, flex: 'none' }} onMouseLeave={() => setHover(null)}>
              {err && <div style={{ padding: 20, color: MUTED }}>{err}</div>}
              {!err && sel && feats && !feats.mine.length && <div style={{ padding: 20, color: MUTED }}>{sel.n}: v obci se v roce 2026 nevolilo, nebo výsledky okrsků nejsou k dispozici.</div>}
              {!err && (!geo || !res) && !(feats && !feats.mine.length) && <div style={{ height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED }}>Načítám mapu…</div>}
              {geo && res && (
                <>
                  <svg
                    ref={svgRef} width={mapW} height={geo.h} role="img"
                    aria-label={`Mapa volebních okrsků, ${sel?.n}: ${nOkr} ${pl(nOkr, 'okrsek', 'okrsky', 'okrsků')}. Barva okrsku ukazuje kandidátku s nejvíce hlasy.`}
                    style={{ display: 'block', touchAction: tf.k > 1 ? 'none' : 'pan-y', cursor: tf.k > 1 ? 'grab' : 'default', background: '#fbfaf6', borderRadius: 6 }}
                    onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
                  >
                    <g transform={`translate(${tf.x},${tf.y}) scale(${tf.k})`}>
                      <OsmPodklad scale={geo.s} translate={geo.t} width={mapW} height={geo.h} tf={tf} />
                      {/* okrsky okolních obcí jen obrysem, podklad pod nimi zůstává čitelný */}
                      <g pointerEvents="none">
                        {geo.rest.map((p) => <path key={p.id} d={p.d} fill={CONTEXT} fillOpacity={0.25} stroke={MUTED} strokeOpacity={0.35} strokeWidth={0.5} vectorEffect="non-scaling-stroke" />)}
                      </g>
                      {/* barva okrsku násobená s podkladem: barva kandidátky zůstane, silnice, lesy a zástavba prosvítají */}
                      <g style={{ mixBlendMode: 'multiply' }}>
                        {geo.mine.map((p) => {
                          const r = res.rows.get(p.id);
                          const w = r?.[4][0]?.[0];
                          return (
                            <path key={p.id} d={p.d} fill={w != null ? L[w]?.c ?? NODATA : NODATA} fillOpacity={0.82} stroke="#fff" strokeWidth={0.7} vectorEffect="non-scaling-stroke"
                              style={{ cursor: 'pointer' }}
                              onPointerEnter={(e) => { if (e.pointerType === 'mouse') setHover(p.id); }}
                              onClick={() => { if (gest.current.moved) return; setPinned((x) => (x === p.id ? null : p.id)); }}
                            />
                          );
                        })}
                      </g>
                      <g pointerEvents="none">
                        {[hover, pinned].filter((id, i, a): id is string => !!id && a.indexOf(id) === i).map((id) => {
                          const p = geo.mine.find((x) => x.id === id);
                          return p ? <path key={`h${id}`} d={p.d} fill="none" stroke={INK} strokeWidth={id === pinned ? 2.6 : 2} vectorEffect="non-scaling-stroke" /> : null;
                        })}
                      </g>
                    </g>
                  </svg>
                  <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <button type="button" aria-label="Přiblížit" style={zbtn} onClick={() => zoomAt(1.6, mapW / 2, geo.h / 2)}>+</button>
                    <button type="button" aria-label="Oddálit" style={zbtn} onClick={() => zoomAt(1 / 1.6, mapW / 2, geo.h / 2)}>−</button>
                    {tf.k > 1 && <button type="button" aria-label="Zobrazit celou obec" style={{ ...zbtn, fontSize: 14 }} onClick={() => setTf({ k: 1, x: 0, y: 0 })}>⟲</button>}
                  </div>
                </>
              )}
              {geo && res && (
                <div style={{ fontSize: 12, color: MUTED, marginTop: 6 }}>
                  {num(nOkr)} {pl(nOkr, 'okrsek', 'okrsky', 'okrsků')} · účast {pct(res.obal / Math.max(1, res.vol))} · přiblížíte Ctrl + kolečkem, dvěma prsty nebo tlačítky
                  <span style={{ display: 'block', marginTop: 2 }}>
                    <OsmAttribution color={MUTED} />
                  </span>
                </div>
              )}
            </div>
            <div style={{ width: side ? PANEL_W : '100%', flex: 'none', position: side ? 'sticky' : undefined, top: 80 }}>{panel}</div>
          </div>
        </div>
      </ChartCard>
    </div>
  );
}
