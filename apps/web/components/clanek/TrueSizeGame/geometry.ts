import {
  geoArea,
  geoCentroid,
  geoEqualEarth,
  geoMercator,
  geoPath,
  geoRotation,
  geoDistance,
} from "d3-geo";
import {
  geoCylindricalEqualArea,
  geoMollweide,
  geoRobinson,
  geoWinkel3,
} from "d3-geo-projection";
import type { Feature, MultiPolygon, Polygon, Position } from "geojson";

export type Country = Feature<Polygon | MultiPolygon, { name: string }>;
export type LonLat = [number, number];
// The host app declares d3-geo as an untyped module. Keep the used surface typed locally.
export interface GeoProjection {
  (point: LonLat): LonLat | null;
  invert(point: LonLat): LonLat | null;
  precision(value: number): GeoProjection;
  clipExtent(extent: [LonLat, LonLat]): GeoProjection;
  fitExtent(
    extent: [LonLat, LonLat],
    object: { type: "Sphere" },
  ): GeoProjection;
}
export type ProjectionId =
  | "mercator"
  | "equal"
  | "peters"
  | "mollweide"
  | "robinson"
  | "winkel";
export const WIDTH = 960;
export const HEIGHT = 700;
export const COLORS = [
  "#4a51ab",
  "#de1743",
  "#6267a3",
  "#a03250",
  "#0f6c78",
  "#101432",
];
export const PROJECTIONS: {
  id: ProjectionId;
  name: string;
  kind: string;
  description: string;
}[] = [
  {
    id: "mercator",
    name: "Mercator",
    kind: "Zachovává místní úhly",
    description:
      "Užitečná pro některé navigační účely: loxodromy mají na mapě podobu přímek. Směrem k pólům výrazně zvětšuje plochy, proto není vhodná pro porovnávání rozloh.",
  },
  {
    id: "equal",
    name: "Equal Earth",
    kind: "Zachovává plochu",
    description:
      "Stejná plocha na Zemi zabírá stejnou plochu na mapě. Hodí se pro srovnání rozloh a tematické mapy světa; tvary se přesto mění.",
  },
  {
    id: "peters",
    name: "Gall-Peters",
    kind: "Zachovává plochu",
    description:
      "Zachovává poměry ploch za cenu výrazného protažení některých tvarů. Je vhodná pro otázky o rozloze, není nejlepší pro každý účel.",
  },
  {
    id: "mollweide",
    name: "Mollweide",
    kind: "Zachovává plochu",
    description:
      "Eliptický obraz světa vhodný například pro globální klimatická nebo populační data. Zachování plochy je vykoupeno změnou tvarů.",
  },
  {
    id: "robinson",
    name: "Robinson",
    kind: "Kompromisní projekce",
    description:
      "Hledá vizuálně vyvážený obraz celého světa. Nezachovává dokonale plochy ani místní úhly; hodí se pro obecný přehled.",
  },
  {
    id: "winkel",
    name: "Winkel Tripel",
    kind: "Kompromisní projekce",
    description:
      "Omezuje současně několik druhů zkreslení: plochy, směru a vzdálenosti. Podobné kompromisní projekce se používají v atlasech.",
  },
];

export interface Piece {
  id: number;
  name: string;
  lon: number;
  lat: number;
  angle: number;
  pinned: boolean;
  color: string;
}

export function normLon(value: number) {
  return ((((value + 180) % 360) + 360) % 360) - 180;
}

/** Draw a round with a hard cap on countries repeated from the previous round. */
export function chooseRound(
  pool: string[],
  previous: string[],
  count: 5 | 10 | 15,
  random = Math.random,
): string[] {
  const shuffle = (values: string[]) => {
    const result = [...values];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  const unique = Array.from(new Set(pool));
  const prior = new Set(previous);
  const fresh = unique.filter((name) => !prior.has(name));
  const repeats = unique.filter((name) => prior.has(name));
  const limit = Math.min(Math.floor(count * 0.2), repeats.length);
  if (fresh.length + limit < count)
    throw new Error("Not enough countries for a varied round");
  const repeatCount = Math.max(
    count - fresh.length,
    Math.floor(random() * (limit + 1)),
  );
  return shuffle([
    ...shuffle(fresh).slice(0, count - repeatCount),
    ...shuffle(repeats).slice(0, repeatCount),
  ]);
}
export function clampLat(value: number) {
  return Math.max(-80, Math.min(80, value));
}
export function areaKm2(country: Country) {
  return geoArea(country) * 6371.0088 ** 2;
}

// A rigid rotation on the sphere preserves both geodesic shape and spherical area.
// Always transform the original coordinates, never accumulate drag errors.
export function placeCountry(
  country: Country,
  piece: Pick<Piece, "lon" | "lat" | "angle">,
): Country {
  const origin = geoCentroid(country);
  if (
    geoDistance(origin, [piece.lon, piece.lat]) < 1e-12 &&
    Math.abs(piece.angle % 360) < 1e-10
  )
    return country;
  const local = geoRotation([-origin[0], -origin[1], 0]);
  const spin = geoRotation([0, 0, piece.angle]);
  const destination = geoRotation([-piece.lon, -piece.lat, 0]);
  const move = (point: Position) =>
    destination.invert(spin(local(point as LonLat)));
  const geometry =
    country.geometry.type === "Polygon"
      ? {
          type: "Polygon" as const,
          coordinates: country.geometry.coordinates.map((ring) =>
            ring.map(move),
          ),
        }
      : {
          type: "MultiPolygon" as const,
          coordinates: country.geometry.coordinates.map((polygon) =>
            polygon.map((ring) => ring.map(move)),
          ),
        };
  return { ...country, geometry };
}

export function makeProjection(id: ProjectionId): GeoProjection {
  let projection: GeoProjection;
  switch (id) {
    case "equal":
      projection = geoEqualEarth();
      break;
    case "peters":
      projection = geoCylindricalEqualArea().parallel(45);
      break;
    case "mollweide":
      projection = geoMollweide();
      break;
    case "robinson":
      projection = geoRobinson();
      break;
    case "winkel":
      projection = geoWinkel3();
      break;
    default:
      // Keep the useful world in a landscape viewport; the infinite poles are clipped.
      projection = geoMercator()
        .scale((WIDTH - 32) / (2 * Math.PI))
        .translate([WIDTH / 2, HEIGHT * 0.68]);
      break;
  }
  if (id !== "mercator")
    projection.fitExtent(
      [
        [16, 16],
        [WIDTH - 16, HEIGHT - 16],
      ],
      { type: "Sphere" },
    );
  return projection.precision(0.2).clipExtent([
    [0, 0],
    [WIDTH, HEIGHT],
  ]);
}

export function isHome(
  piece: Piece,
  country: Country,
  projection: GeoProjection,
  pixelsPerUnit: number,
) {
  const home = geoCentroid(country);
  const a = projection([piece.lon, piece.lat]);
  const b = projection(home);
  if (!a || !b) return false;
  // Small countries need more precise placement; larger countries are forgiving.
  const radius = Math.sqrt(geoPath(projection).area(country) / Math.PI);
  const tolerance = Math.min(22, Math.max(10, radius * pixelsPerUnit * 0.24));
  return (
    Math.hypot(a[0] - b[0], a[1] - b[1]) * pixelsPerUnit <= tolerance &&
    geoDistance(home, [piece.lon, piece.lat]) < (6 * Math.PI) / 180
  );
}

export function homePiece(piece: Piece, country: Country): Piece {
  const [lon, lat] = geoCentroid(country);
  return { ...piece, lon, lat, angle: 0 };
}

// Data correction: Natural Earth 110m assigns the Crimean peninsula to Russia.
// Reassign it to Ukraine so every consumer of these features (basemap, country
// selection, dragged polygon, area computations) treats Crimea as Ukrainian.
// Detected by geographic region, not by a hard-coded polygon index.
export function reassignCrimea(features: Country[]): void {
  const russia = features.find((f) => f.properties.name === "Russia");
  const ukraine = features.find((f) => f.properties.name === "Ukraine");
  if (!russia || !ukraine) return;
  const inCrimea = (ring: Position[]) => {
    let x = 0;
    let y = 0;
    for (const point of ring) {
      x += point[0];
      y += point[1];
    }
    x /= ring.length;
    y /= ring.length;
    return x >= 32 && x <= 37 && y >= 44 && y <= 46.5;
  };
  const toPolys = (g: Polygon | MultiPolygon): Position[][][] =>
    g.type === "Polygon" ? [g.coordinates] : g.coordinates;
  const keep: Position[][][] = [];
  const moved: Position[][][] = [];
  for (const poly of toPolys(russia.geometry))
    (inCrimea(poly[0]) ? moved : keep).push(poly);
  if (!moved.length) return;
  russia.geometry = { type: "MultiPolygon", coordinates: keep };
  ukraine.geometry = {
    type: "MultiPolygon",
    coordinates: [...toPolys(ukraine.geometry), ...moved],
  };
}

export function encodeExperiment(projection: ProjectionId, pieces: Piece[]) {
  return encodeURIComponent(
    JSON.stringify({
      v: 1,
      projection,
      pieces: pieces.map(({ name, lon, lat, angle, pinned }) => ({
        name,
        lon: +lon.toFixed(4),
        lat: +lat.toFixed(4),
        angle,
        pinned,
      })),
    }),
  );
}

export function decodeExperiment(
  hash: string,
  countries: Map<string, Country>,
): { projection: ProjectionId; pieces: Piece[] } | null {
  if (!hash.startsWith("#mapa=") || hash.length > 12000) return null;
  try {
    const data = JSON.parse(decodeURIComponent(hash.slice(6)));
    if (
      data.v !== 1 ||
      !PROJECTIONS.some((p) => p.id === data.projection) ||
      !Array.isArray(data.pieces) ||
      data.pieces.length > 20
    )
      return null;
    const names = new Set<string>();
    const pieces: Piece[] = [];
    for (const p of data.pieces) {
      if (
        typeof p.name !== "string" ||
        !countries.has(p.name) ||
        names.has(p.name) ||
        !Number.isFinite(p.lon) ||
        !Number.isFinite(p.lat) ||
        !Number.isFinite(p.angle) ||
        Math.abs(p.lat) > 90 ||
        Math.abs(p.lon) > 180 ||
        Math.abs(p.angle) > 360
      )
        return null;
      names.add(p.name);
      pieces.push({
        id: pieces.length + 1,
        name: p.name,
        lon: p.lon,
        lat: p.lat,
        angle: p.angle,
        pinned: p.pinned === true,
        color: COLORS[pieces.length % COLORS.length],
      });
    }
    return { projection: data.projection, pieces };
  } catch {
    return null;
  }
}
