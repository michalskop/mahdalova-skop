'use client';

// "Skutečná velikost" – a modern remake of the classic *The True Size Of…* toy,
// built on the world TopoJSON + d3-geo stack already in the repo.
//
// Core mechanic: drag a country across a static Mercator basemap. As it moves to
// a new latitude the shape is RE-PROJECTED (not uniformly scaled), so its size on
// the map is exactly what Mercator would draw there – Greenland is huge in the
// north and shrinks dramatically over the equator.
//
// Two modes:
//   • Volné hraní – add any country and compare freely.
//   • Výzva       – a scored round: a northern country starts looking huge; drag
//                   it onto an equally-large equatorial country to reveal its true
//                   size. Score rewards matching both position and size.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as d3geo from 'd3-geo';
import * as topojson from 'topojson-client';
import { COUNTRIES } from './countries';

const WORLD_URL = '/specialy/dpbp/data/world-countries-110m.json';

// Palette from ThemeProvider tokens.
const OCEAN = '#f8f6f0'; // background[2]
const LAND = '#e9e9dd'; // background[5]
const LAND_BORDER = '#c8c8bc'; // background[8]
const NAVY = '#101432'; // brandNavy[9]
const CARD = '#fdfbf7'; // background[1]
const RED = '#de1743'; // brand[6]
const TEAL = '#0e839e'; // brandTeal[6]
const UI_FONT = "'IBM Plex Sans', system-ui, -apple-system, sans-serif";

const PIECE_COLORS = ['#de1743', '#0e839e', '#f76800', '#4a51ab', '#639e0a', '#a03250'];

const PRESETS = [
  'Greenland',
  'Russia',
  'Canada',
  'United States of America',
  'Australia',
  'Brazil',
  'India',
  'China',
  'Dem. Rep. Congo',
  'Algeria',
  'Argentina',
  'Kazakhstan',
  'Sweden',
  'France',
  'Czechia',
];

// Northern / high-distortion countries that make dramatic challenge sources.
const CHALLENGE_SOURCES = [
  'Greenland',
  'Sweden',
  'Norway',
  'Finland',
  'Kazakhstan',
  'Iceland',
  'United Kingdom',
  'Germany',
  'France',
  'Ukraine',
  'Mongolia',
  'Poland',
];

// Recognisable lower-latitude countries used as challenge targets.
const CHALLENGE_TARGETS = [
  'Algeria',
  'Dem. Rep. Congo',
  'Saudi Arabia',
  'Argentina',
  'India',
  'Mexico',
  'Sudan',
  'South Africa',
  'Egypt',
  'Angola',
  'Chad',
  'Niger',
  'Mali',
  'Nigeria',
  'Colombia',
  'Peru',
  'Bolivia',
  'Ethiopia',
  'Tanzania',
  'Chile',
  'Madagascar',
  'Thailand',
  'Spain',
  'Turkey',
  'Myanmar',
  'Somalia',
];

const DEG = Math.PI / 180;

function normLon(d: number): number {
  let x = d;
  while (x > 180) x -= 360;
  while (x < -180) x += 360;
  return x;
}
function mercY(lat: number): number {
  const l = Math.max(-85, Math.min(85, lat));
  return Math.log(Math.tan(Math.PI / 4 + (l * DEG) / 2));
}
function ringShoelace(pts: Array<[number, number]>): number {
  let a = 0;
  for (let i = 0, n = pts.length; i < n; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % n];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a / 2);
}
function eachRing(geometry: any, cb: (ring: number[][]) => void): void {
  const polys = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  for (const poly of polys) for (const ring of poly) cb(ring);
}

// Mercator areal distortion at the geometry's current latitude: mercator area /
// true area. ~1 at the equator, ~16 for Greenland at home.
function distortionFactor(geometry: any, clon: number): number {
  let merc = 0;
  let tru = 0;
  eachRing(geometry, (ring) => {
    const xs = ring.map((c) => normLon(c[0] - clon) * DEG);
    merc += ringShoelace(ring.map((c, i) => [xs[i], mercY(c[1])]));
    tru += ringShoelace(ring.map((c, i) => [xs[i], Math.sin(c[1] * DEG)]));
  });
  return tru > 0 ? merc / tru : 1;
}

// Shift a feature so its centroid moves to (tLon, tLat), keeping the true shape.
function placeGeometry(geometry: any, orig: [number, number], tLon: number, tLat: number): any {
  const dLon = tLon - orig[0];
  const dLat = tLat - orig[1];
  const move = (c: number[]): number[] => [c[0] + dLon, Math.max(-82, Math.min(82, c[1] + dLat))];
  const walk = (coords: any): any => (typeof coords[0] === 'number' ? move(coords) : coords.map(walk));
  return { type: 'Feature', properties: {}, geometry: { ...geometry, coordinates: walk(geometry.coordinates) } };
}

function fmtX(n: number): string {
  return (n < 10 ? n.toFixed(1) : String(Math.round(n))).replace('.', ',');
}
function deaccent(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

type GeoFeature = { type: 'Feature'; properties: { name: string }; geometry: any };

interface Ctx {
  projection: any;
  path: any;
  width: number;
  height: number;
  features: GeoFeature[];
  byName: Record<string, GeoFeature>;
  centroidByName: Record<string, [number, number]>;
  areaByName: Record<string, number>; // true area (km²)
}

interface Piece {
  id: number;
  name: string;
  cs: string;
  color: string;
  lon: number;
  lat: number;
}

function PlacedPiece({
  piece,
  ctx,
  active,
  onPointerDown,
  showFactor = true,
}: {
  piece: Piece;
  ctx: Ctx;
  active: boolean;
  onPointerDown: (e: React.PointerEvent, id: number) => void;
  showFactor?: boolean;
}) {
  const feature = ctx.byName[piece.name];
  const orig = ctx.centroidByName[piece.name];
  const { d, factor, labelXY } = useMemo(() => {
    const placed = placeGeometry(feature.geometry, orig, piece.lon, piece.lat);
    return {
      d: ctx.path(placed as any) || '',
      factor: distortionFactor(placed.geometry, piece.lon),
      labelXY: ctx.path.centroid(placed as any) as [number, number],
    };
  }, [feature, orig, piece.lon, piece.lat, ctx]);

  return (
    <g style={{ cursor: 'grab' }} onPointerDown={(e) => onPointerDown(e, piece.id)}>
      <path
        d={d}
        fill={piece.color}
        fillOpacity={active ? 0.85 : 0.65}
        stroke={piece.color}
        strokeWidth={active ? 1.6 : 1.1}
        strokeLinejoin="round"
      />
      {Number.isFinite(labelXY?.[0]) && (
        <g transform={`translate(${labelXY[0]}, ${labelXY[1]})`} style={{ pointerEvents: 'none' }}>
          <text textAnchor="middle" y={-2} fontFamily={UI_FONT} fontSize={11} fontWeight={700} fill="#fff" stroke={piece.color} strokeWidth={0.5} paintOrder="stroke">
            {piece.cs}
          </text>
          {showFactor && (
            <text textAnchor="middle" y={11} fontFamily={UI_FONT} fontSize={9.5} fontWeight={600} fill="#fff" stroke={piece.color} strokeWidth={0.5} paintOrder="stroke">
              ×{fmtX(factor)}
            </text>
          )}
        </g>
      )}
    </g>
  );
}

type Mode = 'sandbox' | 'challenge';
interface Challenge {
  source: string;
  target: string;
}

export default function TrueSizeGame() {
  const [ctx, setCtx] = useState<Ctx | null>(null);
  const [mode, setMode] = useState<Mode>('sandbox');

  // sandbox state
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [query, setQuery] = useState('');

  // challenge state
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [source, setSource] = useState<Piece | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const nextId = useRef(1);
  const drag = useRef<{ id: number; offLon: number; offLat: number } | null>(null);
  const raf = useRef<number>(0);

  useEffect(() => {
    let cancelled = false;
    fetch(WORLD_URL)
      .then((r) => r.json())
      .then((world: { objects: { countries: unknown } }) => {
        if (cancelled) return;
        const fc = topojson.feature(world as never, world.objects.countries as never) as unknown as {
          features: GeoFeature[];
        };
        const byName: Record<string, GeoFeature> = {};
        const centroidByName: Record<string, [number, number]> = {};
        const areaByName: Record<string, number> = {};
        for (const f of fc.features) {
          byName[f.properties.name] = f;
          centroidByName[f.properties.name] = d3geo.geoCentroid(f as any) as [number, number];
          areaByName[f.properties.name] = d3geo.geoArea(f as any) * 6371.0088 * 6371.0088;
        }
        const width = 720;
        const basemapFeatures = fc.features.filter((f) => {
          const c = centroidByName[f.properties.name];
          return f.properties.name !== 'Antarctica' && c && c[1] > -58;
        });
        const projection = d3geo.geoMercator();
        projection.fitWidth(width, { type: 'FeatureCollection', features: basemapFeatures } as any);
        const path0 = d3geo.geoPath(projection);
        const b = path0.bounds({ type: 'FeatureCollection', features: basemapFeatures } as any);
        const height = Math.ceil(b[1][1] - b[0][1]);
        projection.translate([projection.translate()[0], projection.translate()[1] - b[0][1]]);
        setCtx({
          projection,
          path: d3geo.geoPath(projection),
          width,
          height,
          features: basemapFeatures,
          byName,
          centroidByName,
          areaByName,
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const makePiece = useCallback(
    (name: string, color: string): Piece | null => {
      if (!ctx) return null;
      const c = ctx.centroidByName[name];
      if (!c) return null;
      return { id: nextId.current++, name, cs: COUNTRIES[name]?.cs || name, color, lon: c[0], lat: c[1] };
    },
    [ctx],
  );

  const addPiece = useCallback(
    (name: string) => {
      if (!ctx) return;
      setPieces((prev) => {
        if (prev.some((p) => p.name === name)) return prev;
        const p = makePiece(name, PIECE_COLORS[prev.length % PIECE_COLORS.length]);
        return p ? [...prev, p] : prev;
      });
      setActiveId(null);
      setQuery('');
    },
    [ctx, makePiece],
  );

  const newChallenge = useCallback(() => {
    if (!ctx) return;
    // pick a northern source present in the data
    const sources = CHALLENGE_SOURCES.filter((n) => ctx.byName[n]);
    const src = sources[Math.floor(Math.random() * sources.length)];
    const srcArea = ctx.areaByName[src];
    // best equal-area target
    let best = '';
    let bestErr = Infinity;
    for (const t of CHALLENGE_TARGETS) {
      if (!ctx.byName[t] || t === src) continue;
      const err = Math.abs(Math.log(ctx.areaByName[t] / srcArea));
      if (err < bestErr) {
        bestErr = err;
        best = t;
      }
    }
    if (!best) return;
    setChallenge({ source: src, target: best });
    setSource(makePiece(src, RED));
  }, [ctx, makePiece]);

  const startMode = useCallback(
    (m: Mode) => {
      setMode(m);
      setActiveId(null);
      drag.current = null;
      if (m === 'challenge' && !challenge) newChallenge();
    },
    [challenge, newChallenge],
  );

  const pointerToLonLat = useCallback(
    (clientX: number, clientY: number): [number, number] | null => {
      const svg = svgRef.current;
      if (!svg || !ctx) return null;
      const rect = svg.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * ctx.width;
      const y = ((clientY - rect.top) / rect.height) * ctx.height;
      const inv = ctx.projection.invert?.([x, y]);
      return inv ? [inv[0], inv[1]] : null;
    },
    [ctx],
  );

  const onPiecePointerDown = useCallback(
    (e: React.PointerEvent, id: number) => {
      e.preventDefault();
      const ll = pointerToLonLat(e.clientX, e.clientY);
      const piece = mode === 'challenge' ? source : pieces.find((p) => p.id === id);
      if (!ll || !piece || piece.id !== id) return;
      drag.current = { id, offLon: piece.lon - ll[0], offLat: piece.lat - ll[1] };
      setActiveId(id);
      if (mode === 'sandbox') {
        setPieces((prev) => {
          const idx = prev.findIndex((p) => p.id === id);
          if (idx < 0) return prev;
          const copy = prev.slice();
          const [pc] = copy.splice(idx, 1);
          copy.push(pc);
          return copy;
        });
      }
    },
    [mode, source, pieces, pointerToLonLat],
  );

  useEffect(() => {
    function onMove(e: PointerEvent) {
      if (!drag.current) return;
      const ll = pointerToLonLat(e.clientX, e.clientY);
      if (!ll) return;
      const { id, offLon, offLat } = drag.current;
      const lon = ll[0] + offLon;
      const lat = ll[1] + offLat;
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        setPieces((prev) => prev.map((p) => (p.id === id ? { ...p, lon, lat } : p)));
        setSource((prev) => (prev && prev.id === id ? { ...prev, lon, lat } : prev));
      });
    }
    function onUp() {
      drag.current = null;
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [pointerToLonLat]);

  // ── challenge scoring (live) ──────────────────────────────────────────────
  const score = useMemo(() => {
    if (mode !== 'challenge' || !ctx || !challenge || !source) return null;
    const tFeat = ctx.byName[challenge.target];
    const tCentroid = ctx.path.centroid(tFeat as any) as [number, number];
    const tArea = ctx.path.area(tFeat as any);
    const placed = placeGeometry(ctx.byName[source.name].geometry, ctx.centroidByName[source.name], source.lon, source.lat);
    const sCentroid = ctx.path.centroid(placed as any) as [number, number];
    const sArea = ctx.path.area(placed as any);
    if (!Number.isFinite(sCentroid?.[0]) || !tArea || !sArea) return 0;
    const diag = Math.hypot(ctx.width, ctx.height);
    const posErr = Math.hypot(sCentroid[0] - tCentroid[0], sCentroid[1] - tCentroid[1]) / diag;
    const sizeErr = Math.abs(Math.log(sArea / tArea));
    const val = 1000 * Math.exp(-posErr * 4.5) * Math.exp(-sizeErr * 1.6);
    return Math.max(0, Math.min(1000, Math.round(val)));
  }, [mode, ctx, challenge, source]);

  // search results
  const results = useMemo(() => {
    if (!ctx || query.trim().length < 1) return [] as string[];
    const q = deaccent(query.trim());
    return Object.keys(COUNTRIES)
      .filter((n) => ctx.byName[n] && deaccent(COUNTRIES[n].cs).includes(q))
      .filter((n) => !pieces.some((p) => p.name === n))
      .sort((a, b) => COUNTRIES[a].cs.localeCompare(COUNTRIES[b].cs, 'cs'))
      .slice(0, 8);
  }, [ctx, query, pieces]);

  const shell: React.CSSProperties = {
    margin: '28px 0',
    background: CARD,
    border: `1px solid ${LAND_BORDER}`,
    borderRadius: 10,
    padding: '16px 16px 14px',
    fontFamily: UI_FONT,
    maxWidth: 760,
    marginLeft: 'auto',
    marginRight: 'auto',
  };

  if (!ctx) {
    return (
      <div style={{ ...shell, textAlign: 'center', color: NAVY }}>
        <div style={{ padding: '48px 0', opacity: 0.6 }}>Načítám mapu světa…</div>
      </div>
    );
  }

  const tabBtn = (m: Mode, label: string): React.CSSProperties => ({
    padding: '7px 16px',
    borderRadius: 999,
    border: `1px solid ${mode === m ? NAVY : LAND_BORDER}`,
    background: mode === m ? NAVY : '#fff',
    color: mode === m ? '#fff' : NAVY,
    fontFamily: UI_FONT,
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  });

  const targetFeature = challenge ? ctx.byName[challenge.target] : null;
  const targetD = targetFeature ? ctx.path(targetFeature as any) || '' : '';
  const targetCentroid = targetFeature ? (ctx.path.centroid(targetFeature as any) as [number, number]) : null;

  return (
    <div style={shell}>
      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
        <button style={tabBtn('sandbox', 'Volné hraní')} onClick={() => startMode('sandbox')}>
          Volné hraní
        </button>
        <button style={tabBtn('challenge', 'Výzva')} onClick={() => startMode('challenge')}>
          Výzva 🎯
        </button>
      </div>

      {mode === 'sandbox' ? (
        <>
          <div style={{ textAlign: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>Přetáhni zemi po mapě</div>
            <div style={{ fontSize: 13, color: NAVY, opacity: 0.75, marginTop: 2 }}>
              Táhni zemi k rovníku i k pólům – uvidíš, jak s ní Mercator mění velikost. Číslo ×N ukazuje, kolikrát je na
              dané šířce větší, než ve skutečnosti je.
            </div>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', maxWidth: 320, margin: '0 auto 10px' }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Najdi zemi…"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                border: `1px solid ${LAND_BORDER}`,
                fontFamily: UI_FONT,
                fontSize: 13,
                color: NAVY,
                background: '#fff',
              }}
            />
            {results.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: '#fff',
                  border: `1px solid ${LAND_BORDER}`,
                  borderRadius: 8,
                  marginTop: 4,
                  zIndex: 20,
                  overflow: 'hidden',
                  boxShadow: '0 6px 16px rgba(16,20,50,0.12)',
                }}
              >
                {results.map((n) => (
                  <button
                    key={n}
                    onClick={() => addPiece(n)}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      border: 'none',
                      background: '#fff',
                      color: NAVY,
                      fontFamily: UI_FONT,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    {COUNTRIES[n].cs}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Preset chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 12 }}>
            {PRESETS.map((name) => {
              const used = pieces.some((p) => p.name === name);
              return (
                <button
                  key={name}
                  onClick={() => addPiece(name)}
                  disabled={used}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 999,
                    border: `1px solid ${LAND_BORDER}`,
                    background: used ? '#eeeae2' : '#fff',
                    color: used ? '#a9a496' : NAVY,
                    fontFamily: UI_FONT,
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: used ? 'default' : 'pointer',
                  }}
                >
                  {COUNTRIES[name]?.cs || name}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>
            {challenge ? (
              <>
                Přetáhni <span style={{ color: RED }}>{COUNTRIES[challenge.source]?.cs}</span> na{' '}
                <span style={{ color: TEAL }}>{COUNTRIES[challenge.target]?.cs}</span>
              </>
            ) : (
              'Výzva'
            )}
          </div>
          <div style={{ fontSize: 13, color: NAVY, opacity: 0.75, marginTop: 2 }}>
            Obě země jsou ve skutečnosti skoro stejně velké. Přetáhni tu severní na cílovou tak, aby ji co nejlíp
            překryla – uvidíš, jak se cestou k rovníku scvrkne.
          </div>
        </div>
      )}

      {/* Map */}
      <div style={{ position: 'relative' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${ctx.width} ${ctx.height}`}
          width="100%"
          style={{ display: 'block', background: OCEAN, borderRadius: 8, touchAction: 'none', userSelect: 'none' }}
        >
          {ctx.features.map((f, i) => (
            <path key={i} d={ctx.path(f as any) || ''} fill={LAND} stroke={LAND_BORDER} strokeWidth={0.4} />
          ))}

          {mode === 'sandbox' &&
            pieces.map((p) => (
              <PlacedPiece key={p.id} piece={p} ctx={ctx} active={p.id === activeId} onPointerDown={onPiecePointerDown} />
            ))}

          {mode === 'challenge' && targetFeature && (
            <>
              <path d={targetD} fill={TEAL} fillOpacity={0.16} stroke={TEAL} strokeWidth={1.4} strokeDasharray="4 3" />
              {targetCentroid && Number.isFinite(targetCentroid[0]) && (
                <text
                  x={targetCentroid[0]}
                  y={targetCentroid[1]}
                  textAnchor="middle"
                  fontFamily={UI_FONT}
                  fontSize={11}
                  fontWeight={700}
                  fill={TEAL}
                  style={{ pointerEvents: 'none' }}
                >
                  {COUNTRIES[challenge!.target]?.cs}
                </text>
              )}
              {source && (
                <PlacedPiece piece={source} ctx={ctx} active onPointerDown={onPiecePointerDown} />
              )}
            </>
          )}
        </svg>

        {mode === 'sandbox' && pieces.length === 0 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              color: NAVY,
              opacity: 0.5,
              fontSize: 14,
              fontWeight: 600,
              textAlign: 'center',
              padding: 20,
            }}
          >
            Vyber zemi (chip nebo vyhledávání) a přetáhni ji po mapě
          </div>
        )}
      </div>

      {/* Footer / controls */}
      {mode === 'sandbox' ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <button
            onClick={() => {
              setPieces([]);
              setActiveId(null);
            }}
            disabled={pieces.length === 0}
            style={{
              padding: '7px 14px',
              borderRadius: 8,
              border: `1px solid ${LAND_BORDER}`,
              background: '#fff',
              color: pieces.length ? NAVY : '#a9a496',
              fontFamily: UI_FONT,
              fontSize: 13,
              fontWeight: 600,
              cursor: pieces.length ? 'pointer' : 'default',
            }}
          >
            Vyčistit mapu
          </button>
          <Credit />
        </div>
      ) : (
        <div style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 8 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase', color: NAVY, opacity: 0.6 }}>
                Skóre
              </div>
              <div style={{ fontSize: 30, fontWeight: 800, color: score != null && score >= 850 ? TEAL : RED, lineHeight: 1 }}>
                {score ?? 0}
              </div>
            </div>
            <div style={{ fontSize: 13, color: NAVY, maxWidth: 260 }}>
              {score != null && score >= 900
                ? 'Přesně! Vidíš, jak je ve skutečnosti malá.'
                : score != null && score >= 600
                  ? 'Skoro – dotáhni ji blíž a doprostřed.'
                  : 'Táhni ji dolů k cíli; cestou se scvrkne do pravé velikosti.'}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={newChallenge}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: RED,
                color: '#fff',
                fontFamily: UI_FONT,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Nová výzva
            </button>
            <Credit />
          </div>
        </div>
      )}
    </div>
  );
}

function Credit() {
  return (
    <div style={{ fontSize: 11.5, color: '#8b8778' }}>
      Data: Natural Earth (1 : 110 m) · Mercator ·{' '}
      <a href="https://datatimes.cz" target="_blank" rel="noopener noreferrer" style={{ color: '#8b8778' }}>
        DataTimes.cz
      </a>
    </div>
  );
}
