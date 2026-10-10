'use client';

// Senát 2026 – průběžná predikce po obvodech. Obvody se „rozsvěcují“, jak přibývají data.
// mapaUrl  = senat-mapa.json (polygony obvodů, tečkový podklad, kandidáti z registru ČSÚ)
// predikceUrl = predikce.json { aktualizace, ukazka?, obvody: { "<č. obvodu>": Obvod } }
// Klik / ťuknutí na obvod ukáže pod mapou kartu s kandidáty a predikovanými procenty.

import { useEffect, useMemo, useRef, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import ChartCard from './ChartCard';

const RED = '#D04646';
const RED_LIGHT = '#eb9a9a';
const BLUE = '#0070F4';
const INK = '#101432';
const MUTED = '#4c4f8e';
const DOT = '#d6d3c7';
const FONT = 'var(--font-roboto-condensed), Arial, sans-serif';

type Kandidat = { c: number; n: string; s: string };
type ObvodProps = { o: number; n: string; sen?: string; obh?: string };
type MapData = {
  obvody: FeatureCollection<Geometry, ObvodProps>;
  outline: Geometry;
  dots: [number, number, number][];
  kandidati: Record<string, Kandidat[]>;
};
type ObvodPredikce = {
  stav: 'predikce' | 'vysledek';
  cas?: string;            // čas aktualizace, např. „15:20“
  secteno?: number;        // % sečtených okrsků
  proc: Record<string, number>; // číslo kandidáta → %
  pozn?: string;
};
type Predikce = { aktualizace?: string; ukazka?: boolean; obvody: Record<string, ObvodPredikce> };

const pct = (v: number) => `${v.toFixed(1).replace('.', ',')} %`;

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

// pořadí a role kandidátů v obvodu
function poradi(kand: Kandidat[], p?: ObvodPredikce) {
  const rows = kand.map((k) => ({ ...k, proc: p?.proc[String(k.c)] }));
  rows.sort((a, b) => (b.proc ?? -1) - (a.proc ?? -1));
  const s = rows.filter((r) => r.proc !== undefined);
  const vitez1 = s.length > 0 && (s[0].proc as number) > 50;
  return rows.map((r, i) => ({
    ...r,
    role: r.proc === undefined ? '' : vitez1 ? (i === 0 ? 'zvolen' : '') : i < 2 ? 'postup' : '',
  }));
}

export interface SenatPredikceMapaProps {
  mapaUrl: string;
  predikceUrl: string;
  title?: string;
  subtitle?: string;
  source?: string;
}

export default function SenatPredikceMapa({ mapaUrl, predikceUrl, title, subtitle, source }: SenatPredikceMapaProps) {
  const [wrapRef, width] = useWidth<HTMLDivElement>();
  const [data, setData] = useState<MapData | null>(null);
  const [pred, setPred] = useState<Predikce | null>(null);
  const [hover, setHover] = useState<{ o: number; x: number; y: number } | null>(null);
  const [sel, setSel] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetch(mapaUrl).then((r) => r.json()),
      // predikce se mění během večera – vždy čerstvá
      fetch(`${predikceUrl}?t=${Date.now()}`, { cache: 'no-store' }).then((r) => r.json()),
    ]).then(([m, p]) => {
      if (!alive) return;
      setData(m as MapData);
      setPred(p as Predikce);
    });
    return () => { alive = false; };
  }, [mapaUrl, predikceUrl]);

  const height = Math.round(width * 0.56);
  const narrow = width < 560;
  const vol = useMemo(() => (data ? Object.keys(data.kandidati).map(Number).sort((a, b) => a - b) : []), [data]);
  const known = (o: number) => Boolean(pred?.obvody[String(o)]);
  const nKnown = vol.filter(known).length;

  // výchozí výběr: naposledy aktualizovaný obvod
  useEffect(() => {
    if (!pred || sel !== null) return;
    const latest = Object.entries(pred.obvody).sort((a, b) => (b[1].cas ?? '').localeCompare(a[1].cas ?? ''))[0];
    if (latest) setSel(Number(latest[0]));
  }, [pred, sel]);

  const geo = useMemo(() => {
    if (!data || !width) return null;
    const outline: Feature = { type: 'Feature', properties: {}, geometry: data.outline };
    const proj = geoMercator().fitExtent([[4, 4], [width - 4, height - 4]], outline);
    const path = geoPath(proj);
    const a = proj([15, 49.8])!; const b = proj([15, 49.86])!;
    const r = Math.max(1.4, Math.abs(a[1] - b[1]) * 0.87 * 0.3);
    const dots = data.dots.map(([lon, lat, o]) => { const p = proj([lon, lat])!; return { x: p[0], y: p[1], o }; });
    const feats = data.obvody.features.filter((f) => data.kandidati[String(f.properties.o)]);
    const praha = data.obvody.features.filter((f) => f.properties.n.startsWith('Praha'));
    const iw = narrow ? Math.round(width * 0.7) : Math.round(width * 0.42);
    const ih = Math.round(iw * 0.6);
    const ix = Math.round((width - iw) / 2); const iy = height + 10;
    const iproj = geoMercator().fitExtent([[ix + 6, iy + 18], [ix + iw - 6, iy + ih - 6]], { type: 'FeatureCollection', features: praha } as FeatureCollection);
    return { path, ipath: geoPath(iproj), dots, r, feats, praha, inset: { x: ix, y: iy, w: iw, h: ih } };
  }, [data, width, height, narrow]);

  const local = (e: React.PointerEvent) => {
    const box = wrapRef.current?.getBoundingClientRect();
    return box ? { x: e.clientX - box.left, y: e.clientY - box.top } : { x: 0, y: 0 };
  };

  const pick = (o: number) => {
    setSel(o);
    // na mobilu je karta pod mapou mimo obrazovku – posunout k ní
    requestAnimationFrame(() => {
      const el = cardRef.current; if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.top > window.innerHeight - 80) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  };

  const fillFor = (o: number, hl: boolean) => {
    const p = pred?.obvody[String(o)];
    if (hl) return INK;
    if (!p) return '#bdb9ab';
    return p.stav === 'vysledek' ? RED : RED_LIGHT;
  };

  const nameOf = (o: number) => data?.obvody.features.find((f) => f.properties.o === o)?.properties;
  const selProps = sel !== null ? nameOf(sel) : undefined;
  const selPred = sel !== null ? pred?.obvody[String(sel)] : undefined;
  const selRows = sel !== null && data ? poradi(data.kandidati[String(sel)] ?? [], selPred) : [];
  const maxProc = Math.max(50, ...selRows.map((r) => r.proc ?? 0));
  const hoverProps = hover ? nameOf(hover.o) : undefined;
  const hoverLead = hover && data ? poradi(data.kandidati[String(hover.o)] ?? [], pred?.obvody[String(hover.o)])[0] : undefined;

  return (
    <div style={{ clear: 'both' }}>
      <ChartCard title={title} subtitle={subtitle} source={source}>
        <div style={{ fontFamily: FONT, color: INK }}>
          {pred?.ukazka && (
            <div style={{ background: '#fff3cd', border: '1px solid #e6c65c', borderRadius: 4, padding: '6px 10px', marginBottom: 10, fontSize: 14 }}>
              <strong>UKÁZKA:</strong> čísla jsou smyšlená, jen pro náhled vzhledu.
            </div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '6px 16px', marginBottom: 10, fontSize: 14 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px' }}>
              {[[RED_LIGHT, 'predikce'], [RED, 'výsledek'], ['#bdb9ab', 'čekáme na data']].map(([c, l]) => (
                <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ display: 'inline-flex', gap: 2 }}>{[0, 1, 2].map((i) => <span key={i} style={{ width: 7, height: 7, borderRadius: 4, background: c }} />)}</span>
                  {l}
                </span>
              ))}
            </div>
            <div style={{ color: MUTED }}>
              Známe <strong style={{ color: INK }}>{nKnown} z {vol.length || 27}</strong> obvodů{pred?.aktualizace ? ` · aktualizováno ${pred.aktualizace}` : ''}
            </div>
          </div>

          <div ref={wrapRef} style={{ position: 'relative', width: '100%' }} onMouseLeave={() => setHover(null)}>
            {!geo && <div style={{ height: Math.max(height, 240), display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED }}>Načítám mapu…</div>}
            {geo && (
              <svg width={width} height={geo.inset.y + geo.inset.h + 2} role="img" aria-label="Mapa senátních obvodů s průběžnou predikcí" style={{ display: 'block', touchAction: 'manipulation' }}>
                <g pointerEvents="none">
                  {geo.dots.map((d, i) => {
                    const on = vol.includes(d.o);
                    return <circle key={i} cx={d.x} cy={d.y} r={on ? geo.r * 1.12 : geo.r} fill={on ? fillFor(d.o, hover?.o === d.o || sel === d.o) : DOT} />;
                  })}
                </g>
                {geo.feats.map((f) => {
                  const o = f.properties.o; const hl = hover?.o === o || sel === o;
                  return (
                    <path key={o} d={geo.path(f) ?? ''} fill={known(o) ? RED : '#8a8676'} fillOpacity={hl ? 0.2 : 0.06}
                      stroke={hl ? INK : known(o) ? RED : '#8a8676'} strokeOpacity={hl ? 1 : 0.35} strokeWidth={hl ? 1.6 : 0.8}
                      style={{ cursor: 'pointer' }}
                      onPointerMove={(e) => setHover({ o, ...local(e) })}
                      onPointerLeave={() => setHover(null)}
                      onClick={() => pick(o)} />
                  );
                })}
                <g>
                  <rect x={geo.inset.x} y={geo.inset.y} width={geo.inset.w} height={geo.inset.h} rx={6} fill="#fff" stroke="#e0ddd2" />
                  <text x={geo.inset.x + 8} y={geo.inset.y + 14} fontSize={12} fontWeight={700} fill={MUTED} style={{ fontFamily: FONT }}>Praha</text>
                  {geo.praha.map((f) => {
                    const o = f.properties.o; const on = vol.includes(o); const hl = hover?.o === o || sel === o;
                    return (
                      <path key={o} d={geo.ipath(f) ?? ''} fill={on ? fillFor(o, hl) : '#ebe8de'} stroke="#fff" strokeWidth={1}
                        style={{ cursor: on ? 'pointer' : 'default' }}
                        onPointerMove={on ? (e) => setHover({ o, ...local(e) }) : () => setHover(null)}
                        onClick={on ? () => pick(o) : undefined} />
                    );
                  })}
                </g>
              </svg>
            )}
            {hover && hoverProps && (
              <div style={{
                position: 'absolute', pointerEvents: 'none', zIndex: 2, top: Math.max(0, hover.y - 64),
                left: hover.x > width - 230 ? undefined : hover.x + 14, right: hover.x > width - 230 ? width - hover.x + 14 : undefined,
                background: '#fff', border: '1px solid #e6e3d9', borderRadius: 6, padding: '7px 10px', fontSize: 13, lineHeight: 1.4,
                boxShadow: '0 4px 14px rgba(16,20,50,.12)', maxWidth: 230,
              }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Obvod {hoverProps.o} – {hoverProps.n}</div>
                <div style={{ color: MUTED }}>
                  {known(hover.o) && hoverLead?.proc !== undefined ? `Vede ${hoverLead.n} (${pct(hoverLead.proc)})` : 'Zatím bez dat'}
                </div>
              </div>
            )}
          </div>

          {/* karta vybraného obvodu */}
          <div ref={cardRef} style={{ marginTop: 14, background: '#fff', border: '1px solid #e6e3d9', borderRadius: 8, padding: narrow ? '12px 12px' : '14px 18px' }}>
            {!selProps && <div style={{ color: MUTED, fontSize: 15 }}>Klikněte nebo ťukněte na obvod v mapě.</div>}
            {selProps && (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '4px 10px', marginBottom: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: 19 }}>Obvod {selProps.o} – {selProps.n}</div>
                  <span style={{
                    fontSize: 12, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 10,
                    background: !selPred ? '#ebe8de' : selPred.stav === 'vysledek' ? RED : RED_LIGHT, color: !selPred ? MUTED : selPred.stav === 'vysledek' ? '#fff' : INK,
                  }}>
                    {!selPred ? 'čekáme na data' : selPred.stav === 'vysledek' ? 'výsledek' : 'predikce'}
                  </span>
                </div>
                <div style={{ color: MUTED, fontSize: 14, marginBottom: 10 }}>
                  {[
                    selPred?.cas ? `aktualizace ${selPred.cas}` : '',
                    selPred?.secteno !== undefined ? `sečteno ${pct(selPred.secteno)} okrsků` : '',
                    selProps.sen ? (selProps.obh?.startsWith('ano') ? `mandát obhajuje ${selProps.sen}` : 'bez obhájce mandátu') : '',
                  ].filter(Boolean).join(' · ')}
                </div>
                <div style={{ display: 'grid', gap: 7 }}>
                  {selRows.map((r) => (
                    <div key={r.c}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 15 }}>
                        <span>
                          <strong>{r.n}</strong> <span style={{ color: MUTED }}>· {r.s}</span>
                          {r.role === 'postup' && <span style={{ marginLeft: 6, fontSize: 12, fontWeight: 700, color: BLUE }}>→ 2. kolo</span>}
                          {r.role === 'zvolen' && <span style={{ marginLeft: 6, fontSize: 12, fontWeight: 700, color: RED }}>zvolen/a v 1. kole</span>}
                        </span>
                        <strong style={{ whiteSpace: 'nowrap' }}>{r.proc !== undefined ? pct(r.proc) : '–'}</strong>
                      </div>
                      <div style={{ height: 8, background: '#f1efe7', borderRadius: 4, marginTop: 3, overflow: 'hidden' }}>
                        {r.proc !== undefined && (
                          <div style={{ width: `${(r.proc / maxProc) * 100}%`, height: '100%', borderRadius: 4, background: r.role ? (r.role === 'zvolen' ? RED : BLUE) : '#b8b4a6' }} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {selPred?.pozn && <div style={{ marginTop: 10, fontSize: 14 }}>{selPred.pozn}</div>}
              </>
            )}
          </div>
        </div>
      </ChartCard>
    </div>
  );
}
