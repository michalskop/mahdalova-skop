'use client';

// "Skutečná velikost" – a modern remake of the classic *The True Size Of…* toy,
// built on the world TopoJSON + d3-geo stack already in the repo.
//
// Core mechanic: drag any country across a static Mercator basemap. As it moves
// to a new latitude the shape is RE-PROJECTED (not uniformly scaled), so its
// size on the map is exactly what Mercator would draw there – Greenland is huge
// in the north and shrinks dramatically over the equator. A readout shows how
// many times bigger the projection makes it look than its true area.
//
// Scoring / search / daily challenge land in the next layer; this is the toy.

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
const UI_FONT = "'IBM Plex Sans', system-ui, -apple-system, sans-serif";

// Distinct fills for placed countries (all main brand-scale [6] tokens).
const PIECE_COLORS = [
  '#de1743', // brand
  '#0e839e', // teal
  '#f76800', // orange
  '#4a51ab', // royal blue
  '#639e0a', // forest green
  '#a03250', // deep red
];

// Preset draggable countries – recognisable and spread across latitudes so the
// distortion is worth exploring.
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

// Area-weighted Mercator distortion at the geometry's current latitude:
// mercator area / true area (equal-area cylinder). ~1 at the equator, ~16 for
// Greenland at home.
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

// Shift a feature's geometry so its centroid moves to (tLon, tLat), keeping the
// true shape. Latitudes are clamped away from the poles where Mercator explodes.
function placeGeometry(geometry: any, orig: [number, number], tLon: number, tLat: number): any {
  const dLon = tLon - orig[0];
  const dLat = tLat - orig[1];
  const move = (c: number[]): number[] => [c[0] + dLon, Math.max(-82, Math.min(82, c[1] + dLat))];
  const walk = (coords: any): any => (typeof coords[0] === 'number' ? move(coords) : coords.map(walk));
  return { type: 'Feature', properties: {}, geometry: { ...geometry, coordinates: walk(geometry.coordinates) } };
}

type GeoFeature = { type: 'Feature'; properties: { name: string }; geometry: any };

interface Ctx {
  projection: d3geo.GeoProjection;
  path: d3geo.GeoPath;
  width: number;
  height: number;
  features: GeoFeature[];
  byName: Record<string, GeoFeature>;
  centroidByName: Record<string, [number, number]>;
}

interface Piece {
  id: number;
  name: string; // English key
  cs: string;
  color: string;
  lon: number; // current centroid
  lat: number;
}

// A single draggable country. Memoises its own path so only the piece being
// dragged recomputes on pointer move.
function PlacedPiece({
  piece,
  ctx,
  active,
  onPointerDown,
}: {
  piece: Piece;
  ctx: Ctx;
  active: boolean;
  onPointerDown: (e: React.PointerEvent, id: number) => void;
}) {
  const feature = ctx.byName[piece.name];
  const orig = ctx.centroidByName[piece.name];
  const { d, factor, labelXY } = useMemo(() => {
    const placed = placeGeometry(feature.geometry, orig, piece.lon, piece.lat);
    const d = ctx.path(placed as any) || '';
    const factor = distortionFactor(placed.geometry, piece.lon);
    const c = ctx.path.centroid(placed as any) as [number, number];
    return { d, factor, labelXY: c };
  }, [feature, orig, piece.lon, piece.lat, ctx]);

  const fmt = (n: number) => (n < 10 ? n.toFixed(1) : String(Math.round(n))).replace('.', ',');

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
          <text
            textAnchor="middle"
            y={-2}
            fontFamily={UI_FONT}
            fontSize={11}
            fontWeight={700}
            fill="#fff"
            stroke={piece.color}
            strokeWidth={0.5}
            paintOrder="stroke"
          >
            {piece.cs}
          </text>
          <text
            textAnchor="middle"
            y={11}
            fontFamily={UI_FONT}
            fontSize={9.5}
            fontWeight={600}
            fill="#fff"
            stroke={piece.color}
            strokeWidth={0.5}
            paintOrder="stroke"
          >
            ×{fmt(factor)}
          </text>
        </g>
      )}
    </g>
  );
}

export default function TrueSizeGame() {
  const [ctx, setCtx] = useState<Ctx | null>(null);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
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
        for (const f of fc.features) {
          byName[f.properties.name] = f;
          centroidByName[f.properties.name] = d3geo.geoCentroid(f as any) as [number, number];
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
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const addPiece = useCallback(
    (name: string) => {
      if (!ctx) return;
      const c = ctx.centroidByName[name];
      if (!c) return;
      setPieces((prev) => {
        if (prev.some((p) => p.name === name)) return prev;
        const color = PIECE_COLORS[prev.length % PIECE_COLORS.length];
        return [...prev, { id: nextId.current++, name, cs: COUNTRIES[name]?.cs || name, color, lon: c[0], lat: c[1] }];
      });
      setActiveId(null);
    },
    [ctx],
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
      const piece = pieces.find((p) => p.id === id);
      if (!ll || !piece) return;
      drag.current = { id, offLon: piece.lon - ll[0], offLat: piece.lat - ll[1] };
      setActiveId(id);
      // bring active piece to top
      setPieces((prev) => {
        const idx = prev.findIndex((p) => p.id === id);
        if (idx < 0) return prev;
        const copy = prev.slice();
        const [pc] = copy.splice(idx, 1);
        copy.push(pc);
        return copy;
      });
    },
    [pieces, pointerToLonLat],
  );

  useEffect(() => {
    function onMove(e: PointerEvent) {
      if (!drag.current) return;
      const ll = pointerToLonLat(e.clientX, e.clientY);
      if (!ll) return;
      const { id, offLon, offLat } = drag.current;
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        setPieces((prev) => prev.map((p) => (p.id === id ? { ...p, lon: ll[0] + offLon, lat: ll[1] + offLat } : p)));
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

  return (
    <div style={shell}>
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: NAVY }}>Přetáhni zemi po mapě</div>
        <div style={{ fontSize: 13.5, color: NAVY, opacity: 0.75, marginTop: 2 }}>
          Vyber zemi a táhni ji k rovníku i k pólům – uvidíš, jak s ní Mercator mění velikost. Číslo ×N ukazuje, kolikrát
          je na dané šířce větší, než ve skutečnosti je.
        </div>
      </div>

      {/* Country chips */}
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
          {pieces.map((p) => (
            <PlacedPiece key={p.id} piece={p} ctx={ctx} active={p.id === activeId} onPointerDown={onPiecePointerDown} />
          ))}
        </svg>

        {pieces.length === 0 && (
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
            Klikni na zemi nahoře a přetáhni ji po mapě
          </div>
        )}
      </div>

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
        <div style={{ fontSize: 11.5, color: '#8b8778' }}>
          Data: Natural Earth (1 : 110 m) · projekce Mercator ·{' '}
          <a href="https://datatimes.cz" target="_blank" rel="noopener noreferrer" style={{ color: '#8b8778' }}>
            DataTimes.cz
          </a>
        </div>
      </div>
    </div>
  );
}
