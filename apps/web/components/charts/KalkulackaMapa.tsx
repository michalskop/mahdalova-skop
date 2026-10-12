'use client';

// Mapa-rozcestník Volební kalkulačky 2026. Dva režimy:
//   mode="senat" – 27 senátních obvodů, kde se letos volí (polygony + tečkový podklad)
//   mode="mesta" – 73 měst s komunální kalkulačkou (body)
// Klik / ťuknutí otevře okno s vloženou kalkulačkou. Okno se NEzavírá kliknutím mimo,
// jen vědomě: křížkem, tlačítkem dole nebo klávesou Esc.
// Data: kalkulacky-mapa.json (polygony obvodů z ČSÚ, souřadnice měst z volebních okrsků),
// sestavuje skript build_data.py (viz článek).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { geoMercator, geoPath } from 'd3-geo';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import ChartCard from './ChartCard';

const BLUE = '#0070F4';     // modrá z loga Volební kalkulačky
const RED = '#D04646';      // červená z loga Volební kalkulačky
const INK = '#101432';      // brandNavy.9
const MUTED = '#4c4f8e';    // brandNavy.7
const DOT = '#d6d3c7';
const FONT = 'var(--font-roboto-condensed), Arial, sans-serif';
const EMBED = 'https://www.volebnikalkulacka.cz/embed/datatimes/volby';
const WEB = 'https://www.volebnikalkulacka.cz/volby';

// popisky velkých měst: strana, na které popisek přiléhá k bodu (volí se tak, aby nezakrýval sousední města)
type Side = 'r' | 'l' | 't' | 'b' | 'tl' | 'tr';
const LABELS: Record<string, Side> = {
  'Praha': 'r', 'Brno': 'r', 'Ostrava': 'l', 'Plzeň': 'r', 'Liberec': 't', 'Olomouc': 'r',
  'České Budějovice': 'r', 'Hradec Králové': 't', 'Pardubice': 'r', 'Ústí nad Labem': 'tl',
  'Zlín': 'r', 'Jihlava': 'r', 'Karlovy Vary': 'r',
};
// na mobilu jen největší města, jinak by se popisky překrývaly
const NARROW_LABELS = new Set(['Praha', 'Brno', 'Ostrava', 'Plzeň']);
// posun popisku od středu bodu o poloměru r (font 13 px: střed písma ≈ baseline − 4,5 px)
function labelPos(side: Side, r: number): [number, number, 'start' | 'middle' | 'end'] {
  const g = r + 3;
  switch (side) {
    case 'r': return [g, 4.5, 'start'];
    case 'l': return [-g, 4.5, 'end'];
    case 't': return [0, -g - 1, 'middle'];
    case 'b': return [0, g + 10, 'middle'];
    case 'tl': return [-r * 0.6, -r - 2, 'end'];
    case 'tr': return [r * 0.6, -r - 2, 'start'];
  }
}

type ObvodProps = { o: number; n: string; vol?: number; prip?: number; slug?: string; kand?: number; sen?: string; obh?: string };
type Mesto = { n: string; s: string; lon: number; lat: number; kraj?: string; sub?: number };
type MapData = {
  obvody: FeatureCollection<Geometry, ObvodProps>;
  outline: Geometry;
  dots: [number, number, number][];
  mesta: Mesto[];
};
type Target = { title: string; sub: string; embed: string; web: string };

const pl = (n: number, one: string, few: string, many: string) => (n === 1 ? one : n >= 2 && n <= 4 ? few : many);

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

function senatTarget(p: ObvodProps): Target {
  const bits = [
    p.kand ? `${p.kand} ${pl(p.kand, 'kandidát', 'kandidáti', 'kandidátů')}` : '',
    p.sen ? (p.obh?.startsWith('ano') ? `mandát obhajuje ${p.sen}` : 'bez obhájce mandátu') : '',
  ].filter(Boolean);
  return {
    title: `Senátní obvod ${p.o} – ${p.n}`,
    sub: bits.join(' · '),
    embed: `${EMBED}/senatni-2026/${p.slug}/uvod`,
    web: `${WEB}/senatni-2026/${p.slug}/uvod`,
  };
}

function mestoTarget(m: Mesto): Target {
  return {
    title: `${m.n} – komunální volby 2026`,
    sub: [m.kraj, m.sub ? `${m.sub} ${pl(m.sub, 'kandidující strana', 'kandidující strany', 'kandidujících stran')}` : ''].filter(Boolean).join(' · '),
    embed: `${EMBED}/komunalni-2026/${m.s}/uvod`,
    web: `${WEB}/komunalni-2026/${m.s}/uvod`,
  };
}

// ---------------------------------------------------------------------------
// Vyskakovací okno s kalkulačkou
// ---------------------------------------------------------------------------
function KalkulackaOkno({ target, onClose }: { target: Target; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return createPortal(
    // Klik na pozadí okno záměrně nezavírá.
    <div
      role="dialog"
      aria-modal="true"
      aria-label={target.title}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(16,20,50,.78)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'min(3vh, 24px) min(3vw, 24px)',
      }}
    >
      <div
        className="vk-okno"
        style={{
          width: '100%', maxWidth: 940, height: '100%', background: '#fff', borderRadius: 10,
          display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,.45)',
          fontFamily: FONT, color: INK,
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '10px 10px 10px 16px',
          background: `linear-gradient(90deg, ${BLUE} 0%, #7a5bb0 55%, ${RED} 100%)`, color: '#fff',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 18, lineHeight: 1.2 }}>{target.title}</div>
            {target.sub && <div style={{ fontSize: 14, opacity: 0.92, lineHeight: 1.3 }}>{target.sub}</div>}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Zavřít kalkulačku"
            title="Zavřít kalkulačku"
            style={{
              flex: '0 0 auto', width: 44, height: 44, borderRadius: 22, border: '2px solid rgba(255,255,255,.85)',
              background: 'rgba(16,20,50,.25)', color: '#fff', fontSize: 26, lineHeight: '38px', cursor: 'pointer', padding: 0,
            }}
          >
            ×
          </button>
        </div>
        <iframe
          src={target.embed}
          title={`Volební kalkulačka – ${target.title}`}
          style={{ flex: 1, width: '100%', border: 0, display: 'block', background: '#fff' }}
          allow="clipboard-write; web-share"
        />
        <div style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          padding: '8px 12px', borderTop: '1px solid #e6e3d9', background: '#f8f6f0', fontSize: 14,
        }}>
          <a href={target.web} target="_blank" rel="noopener noreferrer" style={{ color: MUTED }}>
            Otevřít na volebnikalkulacka.cz ↗
          </a>
          <button
            type="button"
            onClick={onClose}
            style={{
              fontFamily: FONT, fontSize: 15, fontWeight: 700, padding: '8px 16px', borderRadius: 6, cursor: 'pointer',
              border: 'none', background: INK, color: '#fff',
            }}
          >
            Zavřít a vrátit se na mapu
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ---------------------------------------------------------------------------
// Mapa
// ---------------------------------------------------------------------------
export interface KalkulackaMapaProps {
  dataUrl: string;
  mode: 'senat' | 'mesta';
  title?: string;
  subtitle?: string;
  source?: string;
}

export default function KalkulackaMapa({ dataUrl, mode, title, subtitle, source }: KalkulackaMapaProps) {
  const [wrapRef, width] = useWidth<HTMLDivElement>();
  const [data, setData] = useState<MapData | null>(null);
  const [hover, setHover] = useState<{ key: string; x: number; y: number } | null>(null);
  const [open, setOpen] = useState<Target | null>(null);
  const close = useCallback(() => setOpen(null), []);
  // obvod, pro který kalkulačka ještě neběží, se neotevírá
  const openObvod = (p: ObvodProps) => { if (!p.prip) setOpen(senatTarget(p)); };

  useEffect(() => {
    let alive = true;
    fetch(dataUrl).then((r) => r.json()).then((d) => { if (alive) setData(d as MapData); });
    return () => { alive = false; };
  }, [dataUrl]);

  const height = Math.round(width * 0.56);
  const narrow = width < 560;

  const geo = useMemo(() => {
    if (!data || !width) return null;
    const outline: Feature = { type: 'Feature', properties: {}, geometry: data.outline };
    const proj = geoMercator().fitExtent([[4, 4], [width - 4, height - 4]], outline);
    const path = geoPath(proj);
    const vol = data.obvody.features.filter((f) => f.properties.vol);
    // vzdálenost sousedních teček v px → poloměr
    const a = proj([15, 49.8])!; const b = proj([15, 49.86])!;
    const r = Math.max(1.4, Math.abs(a[1] - b[1]) * 0.87 * 0.3);
    const dots = data.dots.map(([lon, lat, o]) => { const p = proj([lon, lat])!; return { x: p[0], y: p[1], o }; });
    const mesta = data.mesta.map((m) => { const p = proj([m.lon, m.lat])!; return { ...m, x: p[0], y: p[1] }; });
    // výřez Prahy (obvody 17–27) – v celé mapě jsou pražské obvody příliš malé
    const praha = data.obvody.features.filter((f) => f.properties.n.startsWith('Praha'));
    // výřez leží pod mapou (v rohu by zakrýval severovýchod Čech)
    const iw = narrow ? Math.round(width * 0.7) : Math.round(width * 0.42);
    const ih = Math.round(iw * 0.6);
    const ix = Math.round((width - iw) / 2); const iy = height + 10;
    const iproj = geoMercator().fitExtent([[ix + 6, iy + 18], [ix + iw - 6, iy + ih - 6]], { type: 'FeatureCollection', features: praha } as FeatureCollection);
    return { path, ipath: geoPath(iproj), vol, dots, r, mesta, praha, inset: { x: ix, y: iy, w: iw, h: ih } };
  }, [data, width, height, narrow]);

  const senatOptions = useMemo(
    () => (data ? data.obvody.features.filter((f) => f.properties.vol).map((f) => f.properties).sort((a, b) => a.o - b.o) : []),
    [data],
  );

  // nejbližší město k ukazateli (body ve Slezsku leží těsně u sebe)
  const nearestCity = (x: number, y: number) => {
    if (!geo) return null;
    let best: (typeof geo.mesta)[number] | null = null; let bd = Infinity;
    for (const m of geo.mesta) { const d = (m.x - x) ** 2 + (m.y - y) ** 2; if (d < bd) { bd = d; best = m; } }
    return best && bd < (narrow ? 26 : 20) ** 2 ? best : null;
  };

  const local = (e: React.PointerEvent | React.MouseEvent) => {
    const box = wrapRef.current?.getBoundingClientRect();
    return box ? { x: e.clientX - box.left, y: e.clientY - box.top } : { x: 0, y: 0 };
  };

  const hoverObvod = mode === 'senat' && hover ? senatOptions.find((p) => `o${p.o}` === hover.key) : undefined;
  const hoverMesto = mode === 'mesta' && hover && geo ? geo.mesta.find((m) => `m${m.s}` === hover.key) : undefined;

  const cr = geo ? Math.max(4.5, geo.r * 2.3) : 5;

  return (
    // clear: mapa potřebuje celou šířku sloupce, nesmí obtékat plovoucí bannery
    <div style={{ clear: 'both' }}>
    <ChartCard title={title} subtitle={subtitle} source={source}>
      <div style={{ fontFamily: FONT, color: INK }}>
        {/* Legenda + výběr ze seznamu (náhrada za mapu, funguje i s klávesnicí) */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px 16px', marginBottom: 10, fontSize: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {mode === 'senat' ? (
              <>
                <span style={{ display: 'inline-flex', gap: 2 }}>
                  {[0, 1, 2].map((i) => <span key={i} style={{ width: 7, height: 7, borderRadius: 4, background: RED }} />)}
                </span>
                <span>Obvody, kde se letos volí – klikněte nebo ťukněte na svůj</span>
              </>
            ) : (
              <>
                <span style={{ width: 12, height: 12, borderRadius: 6, background: BLUE, border: '2px solid #fff', boxShadow: `0 0 0 1px ${BLUE}` }} />
                <span>Města s Volební kalkulačkou – klikněte nebo ťukněte na své</span>
              </>
            )}
          </div>
          <select
            aria-label={mode === 'senat' ? 'Vyberte senátní obvod' : 'Vyberte město'}
            value=""
            onChange={(e) => {
              const v = e.target.value;
              if (!v || !data) return;
              if (mode === 'senat') { const p = senatOptions.find((x) => String(x.o) === v); if (p) openObvod(p); }
              else { const m = data.mesta.find((x) => x.s === v); if (m) setOpen(mestoTarget(m)); }
            }}
            style={{ fontFamily: FONT, fontSize: 15, padding: '6px 8px', border: '1px solid #cfccc0', borderRadius: 4, background: '#fff', color: INK, maxWidth: '100%' }}
          >
            <option value="">{mode === 'senat' ? 'Vyberte obvod ze seznamu…' : 'Vyberte město ze seznamu…'}</option>
            {mode === 'senat'
              ? senatOptions.map((p) => <option key={p.o} value={p.o} disabled={Boolean(p.prip)}>{p.o} – {p.n}{p.prip ? ' (bez kalkulačky)' : ''}</option>)
              : data?.mesta.map((m) => <option key={m.s} value={m.s}>{m.n}</option>)}
          </select>
        </div>

        <div ref={wrapRef} style={{ position: 'relative', width: '100%' }} onMouseLeave={() => setHover(null)}>
          {!geo && <div style={{ height: Math.max(height, 240), display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED }}>Načítám mapu…</div>}
          {geo && data && (
            <svg
              width={width}
              height={mode === 'senat' ? geo.inset.y + geo.inset.h + 2 : height}
              role="img"
              aria-label={mode === 'senat' ? 'Mapa senátních obvodů s Volební kalkulačkou' : 'Mapa 73 měst s Volební kalkulačkou'}
              style={{ display: 'block', touchAction: 'manipulation' }}
              onPointerMove={mode === 'mesta' ? (e) => {
                const p = local(e); const m = nearestCity(p.x, p.y);
                setHover(m ? { key: `m${m.s}`, ...p } : null);
              } : undefined}
              onClick={mode === 'mesta' ? (e) => {
                const p = local(e); const m = nearestCity(p.x, p.y);
                if (m) setOpen(mestoTarget(m));
              } : undefined}
            >
              {/* tečkový podklad */}
              <g pointerEvents="none">
                {geo.dots.map((d, i) => {
                  const ob = mode === 'senat' ? senatOptions.find((p) => p.o === d.o) : undefined;
                  const hl = hoverObvod && hoverObvod.o === d.o && !ob?.prip;
                  return <circle key={i} cx={d.x} cy={d.y} r={ob ? geo.r * 1.12 : geo.r} fill={hl ? INK : ob ? RED : DOT} fillOpacity={ob?.prip ? 0.4 : 1} />;
                })}
              </g>

              {mode === 'senat' && geo.vol.map((f) => {
                const p = f.properties; const hl = hoverObvod?.o === p.o && !p.prip;
                return (
                  <path
                    key={p.o}
                    d={geo.path(f) ?? ''}
                    fill={RED}
                    fillOpacity={hl ? 0.22 : 0.08}
                    stroke={hl ? INK : RED}
                    strokeOpacity={hl ? 1 : 0.35}
                    strokeWidth={hl ? 1.6 : 0.8}
                    style={{ cursor: p.prip ? 'default' : 'pointer' }}
                    onPointerMove={(e) => setHover({ key: `o${p.o}`, ...local(e) })}
                    onPointerLeave={() => setHover(null)}
                    onClick={() => openObvod(p)}
                  />
                );
              })}

              {mode === 'mesta' && (
                <g pointerEvents="none">
                  {geo.mesta.map((m) => {
                    const hl = hoverMesto?.s === m.s;
                    return <circle key={m.s} cx={m.x} cy={m.y} r={hl ? cr * 1.45 : cr} fill={hl ? INK : BLUE} stroke="#fff" strokeWidth={1.6} />;
                  })}
                  {geo.mesta.filter((m) => LABELS[m.n] && (!narrow || NARROW_LABELS.has(m.n))).map((m) => {
                    const [dx, dy, anchor] = labelPos(LABELS[m.n], hoverMesto?.s === m.s ? cr * 1.45 : cr);
                    return (
                      <text key={m.s} x={m.x + dx} y={m.y + dy} textAnchor={anchor} fontSize={narrow ? 12 : 13} fontWeight={700} fill={INK}
                        stroke="#f8f6f0" strokeWidth={3} strokeLinejoin="round" paintOrder="stroke" style={{ fontFamily: FONT }}>
                        {m.n}
                      </text>
                    );
                  })}
                </g>
              )}

              {/* výřez Prahy */}
              {mode === 'senat' && (
                <g>
                  <rect x={geo.inset.x} y={geo.inset.y} width={geo.inset.w} height={geo.inset.h} rx={6} fill="#fff" stroke="#e0ddd2" />
                  <text x={geo.inset.x + 8} y={geo.inset.y + 14} fontSize={12} fontWeight={700} fill={MUTED} style={{ fontFamily: FONT }}>Praha</text>
                  {geo.praha.map((f) => {
                    const p = f.properties; const on = Boolean(p.vol); const hl = hoverObvod?.o === p.o;
                    return (
                      <path
                        key={p.o}
                        d={geo.ipath(f) ?? ''}
                        fill={hl ? INK : on ? RED : '#ebe8de'}
                        stroke="#fff"
                        strokeWidth={1}
                        style={{ cursor: on ? 'pointer' : 'default' }}
                        onPointerMove={on ? (e) => setHover({ key: `o${p.o}`, ...local(e) }) : () => setHover(null)}
                        onClick={on ? () => openObvod(p) : undefined}
                      />
                    );
                  })}
                </g>
              )}
            </svg>
          )}

          {/* tooltip */}
          {(hoverObvod || hoverMesto) && hover && (
            <div style={{
              position: 'absolute', pointerEvents: 'none', zIndex: 2,
              top: Math.max(0, hover.y - 64),
              left: hover.x > width - 230 ? undefined : hover.x + 14,
              right: hover.x > width - 230 ? width - hover.x + 14 : undefined,
              background: '#fff', border: '1px solid #e6e3d9', borderRadius: 6, padding: '7px 10px',
              fontSize: 13, lineHeight: 1.4, boxShadow: '0 4px 14px rgba(16,20,50,.12)', maxWidth: 230,
            }}>
              {hoverObvod && (
                <>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Obvod {hoverObvod.o} – {hoverObvod.n}</div>
                  <div style={{ color: MUTED }}>{senatTarget(hoverObvod).sub}</div>
                </>
              )}
              {hoverMesto && (
                <>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{hoverMesto.n}</div>
                  <div style={{ color: MUTED }}>{mestoTarget(hoverMesto).sub}</div>
                </>
              )}
              <div style={{ marginTop: 3, color: mode === 'senat' ? RED : BLUE, fontWeight: 700 }}>
                {hoverObvod?.prip ? 'Kalkulačka pro tento obvod není' : 'Otevřít kalkulačku →'}
              </div>
            </div>
          )}
        </div>
      </div>
      {open && <KalkulackaOkno target={open} onClose={close} />}
    </ChartCard>
    </div>
  );
}
