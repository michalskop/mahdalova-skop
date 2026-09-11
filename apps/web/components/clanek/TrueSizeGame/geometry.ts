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
// Exact five-shade rows supplied by the editor (September 2026).
export const COUNTRY_COLOR_ROWS = [
  ["#eeeae2", "#e9e9dd", "#e8e8dc", "#d4d4c8", "#c8c8bc"],
  ["#ffdc33", "#ffd519", "#ffcf02", "#efb704", "#bd9103"],
  ["#ff934d", "#ff7f2a", "#f76800", "#cc5f00", "#994800"],
  ["#ff5c4a", "#ff3f30", "#e8412c", "#c93020", "#a32318"],
  ["#ff1a4a", "#f01745", "#de1743", "#c5143c", "#a81134"],
  ["#d85a74", "#bb3a5d", "#a03250", "#812840", "#621d30"],
  ["#b57ac8", "#b262c0", "#9f319e", "#6e227d", "#522a7a"],
  ["#697fe6", "#5e66d5", "#4a51ab", "#383d82", "#272a59"],
  ["#8f9dc9", "#7889be", "#6267a3", "#4c4f8e", "#2f325c"],
  ["#33b9d9", "#1a9fbd", "#0e839e", "#06677d", "#044d5e"],
  ["#4fd6b4", "#12b886", "#0e926a", "#0b6b4e", "#084533"],
  ["#6ec53f", "#639e0a", "#507e08", "#3d5f06", "#2a3f04"],
  ["#a87d58", "#8b6240", "#6e4a2c", "#53361e", "#3b2414"],
];
export const COLORS = COUNTRY_COLOR_ROWS.flat();
export function chooseColors(count: number, used: string[] = [], random = Math.random): string[] {
  const shuffle = <T,>(values: T[]) => {
    const result = [...values];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  const selected: string[] = [];
  while (selected.length < count) {
    let added = false;
    for (const row of shuffle(COUNTRY_COLOR_ROWS)) {
      const color = shuffle(row).find(c => !used.includes(c) && !selected.includes(c));
      if (color) { selected.push(color); added = true; }
      if (selected.length === count) break;
    }
    if (!added) throw new Error("Country palette exhausted");
  }
  return selected;
}
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

// `height` is the viewport height the projection is fitted to. It defaults to
// HEIGHT (desktop); on mobile a taller value is passed so the map gains vertical
// room. The projection is fully recomputed for the given height – no distortion.
export function makeProjection(
  id: ProjectionId,
  height: number = HEIGHT,
): GeoProjection {
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
        .translate([WIDTH / 2, height * 0.68]);
      break;
  }
  if (id !== "mercator")
    projection.fitExtent(
      [
        [16, 16],
        [WIDTH - 16, height - 16],
      ],
      { type: "Sphere" },
    );
  return projection.precision(0.2).clipExtent([
    [0, 0],
    [WIDTH, height],
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

