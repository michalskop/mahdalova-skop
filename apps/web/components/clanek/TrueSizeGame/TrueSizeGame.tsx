"use client";

import { memo, useEffect, useId, useMemo, useRef, useState } from "react";
import type { PointerEvent as Pointer, KeyboardEvent } from "react";
import { geoGraticule10, geoPath } from "d3-geo";
import { useProjectionMorph } from "./useProjectionMorph";
import { feature, mergeArcs } from "topojson-client";
import type { FeatureCollection } from "geojson";
import { COUNTRIES } from "./countries";
import {
  areaKm2,
  chooseRound,
  clampLat,
  chooseColors,
  HEIGHT,
  homePiece,
  isHome,
  makeProjection,
  normLon,
  placeCountry,
  PROJECTIONS,
  WIDTH,
} from "./geometry";
import type { Country, LonLat, Piece, ProjectionId } from "./geometry";
import styles from "./TrueSizeGame.module.css";
import LogoWithText from "../../common/LogoWithText";
import { Flag } from "@repo/ui/components/Flag";
import { ISO2 } from "./flags";
import { FACTS } from "./facts";

type Result = "correct" | "revealed";
type GamePiece = Piece & { anonymous: boolean; result?: Result };
type Drag = {
  pointer: number;
  piece: GamePiece;
  x: number;
  y: number;
  offLon: number;
  offLat: number;
  moved: boolean;
};
const STARTERS = ["Greenland", "Brazil", "India", "Australia", "Madagascar"];
const CURATED_COUNTRIES = [
  // Europe
  "Germany",
  "Ukraine",
  "Poland",
  "Spain",
  "France",
  "Italy",
  "United Kingdom",
  "Norway",
  "Sweden",
  "Finland",
  "Romania",
  "Greece",
  "Czechia",
  // North America
  "Greenland",
  "Canada",
  "United States of America",
  "Mexico",
  // Latin America
  "Brazil",
  "Argentina",
  "Peru",
  "Bolivia",
  "Colombia",
  "Chile",
  "Venezuela",
  "Ecuador",
  "Paraguay",
  // Asia
  "China",
  "India",
  "Japan",
  "Russia",
  "Iran",
  "Iraq",
  "Afghanistan",
  "Pakistan",
  "Mongolia",
  "Kazakhstan",
  "Saudi Arabia",
  "Turkey",
  "Thailand",
  "Vietnam",
  "Myanmar",
  "Indonesia",
  "Malaysia",
  "Philippines",
  // Oceania
  "Australia",
  "New Zealand",
  "Papua New Guinea",
  // Africa
  "Morocco",
  "Algeria",
  "Tunisia",
  "Libya",
  "Egypt",
  "Niger",
  "Chad",
  "Sudan",
  "Ethiopia",
  "Kenya",
  "Mali",
  "Mauritania",
  "Namibia",
  "Mozambique",
  "Zambia",
  "Madagascar",
  "South Africa",
  "Angola",
  "Nigeria",
  "Somalia",
  "Dem. Rep. Congo",
];
const START_POSITIONS: LonLat[] = [
  [-115, 24],
  [-35, -12],
  [35, 22],
  [112, 10],
  [150, -24],
];
function spreadPieces<T extends Piece>(
  pieces: T[],
  countries: Map<string, Country>,
  projectionId: ProjectionId = "mercator",
  height: number = HEIGHT,
): T[] {
  const projection = makeProjection(projectionId, height);
  const path = geoPath(projection);
  const occupied: number[][] = [];
  const positions = new Map<number, LonLat>();
  const sorted = [...pieces].sort(
    (a, b) => areaKm2(countries.get(b.name)!) - areaKm2(countries.get(a.name)!),
  );
  for (const piece of sorted) {
    let best: LonLat = [0, 0];
    let bestBox: number[] = [];
    let bestCost = Infinity;
    for (let lat = -48 + Math.random() * 4; lat <= 55; lat += 7) {
      for (let lon = -165 + Math.random() * 4; lon <= 165; lon += 10) {
        const bounds = path.bounds(
          placeCountry(countries.get(piece.name)!, { ...piece, lon, lat }),
        );
        const box = [
          bounds[0][0] - 4,
          bounds[0][1] - 4,
          bounds[1][0] + 4,
          bounds[1][1] + 4,
        ];
        if (
          box[0] < 15 ||
          box[2] > WIDTH - 15 ||
          box[1] < 30 ||
          box[3] > height - 45
        )
          continue;
        const overlap = occupied.reduce(
          (sum, other) =>
            sum +
            Math.max(
              0,
              Math.min(box[2], other[2]) - Math.max(box[0], other[0]),
            ) *
              Math.max(
                0,
                Math.min(box[3], other[3]) - Math.max(box[1], other[1]),
              ),
          0,
        );
        const separation = occupied.length
          ? Math.min(
              ...occupied.map((other) =>
                Math.hypot(
                  (box[0] + box[2] - other[0] - other[2]) / 2,
                  (box[1] + box[3] - other[1] - other[3]) / 2,
                ),
              ),
            )
          : 0;
        const cost = overlap * 10000 - separation + Math.random() * 180;
        if (cost < bestCost) {
          bestCost = cost;
          best = [lon, lat];
          bestBox = box;
        }
      }
    }
    if (bestBox.length) occupied.push(bestBox);
    positions.set(piece.id, best);
  }
  return pieces.map((piece) => ({
    ...piece,
    lon: positions.get(piece.id)![0],
    lat: positions.get(piece.id)![1],
  }));
}
type Rect = { x: number; y: number; width: number; height: number };
// Mobile map gets 25 % more viewport height (see makeProjection's `height`).
const MOBILE_QUERY = "(max-width: 600px)";
const MOBILE_HEIGHT = Math.round(HEIGHT * 1.25);
const GREEN = "#639e0a";
const ORANGE = "#f76800";
const label = (name: string) =>
  COUNTRIES[name]?.cs ||
  (
    {
      Antarctica: "Antarktida",
      "Falkland Is.": "Falklandy",
      "N. Cyprus": "Severní Kypr",
      "Fr. S. Antarctic Lands": "Francouzská jižní a antarktická území",
    } as Record<string, string>
  )[name] ||
  name;
const fold = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const number = new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 });

// Per-projection copy in plain language: what you see / how it distorts, and where
// it is normally used. `href` links a source with a real example.
const projectionInfo: Record<ProjectionId, { text: string; href: string }> = {
  mercator: {
    text: "Čím dál od rovníku, tím větší země vypadají – Grónsko nebo Rusko se zdají mnohem větší, než ve skutečnosti jsou. Používá se hlavně v námořní a letecké navigaci a v mapách na internetu.",
    href: "https://www.nauticalcharts.noaa.gov/learn/nautical-cartography.html",
  },
  equal: {
    text: "Ukazuje státy a kontinenty ve správném poměru velikostí, jen tvary jsou trochu protažené. Hodí se, když chcete poctivě porovnat rozlohy – třeba ve školních mapách světa.",
    href: "https://equal-earth.com/",
  },
  peters: {
    text: "Taky drží správné poměry velikostí, ale tvary hodně natahuje do výšky. Používá se ve výuce, aby vynikla skutečná velikost oblastí u rovníku, hlavně Afriky.",
    href: "https://www.curriculumonline.ie/getmedia/86f7ee50-2437-4327-a7c9-4a03ce7565a1/PSEC03b_Geography_Guidelines.pdf",
  },
  mollweide: {
    text: "Oválná mapa, kde velikosti sedí, ale u okrajů se tvary ohýbají. Hodí se pro mapy celého světa – třeba podnebí nebo rozložení lidí na planetě.",
    href: "https://support.esri.com/en-us/gis-dictionary/mollweide-projection",
  },
  robinson: {
    text: "Kompromis: nic není úplně přesné, zato svět vypadá přirozeně a vyváženě. Dlouho se používala v atlasech a školních mapách.",
    href: "https://media.nationalgeographic.org/assets/reference/assets/selecting-map-projection-4.pdf",
  },
  winkel: {
    text: "Vyvážený kompromis s malým zkreslením velikostí i tvarů zároveň. Používá ji třeba National Geographic pro své mapy světa.",
    href: "https://media.nationalgeographic.org/assets/reference/assets/selecting-map-projection-4.pdf",
  },
};

function shuffle<T>(list: T[]): T[] {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const LATAM = new Set([
  "Mexico",
  "Brazil",
  "Argentina",
  "Peru",
  "Bolivia",
  "Colombia",
  "Chile",
  "Venezuela",
  "Ecuador",
  "Paraguay",
  "Uruguay",
]);

// Draw a varied round: base random pick, then guarantee at least three continents
// and (in the 10/15 rounds) at least two Latin-American countries.
function chooseNames(
  pool: string[],
  previous: string[],
  count: 5 | 10 | 15,
): string[] {
  const names = chooseRound(pool, previous, count);
  const continents = () =>
    new Set(names.map((n) => COUNTRIES[n]?.continent).filter(Boolean));
  if (continents().size < Math.min(3, count)) {
    const spare = shuffle(pool.filter((n) => !names.includes(n)));
    const seen = new Set<string>();
    for (let i = 0; i < names.length; i += 1) {
      const cont = COUNTRIES[names[i]]?.continent || "";
      if (!seen.has(cont)) {
        seen.add(cont);
        continue;
      }
      const swapAt = spare.findIndex(
        (n) => !seen.has(COUNTRIES[n]?.continent || ""),
      );
      if (swapAt >= 0) {
        const [s] = spare.splice(swapAt, 1);
        names[i] = s;
        seen.add(COUNTRIES[s]?.continent || "");
      }
      if (continents().size >= Math.min(3, count)) break;
    }
  }
  if (count >= 10) {
    const add = shuffle(pool.filter((n) => LATAM.has(n) && !names.includes(n)));
    for (let i = names.length - 1; i >= 0 && add.length; i -= 1) {
      if (names.filter((n) => LATAM.has(n)).length >= 2) break;
      if (LATAM.has(names[i])) continue;
      names[i] = add.shift()!;
    }
  }
  return names;
}

// Move Crimea from Russia to Ukraine at the TopoJSON level and dissolve the shared
// border, so Ukraine renders as one seamless shape (incl. Crimea) everywhere.
function fixCrimea(topo: any): void {
  const geoms = topo?.objects?.countries?.geometries;
  if (!Array.isArray(geoms)) return;
  const russia = geoms.find((g: any) => g.properties?.name === "Russia");
  const ukraine = geoms.find((g: any) => g.properties?.name === "Ukraine");
  if (!russia || !ukraine || !Array.isArray(russia.arcs)) return;
  const decoded = feature(
    topo,
    topo.objects.countries,
  ) as unknown as FeatureCollection;
  const rf = decoded.features.find((f) => f.properties?.name === "Russia");
  if (!rf || rf.geometry.type !== "MultiPolygon") return;
  let idx = -1;
  rf.geometry.coordinates.forEach((poly, i) => {
    const ring = poly[0];
    let x = 0;
    let y = 0;
    for (const p of ring) {
      x += p[0];
      y += p[1];
    }
    x /= ring.length;
    y /= ring.length;
    if (x >= 32 && x <= 37 && y >= 44 && y <= 46.5) idx = i;
  });
  if (idx < 0) return;
  const russiaArcs = russia.arcs as number[][][];
  const crimea = russiaArcs[idx];
  russia.arcs = russiaArcs.filter((_v, i) => i !== idx);
  const ukrPolys = ukraine.type === "Polygon" ? [ukraine.arcs] : ukraine.arcs;
  ukraine.type = "MultiPolygon";
  ukraine.arcs = [...ukrPolys, crimea];
  const merged = mergeArcs(topo, [ukraine]) as { type: string; arcs: unknown };
  ukraine.type = merged.type;
  ukraine.arcs = merged.arcs;
}

const Basemap = memo(function Basemap({
  countries,
  path,
}: {
  countries: Country[];
  path: ReturnType<typeof geoPath>;
}) {
  return (
    <g className={styles.basemap} aria-hidden="true">
      {countries.map((country) => (
        <path key={country.properties.name} d={path(country) || ""} />
      ))}
    </g>
  );
});

function Silhouette({ country }: { country: Country }) {
  const d = useMemo(() => {
    const projection = makeProjection("equal");
    const path = geoPath(projection);
    const bounds = path.bounds(country);
    return {
      path: path(country) || "",
      box: `${bounds[0][0] - 2} ${bounds[0][1] - 2} ${bounds[1][0] - bounds[0][0] + 4} ${bounds[1][1] - bounds[0][1] + 4}`,
    };
  }, [country]);
  return (
    <svg viewBox={d.box} aria-hidden="true">
      <path d={d.path} fill="currentColor" />
    </svg>
  );
}

export default function TrueSizeGame() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [pieces, setPieces] = useState<GamePiece[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [projectionId, setProjectionId] = useState<ProjectionId>("mercator");
  const [projectionTouched, setProjectionTouched] = useState(false);
  const [projectionText, setProjectionText] = useState("");
  const [flashId, setFlashId] = useState<number | null>(null);
  const [flashKey, setFlashKey] = useState(0);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [optionIndex, setOptionIndex] = useState(-1);
  const [notice, setNotice] = useState("");
  const [noticeResult, setNoticeResult] = useState<Result | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [hoverId, setHoverId] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [roundMenuOpen, setRoundMenuOpen] = useState(false);
  const [roundCount, setRoundCount] = useState<5 | 10 | 15>(5);
  const [roundHover, setRoundHover] = useState<5 | 10 | 15 | null>(null);
  const previousRound = useRef<string[]>(STARTERS);
  const restartButton = useRef<HTMLButtonElement>(null);
  const roundMenuId = useId();
  const [mapHeight, setMapHeight] = useState(HEIGHT);
  const [view, setView] = useState<Rect>(() => ({
    x: 0,
    y: 0,
    width: WIDTH,
    height: HEIGHT,
  }));
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<Drag | null>(null);
  const pan = useRef<{
    pointer: number;
    x: number;
    y: number;
    view: Rect;
  } | null>(null);
  // Active touch points on the map, and the in-progress two-finger pinch.
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinch = useRef<{
    dist: number;
    width: number;
    anchorX: number;
    anchorY: number;
  } | null>(null);
  const pending = useRef<GamePiece | null>(null);
  const frame = useRef(0);
  const nextId = useRef(6);
  const resolved = useRef(new Set<number>());
  const piecesRef = useRef<GamePiece[]>(pieces);
  piecesRef.current = pieces;
  const searchId = useId();
  const byName = useMemo(
    () => new Map(countries.map((c) => [c.properties.name, c])),
    [countries],
  );
  const czArea = useMemo(() => {
    const cz = byName.get("Czechia");
    return cz ? areaKm2(cz) : 78866;
  }, [byName]);
  // A single consistent, on-theme "key" line for every country: how its real area
  // compares to Czechia – the yardstick this whole tool is about.
  function sizeVsCzechia(name: string): string {
    if (name === "Czechia")
      return "To je naše Česko – měřítko, kterým tady poměřujeme svět.";
    const c = byName.get(name);
    if (!c) return "";
    const ratio = areaKm2(c) / czArea;
    if (ratio >= 1.5)
      return `Do této země se vejde zhruba ${Math.round(ratio)}× Česko.`;
    if (ratio > 0.67) return "Rozlohou je zhruba jako Česko.";
    return `Je menší než Česko – vešla by se do něj zhruba ${Math.round(1 / ratio)}×.`;
  }
  const projection = useMemo(
    () => makeProjection(projectionId, mapHeight),
    [projectionId, mapHeight],
  );
  const { rendered, animating } = useProjectionMorph(projection, mapHeight);
  const path = useMemo(() => geoPath(rendered), [rendered]);
  const graticule = useMemo(() => geoGraticule10(), []);
  const fullView = useMemo<Rect>(
    () => ({ x: 0, y: 0, width: WIDTH, height: mapHeight }),
    [mapHeight],
  );
  const selected =
    pieces.find((p) => p.id === activeId) ||
    pieces.find((p) => !p.result) ||
    pieces[pieces.length - 1];
  // Hover (desktop) previews info; a click/tap pins it. Hover wins while active.
  // A clicked tooltip stays open until the user clicks elsewhere or closes it;
  // hover only previews a country while no tooltip has been pinned.
  const detail = pieces.find((p) => p.id === (detailId ?? hoverId));
  const detailCountry = detail ? byName.get(detail.name) : undefined;
  const detailAreaRank = detailCountry
    ? 1 + countries.filter((country) => areaKm2(country) > areaKm2(detailCountry)).length
    : 0;
  // Paint order: placed (result) pieces always at the bottom, unplaced pieces
  // above them, the selected/dragged piece on top. So an unplaced country under a
  // large placed one stays grabbable, while placed pieces keep pointer events and
  // remain clickable/hoverable for their info.
  const ordered = useMemo(() => {
    const rank = (p: GamePiece) =>
      p.result ? 0 : 1 + (p.id === selected?.id ? 2 : 0);
    return [...pieces].sort((a, b) => rank(a) - rank(b));
  }, [pieces, selected?.id]);
  const accessibleName = (p: GamePiece) =>
    p.anonymous && !p.result ? `Obrys ${p.id}` : label(p.name);

  useEffect(() => {
    const controller = new AbortController();
    setError(false);
    fetch("/specialy/dpbp/data/world-countries-110m.json", {
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error("Map unavailable");
        return r.json();
      })
      .then((world) => {
        if (controller.signal.aborted) return;
        // Data fix (also seamless render): Crimea → Ukraine, done on the topology.
        fixCrimea(world);
        const collection = feature(
          world,
          world.objects.countries,
        ) as unknown as FeatureCollection;
        const data = collection.features.filter(
          (f) =>
            (f.geometry.type === "Polygon" ||
              f.geometry.type === "MultiPolygon") &&
            f.properties?.name,
        ) as Country[];
        const map = new Map(data.map((c) => [c.properties.name, c]));
        setCountries(data);
        // A fresh, varied set of countries on every reload.
        const pool = CURATED_COUNTRIES.filter((n) => {
          const c = map.get(n);
          return c && COUNTRIES[n]?.target && areaKm2(c) >= 40000;
        });
        const names = chooseNames(pool, previousRound.current, 5);
        previousRound.current = names;
        const colors = chooseColors(names.length);
        const initial: GamePiece[] = names.map((name, i) => ({
          id: i + 1,
          name,
          lon: START_POSITIONS[i % START_POSITIONS.length]?.[0] ?? 0,
          lat: START_POSITIONS[i % START_POSITIONS.length]?.[1] ?? 10,
          angle: 0,
          pinned: false,
          color: colors[i],
          anonymous: true,
        }));
        setPieces(spreadPieces(initial, map, "mercator", mapHeight));
        setActiveId(initial[initial.length - 1]?.id || null);
        nextId.current = initial.length + 1;
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => controller.abort();
  }, [retry]);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  // Mobile viewport gets 25 % more map height; projection recomputes for it.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia(MOBILE_QUERY);
    const apply = () => setMapHeight(mq.matches ? MOBILE_HEIGHT : HEIGHT);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  // Reset to the full world whenever the viewport height changes.
  useEffect(() => {
    setView({ x: 0, y: 0, width: WIDTH, height: mapHeight });
  }, [mapHeight]);
  // Briefly reveal a country's name when it becomes selected, then fade out.
  // Anonymous (still-to-guess) pieces stay unnamed.
  useEffect(() => {
    const p = piecesRef.current.find((x) => x.id === activeId);
    if (p && (!p.anonymous || p.result)) {
      setFlashKey((k) => k + 1);
      setFlashId(activeId);
    } else {
      setFlashId(null);
    }
  }, [activeId]);
  // Type out the current projection's description; retriggers on switch. Snappy,
  // and the map stays fully usable while it types.
  useEffect(() => {
    const full = projectionInfo[projectionId].text;
    setProjectionText("");
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      setProjectionText(full.slice(0, i));
      if (i >= full.length) window.clearInterval(timer);
    }, 14);
    return () => window.clearInterval(timer);
  }, [projectionId]);
  useEffect(() => {
    if (!expanded) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const key = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = old;
      window.removeEventListener("keydown", key);
    };
  }, [expanded]);

  const results = useMemo(() => {
    const q = fold(query.trim());
    return countries
      .map((c) => c.properties.name)
      .filter(
        (n) =>
          n !== "Antarctica" &&
          !pieces.some((p) => p.name === n) &&
          (!q || fold(label(n)).includes(q) || fold(n).includes(q)),
      )
      .sort(
        (a, b) =>
          Number(fold(label(b)).startsWith(q)) -
            Number(fold(label(a)).startsWith(q)) ||
          label(a).localeCompare(label(b), "cs"),
      );
  }, [countries, pieces, query]);

  function stopDrag() {
    cancelAnimationFrame(frame.current);
    pending.current = null;
    drag.current = null;
    pan.current = null;
    pinch.current = null;
    pointers.current.clear();
  }
  function update(piece: GamePiece) {
    setPieces((prev) => prev.map((p) => (p.id === piece.id ? piece : p)));
  }
  function select(piece: GamePiece) {
    setActiveId(piece.id);
    setDetailId(piece.anonymous && !piece.result ? null : piece.id);
    setNotice("");
  }
  // Center of the currently visible map, in lon/lat. New countries drop here so
  // they land in front of the user at the current zoom/pan instead of jumping to
  // their real position. Falls back to a safe point if the center is off-globe.
  function viewportCenter(): LonLat {
    const center = projection.invert?.([
      view.x + view.width / 2,
      view.y + view.height / 2,
    ]);
    if (center && center.every(Number.isFinite) && Math.abs(center[1]) <= 90)
      return [normLon(center[0]), clampLat(center[1])];
    return [0, 20];
  }
  function addCountry(name: string) {
    if (pieces.length >= 20) {
      setNotice("Na mapě může být 20 zemí. Některou nejdřív odeber.");
      return;
    }
    if (pieces.some((p) => p.name === name)) return;
    const [lon, lat] = viewportCenter();
    const piece: GamePiece = {
      id: nextId.current++,
      name,
      lon,
      lat,
      angle: 0,
      pinned: false,
      color: chooseColors(1, pieces.map(p => p.color))[0],
      anonymous: false,
    };
    setPieces((prev) => [...prev, piece]);
    setActiveId(piece.id);
    setDetailId(null);
    setQuery("");
    setSearchOpen(false);
    setOptionIndex(-1);
    setNotice("");
  }
  function newGame(count: 5 | 10 | 15) {
    stopDrag();
    setRoundCount(count);
    const pool = CURATED_COUNTRIES.filter((name) => {
      const country = byName.get(name);
      return country && COUNTRIES[name]?.target && areaKm2(country) >= 40000;
    });
    const names = chooseNames(pool, previousRound.current, count);
    previousRound.current = names;
    const colors = chooseColors(names.length);
    const additions: GamePiece[] = names.map((name, i) => ({
      id: nextId.current++,
      name,
      lon: START_POSITIONS[i % START_POSITIONS.length]?.[0] ?? 0,
      lat: START_POSITIONS[i % START_POSITIONS.length]?.[1] ?? 10,
      angle: 0,
      pinned: false,
      color: colors[i],
      anonymous: true,
    }));
    setPieces(spreadPieces(additions, byName, projectionId, mapHeight));
    setActiveId(additions[additions.length - 1]?.id || null);
    resolved.current.clear();
    setNotice("");
    setDetailId(null);
    // Keep the current projection viewport when changing round size. Resetting
    // to fullView here made the map visibly jump, especially for the 5-country
    // option; a new round should only replace pieces and their starting layout.
    setRoundMenuOpen(false);
    restartButton.current?.focus();
  }
  function resolvePosition(piece: GamePiece) {
    if (piece.result || resolved.current.has(piece.id)) return;
    stopDrag();
    resolved.current.add(piece.id);
    const country = byName.get(piece.name)!;
    const matrix = svg.current?.getScreenCTM();
    const success = isHome(
      piece,
      country,
      projection,
      matrix ? Math.hypot(matrix.a, matrix.b) : 1,
    );
    const result: Result = success ? "correct" : "revealed";
    update({
      ...homePiece(piece, country),
      anonymous: false,
      result,
      pinned: true,
      color: success ? GREEN : ORANGE,
    });
    setNotice("");
    setNoticeResult(null);
    // Keep the solved/revealed country's tooltip open so the result remains
    // useful after the automatic snap-to-position.
    setDetailId(piece.id);
    setHoverId(null);
  }
  function checkPosition() {
    if (selected) resolvePosition(selected);
  }
  function mapPosition(x: number, y: number): LonLat | null {
    const matrix = svg.current?.getScreenCTM();
    if (!matrix) return null;
    const p = new DOMPoint(x, y).matrixTransform(matrix.inverse());
    const point = projection.invert([p.x, p.y]);
    if (!point || !point.every(Number.isFinite) || Math.abs(point[1]) > 90)
      return null;
    const check = projection(point);
    return check && Math.hypot(check[0] - p.x, check[1] - p.y) < 1
      ? point
      : null;
  }
  function beginDrag(
    e: Pointer<SVGGElement | HTMLButtonElement>,
    piece: GamePiece,
    fromDock = false,
  ) {
    if (!fromDock) {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.current.size >= 2) {
        e.stopPropagation();
        startPinch();
        return;
      }
    }
    if (e.button !== 0 || drag.current || pan.current) return;
    e.stopPropagation();
    setActiveId(piece.id);
    setHoverId(null);
    if (piece.pinned || piece.result) {
      setDetailId(piece.id);
      return;
    }
    const point = mapPosition(e.clientX, e.clientY);
    if (!point) return;
    e.preventDefault();
    e.currentTarget.focus();
    svg.current?.setPointerCapture(e.pointerId);
    setDetailId(null);
    setNotice("");
    drag.current = {
      pointer: e.pointerId,
      piece,
      x: e.clientX,
      y: e.clientY,
      offLon: fromDock ? 0 : normLon(piece.lon - point[0]),
      offLat: fromDock ? 0 : piece.lat - point[1],
      moved: false,
    };
    pending.current = piece;
  }
  function moved(e: Pointer<SVGSVGElement>) {
    const current = drag.current;
    if (!current || current.pointer !== e.pointerId) return null;
    const point = mapPosition(e.clientX, e.clientY);
    if (!point) return pending.current;
    return {
      ...current.piece,
      lon: normLon(point[0] + current.offLon),
      lat: clampLat(point[1] + current.offLat),
    };
  }
  // Begin a two-finger pinch. Cancels any single-finger pan/drag (without
  // reverting a moved country) and anchors the map point under the fingers.
  function startPinch() {
    cancelAnimationFrame(frame.current);
    drag.current = null;
    pending.current = null;
    pan.current = null;
    const pts = Array.from(pointers.current.values());
    if (pts.length < 2) return;
    const [a, b] = pts;
    const midX = (a.x + b.x) / 2;
    const midY = (a.y + b.y) / 2;
    const ctm = svg.current?.getScreenCTM();
    let anchorX = view.x + view.width / 2;
    let anchorY = view.y + view.height / 2;
    if (ctm) {
      const u = new DOMPoint(midX, midY).matrixTransform(ctm.inverse());
      anchorX = u.x;
      anchorY = u.y;
    }
    pinch.current = {
      dist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
      width: view.width,
      anchorX,
      anchorY,
    };
  }
  // Continuously rescale around the point between the fingers; the midpoint may
  // also translate, which naturally pans the map.
  function applyPinch() {
    const p = pinch.current;
    const rect = svg.current?.getBoundingClientRect();
    if (!p || !rect) return;
    const pts = Array.from(pointers.current.values());
    if (pts.length < 2) return;
    const [a, b] = pts;
    const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
    const midX = (a.x + b.x) / 2;
    const midY = (a.y + b.y) / 2;
    const width = Math.max(
      WIDTH / 6,
      Math.min(WIDTH, (p.width * p.dist) / dist),
    );
    const height = (width * mapHeight) / WIDTH;
    const s = Math.min(rect.width / width, rect.height / height);
    const offX = (rect.width - s * width) / 2;
    const offY = (rect.height - s * height) / 2;
    setView({
      x: p.anchorX - (midX - rect.left - offX) / s,
      y: p.anchorY - (midY - rect.top - offY) / s,
      width,
      height,
    });
  }
  function onMove(e: Pointer<SVGSVGElement>) {
    if (pointers.current.has(e.pointerId))
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch.current) {
      applyPinch();
      return;
    }
    if (pan.current?.pointer === e.pointerId) {
      const old = pan.current;
      const matrix = svg.current?.getScreenCTM();
      const unit = matrix ? 1 / Math.hypot(matrix.a, matrix.b) : 1;
      setView({
        ...old.view,
        x: old.view.x - (e.clientX - old.x) * unit,
        y: old.view.y - (e.clientY - old.y) * unit,
      });
      return;
    }
    const piece = moved(e);
    if (!piece || !drag.current) return;
    drag.current.moved ||=
      Math.hypot(e.clientX - drag.current.x, e.clientY - drag.current.y) > 3;
    if (!drag.current.moved) return;
    pending.current = piece;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      if (pending.current) update(pending.current);
    });
  }
  function onUp(e: Pointer<SVGSVGElement>) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pan.current?.pointer === e.pointerId) pan.current = null;
    const current = drag.current;
    if (current?.pointer === e.pointerId) {
      let piece = current.moved
        ? moved(e) || pending.current || current.piece
        : current.piece;
      cancelAnimationFrame(frame.current);
      drag.current = null;
      pending.current = null;
      if (current.moved) {
        const matrix = svg.current?.getScreenCTM();
        // Align close placements immediately, but count only an explicit check.
        if (
          isHome(
            piece,
            byName.get(piece.name)!,
            projection,
            matrix ? Math.hypot(matrix.a, matrix.b) : 1,
          )
        )
          piece = { ...piece, ...homePiece(piece, byName.get(piece.name)!) };
        update(piece);
        if (
          piece.lat === homePiece(piece, byName.get(piece.name)!).lat &&
          piece.lon === homePiece(piece, byName.get(piece.name)!).lon
        )
          resolvePosition(piece);
      } else select(piece);
    }
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
  }
  function cancelDrag() {
    if (drag.current) update(drag.current.piece);
    stopDrag();
  }
  function keyMove(e: KeyboardEvent<SVGGElement>, piece: GamePiece) {
    if (e.key === "Enter") {
      e.preventDefault();
      select(piece);
      return;
    }
    if (
      piece.pinned ||
      piece.result ||
      !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
    )
      return;
    e.preventDefault();
    const step = e.shiftKey ? 0.2 : 1;
    setActiveId(piece.id);
    update({
      ...piece,
      lon: normLon(
        piece.lon +
          (e.key === "ArrowRight" ? step : e.key === "ArrowLeft" ? -step : 0),
      ),
      lat: clampLat(
        piece.lat +
          (e.key === "ArrowUp" ? step : e.key === "ArrowDown" ? -step : 0),
      ),
    });
  }
  function zoom(factor: number) {
    stopDrag();
    setView((old) => {
      const width = Math.max(WIDTH / 6, Math.min(WIDTH, old.width * factor));
      const height = (width * mapHeight) / WIDTH;
      return width === WIDTH
        ? fullView
        : {
            x: old.x + (old.width - width) / 2,
            y: old.y + (old.height - height) / 2,
            width,
            height,
          };
    });
  }
  if (!countries.length)
    return (
      <section className={styles.loading} role="status">
        {error ? (
          <>
            Mapu se nepodařilo načíst.
            <button onClick={() => setRetry((n) => n + 1)}>Zkusit znovu</button>
          </>
        ) : (
          "Načítám mapu…"
        )}
      </section>
    );
  return (
    <section
      className={`${styles.board} ${expanded ? styles.expanded : ""}`}
      aria-label="Skutečná velikost – mapová hra"
    >
      <div className={styles.dashboard}>
        <div className={styles.toolbar}>
          <div className={styles.search}>
            <svg
              aria-hidden="true"
              className={styles.searchIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m16 16 4.5 4.5" />
            </svg>
            <input
              role="combobox"
              aria-label="Vyhledat zemi"
              placeholder="Vyhledat zemi"
              autoComplete="off"
              value={query}
              aria-autocomplete="list"
              aria-expanded={searchOpen}
              aria-controls={searchOpen ? searchId : undefined}
              aria-activedescendant={
                searchOpen && results[optionIndex]
                  ? `${searchId}-${optionIndex}`
                  : undefined
              }
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setSearchOpen(false)}
              onChange={(e) => {
                setQuery(e.target.value);
                setOptionIndex(-1);
                setSearchOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") setSearchOpen(false);
                if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                  e.preventDefault();
                  setSearchOpen(true);
                  setOptionIndex((i) =>
                    results.length
                      ? (i +
                          (e.key === "ArrowDown" ? 1 : -1) +
                          results.length) %
                        results.length
                      : -1,
                  );
                }
                if (
                  e.key === "Enter" &&
                  searchOpen &&
                  results[optionIndex < 0 ? 0 : optionIndex]
                ) {
                  e.preventDefault();
                  addCountry(results[optionIndex < 0 ? 0 : optionIndex]);
                }
              }}
            />
            {searchOpen && (
              <ul
                id={searchId}
                role="listbox"
                className={styles.suggestions}
                aria-label="Nalezené země"
              >
                {results.map((name, i) => (
                  <li
                    key={name}
                    role="option"
                    id={`${searchId}-${i}`}
                    aria-selected={optionIndex === i || (optionIndex < 0 && i === 0)}
                    onPointerDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setOptionIndex(i)}
                    onClick={() => addCountry(name)}
                  >
                    {label(name)}
                    <span>＋</span>
                  </li>
                ))}
                {!results.length && (
                  <li role="presentation">Žádná další země nenalezena.</li>
                )}
              </ul>
            )}
          </div>
          <details
            className={styles.projection}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node))
                e.currentTarget.open = false;
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.currentTarget.open = false;
                e.currentTarget.querySelector("summary")?.focus();
              }
            }}
          >
            <summary aria-label="Typ zobrazení">
              {projectionTouched
                ? PROJECTIONS.find((p) => p.id === projectionId)?.name
                : "Typ zobrazení"}
              <svg
                className={styles.caret}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            <div className={styles.projectionOptions}>
              {PROJECTIONS.map((p) => (
                <button
                  key={p.id}
                  aria-pressed={p.id === projectionId}
                  onClick={(e) => {
                    stopDrag();
                    setProjectionTouched(true);
                    setProjectionId(p.id);
                    setView(fullView);
                    const menu = e.currentTarget.closest("details")!;
                    menu.open = false;
                    menu.querySelector("summary")?.focus();
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </details>
        </div>
        <div className={styles.bottom}>
          <div className={styles.dock} aria-label="Obrysy zemí">
            {pieces.map((piece) => (
              <button
                key={piece.id}
                className={styles.dockPiece}
                aria-label={`Vybrat ${accessibleName(piece)}`}
                aria-pressed={selected?.id === piece.id}
                title={`${accessibleName(piece)}${piece.result === "correct" ? " · správně" : piece.result === "revealed" ? " · odhaleno" : ""}`}
                style={{ color: piece.color }}
                onPointerDown={(e) => beginDrag(e, piece, true)}
                onClick={() => select(piece)}
              >
                <Silhouette country={byName.get(piece.name)!} />
                {piece.result && (
                  <span className={styles.resultMark}>
                    {piece.result === "correct" ? "✓" : "!"}
                  </span>
                )}
              </button>
            ))}
          </div>
          <button
            className={styles.confirm}
            onClick={checkPosition}
            disabled={!selected || !!selected.result}
            aria-label="Ověřit polohu vybrané země"
            title="Ověřit polohu"
          >
            <span aria-hidden="true">✓</span>
            <span>Ověřit</span>
          </button>
          <div className={styles.utilities}>
            <div
              className={styles.roundControl}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null))
                  setRoundMenuOpen(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setRoundMenuOpen(false);
                  restartButton.current?.focus();
                }
              }}
            >
              <button
                ref={restartButton}
                onClick={() => setRoundMenuOpen((open) => !open)}
                aria-label="Nová hra – vybrat počet zemí"
                aria-expanded={roundMenuOpen}
                aria-controls={roundMenuOpen ? roundMenuId : undefined}
                title="Nová hra"
              >
                ↻
              </button>
              {roundMenuOpen && (
                <div
                  className={styles.roundMenu}
                  id={roundMenuId}
                  role="group"
                  aria-label="Počet zemí"
                >
                  <span>Počet zemí</span>
                  <div>
                    {([5, 10, 15] as const).map((count) => (
                      <button
                        key={count}
                        onClick={() => newGame(count)}
                        aria-label={`${count} zemí`}
                        aria-selected={(roundHover ?? roundCount) === count}
                        onMouseEnter={() => setRoundHover(count)}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.mapArea}>
        <svg
          ref={svg}
          className={styles.map}
          style={{ pointerEvents: animating ? "none" : undefined }}
          aria-busy={animating}
          viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`}
          aria-label="Mapa. Obrys přesuň tažením nebo šipkami, polohu ověř fajfkou."
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={(e) => {
            pointers.current.delete(e.pointerId);
            if (pointers.current.size < 2) pinch.current = null;
            cancelDrag();
          }}
          onLostPointerCapture={() => {
            if (drag.current || pan.current) cancelDrag();
          }}
          onPointerDown={(e) => {
            setProjectionTouched(true);
            pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
            if (pointers.current.size >= 2) {
              startPinch();
              return;
            }
            if (e.button !== 0 || drag.current || pan.current) return;
            setDetailId(null);
            e.currentTarget.setPointerCapture(e.pointerId);
            pan.current = {
              pointer: e.pointerId,
              x: e.clientX,
              y: e.clientY,
              view,
            };
          }}
        >
          <Basemap
            countries={countries}
            path={path}
          />
          <path d={path(graticule) || ""} fill="none" stroke="#8f9dc9" strokeWidth={0.5} opacity={0.3} pointerEvents="none" aria-hidden="true" />
          {ordered.map((piece) => {
            const anchor = rendered([piece.lon, piece.lat]);
            const r = Math.max(3, (6 * view.width) / WIDTH);
            return (
              <g
                key={piece.id}
                role="button"
                tabIndex={0}
                aria-label={`${accessibleName(piece)}${piece.result === "correct" ? ", správně" : piece.result === "revealed" ? ", odhaleno" : ", přesuň po mapě"}`}
                className={`${styles.piece} ${piece.pinned ? styles.pinned : ""}`}
                onPointerDown={(e) => beginDrag(e, piece)}
                // Desktop hover previews the country's info; touch uses tap.
                onPointerEnter={(e) => {
                  if (e.pointerType === "touch") return;
                  if (drag.current || pan.current || pinch.current) return;
                  if (piece.anonymous && !piece.result) return;
                  setHoverId(piece.id);
                }}
                onPointerLeave={(e) => {
                  if (e.pointerType === "touch") return;
                  setHoverId((id) => (id === piece.id ? null : id));
                }}
                onFocus={() => setActiveId(piece.id)}
                onKeyDown={(e) => { if (!animating) keyMove(e, piece); }}
              >
                <path
                  d={path(placeCountry(byName.get(piece.name)!, piece)) || ""}
                  fill={piece.color}
                  fillOpacity={
                    piece.result
                      ? 0.32
                      : selected?.id === piece.id
                        ? 0.45
                        : 0.18
                  }
                  stroke={piece.color}
                  strokeWidth={selected?.id === piece.id ? 2.4 : 1.4}
                  vectorEffect="non-scaling-stroke"
                />
                {anchor &&
                  flashId === piece.id &&
                  (!piece.anonymous || piece.result) && (
                    <g transform={`translate(${anchor[0]},${anchor[1]})`}>
                      <text
                        key={flashKey}
                        y={-r - 5}
                        className={`${styles.countryLabel} ${styles.flashLabel}`}
                        textAnchor="middle"
                        onAnimationEnd={() => setFlashId(null)}
                      >
                        {label(piece.name)}
                      </text>
                    </g>
                  )}
              </g>
            );
          })}
        </svg>
        <aside className={styles.projectionGuide} aria-live="polite">
          <strong>
            {PROJECTIONS.find((item) => item.id === projectionId)?.name}
          </strong>{" "}
          <span className={styles.guideText}>{projectionText}</span>
        </aside>
        <div className={styles.zoom}>
          <button onClick={() => setExpanded(!expanded)} aria-label={expanded ? "Zmenšit mapu" : "Zvětšit mapu"} title={expanded ? "Zmenšit mapu" : "Zvětšit mapu"}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d={expanded ? "M9 4H4v5M15 4h5v5M20 15v5h-5M9 20H4v-5" : "M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"} /></svg>
          </button>
          <button
            onClick={() => zoom(1 / 1.5)}
            disabled={view.width <= WIDTH / 6}
            aria-label="Přiblížit mapu"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          </button>
          <button
            onClick={() => zoom(1.5)}
            disabled={view.width >= WIDTH}
            aria-label="Oddálit mapu"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14" /></svg>
          </button>
          <button
            onClick={() => {
              stopDrag();
              setView(fullView);
            }}
            aria-label="Celý svět"
            title="Celý svět"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5M6 10v9h12v-9" /></svg>
          </button>
        </div>
        {detail && !detail.anonymous && (
          <aside className={styles.detail} aria-label="Vybraná země">
            <button
              className={styles.close}
              onClick={() => {
                setDetailId(null);
                setHoverId(null);
              }}
              aria-label="Zavřít detail"
            >
              ×
            </button>
            <strong style={{ color: detail.color }}>
              {ISO2[detail.name] && (
                <Flag
                  code={ISO2[detail.name]}
                  size={20}
                  alt=""
                  style={{ marginRight: 6 }}
                />
              )}
              {label(detail.name)}
            </strong>
            <small>
              ≈ {number.format(areaKm2(byName.get(detail.name)!))} km²
            </small>
            <span>Rozlohou {detailAreaRank}. největší země světa</span>
            <span>Počet obyvatel: {FACTS[detail.name]?.population}</span>
            <span>Hlavní město: {FACTS[detail.name]?.capital}</span>
            <span className={styles.detailSize}>{sizeVsCzechia(detail.name)}</span>
          </aside>
        )}
        <div className={styles.credit}>
          Inspirováno:{" "}
          <a
            href="https://thetruesize.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            The True Size
          </a>
        </div>
        <div className={styles.creditBrand}>
          <LogoWithText size="md" color="#101432" />
        </div>
      </div>
    </section>
  );
}
