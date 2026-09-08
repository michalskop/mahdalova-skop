"use client";

import { memo, useEffect, useId, useMemo, useRef, useState } from "react";
import type { PointerEvent as Pointer, KeyboardEvent } from "react";
import { geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { FeatureCollection } from "geojson";
import { COUNTRIES } from "./countries";
import {
  areaKm2,
  clampLat,
  COLORS,
  HEIGHT,
  homePiece,
  isHome,
  makeProjection,
  normLon,
  placeCountry,
  PROJECTIONS,
  reassignCrimea,
  WIDTH,
} from "./geometry";
import type { Country, LonLat, Piece, ProjectionId } from "./geometry";
import styles from "./TrueSizeGame.module.css";
import LogoWithText from "../../common/LogoWithText";
import { Flag } from "@repo/ui/components/Flag";
import { ISO2 } from "./flags";
import { FACTS } from "./facts";
import { drawRound, ROUND_POOL } from "./rounds";
import ProjectionGuide from "./ProjectionGuide";

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
    for (let lat = -48 + Math.random() * 10; lat <= 55; lat += 13) {
      for (let lon = -150 + Math.random() * 15; lon <= 150; lon += 20) {
        const bounds = path.bounds(
          placeCountry(countries.get(piece.name)!, { ...piece, lon, lat }),
        );
        const box = [
          bounds[0][0] - 10,
          bounds[0][1] - 10,
          bounds[1][0] + 10,
          bounds[1][1] + 10,
        ];
        if (
          box[0] < 15 ||
          box[2] > WIDTH - 15 ||
          box[1] < 100 ||
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
        const cost = overlap * 10000 - separation + Math.random() * 240;
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

const Basemap = memo(function Basemap({
  countries,
  projectionId,
  height,
}: {
  countries: Country[];
  projectionId: ProjectionId;
  height: number;
}) {
  const path = geoPath(makeProjection(projectionId, height));
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
  const [flashId, setFlashId] = useState<number | null>(null);
  const [flashKey, setFlashKey] = useState(0);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [optionIndex, setOptionIndex] = useState(-1);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [hoverId, setHoverId] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [roundMenuOpen, setRoundMenuOpen] = useState(false);
  const previousRound = useRef<string[]>([]);
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
  const projection = useMemo(
    () => makeProjection(projectionId, mapHeight),
    [projectionId, mapHeight],
  );
  const path = useMemo(() => geoPath(projection), [projection]);
  const fullView = useMemo<Rect>(
    () => ({ x: 0, y: 0, width: WIDTH, height: mapHeight }),
    [mapHeight],
  );
  const selected =
    pieces.find((p) => p.id === activeId) ||
    pieces.find((p) => !p.result) ||
    pieces[pieces.length - 1];
  // Hover (desktop) previews info; a click/tap pins it. Hover wins while active.
  const detail = pieces.find((p) => p.id === (hoverId ?? detailId));
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
        const collection = feature(
          world,
          world.objects.countries,
        ) as unknown as FeatureCollection;
        // Correct the source data before anything consumes it: Crimea → Ukraine.
        reassignCrimea(collection.features as unknown as Country[], world);
        const data = collection.features.filter(
          (f) =>
            (f.geometry.type === "Polygon" ||
              f.geometry.type === "MultiPolygon") &&
            f.properties?.name,
        ) as Country[];
        const map = new Map(data.map((c) => [c.properties.name, c]));
        setCountries(data);
        let previous: string[] = [];
        try {
          previous = JSON.parse(
            sessionStorage.getItem("true-size-round") || "[]",
          );
        } catch {}
        const names = drawRound(
          ROUND_POOL.filter((name) => map.has(name)),
          Array.isArray(previous) ? previous : [],
          5,
        );
        const initial: GamePiece[] = names.map((name, i) => ({
          id: i + 1,
          name,
          lon: 0,
          lat: 0,
          angle: 0,
          pinned: false,
          color: COLORS[i % COLORS.length],
          anonymous: true,
        }));
        const height = window.matchMedia(MOBILE_QUERY).matches
          ? MOBILE_HEIGHT
          : HEIGHT;
        setPieces(spreadPieces(initial, map, "mercator", height));
        previousRound.current = names;
        try {
          sessionStorage.setItem("true-size-round", JSON.stringify(names));
        } catch {}
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
    if (pieces.length >= 20) return [];
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

  function countryContext(name: string) {
    const country = byName.get(name)!;
    const area = areaKm2(country);
    const czechArea = byName.has("Czechia")
      ? areaKm2(byName.get("Czechia")!)
      : 78871;
    const ratio = area / czechArea;
    const comparison =
      name === "Czechia"
        ? "Česko je měřítkem pro porovnání ostatních zemí."
        : ratio >= 1
          ? `Rozlohou přibližně ${new Intl.NumberFormat("cs-CZ", { maximumSignificantDigits: 2 }).format(ratio)}× Česko.`
          : `Rozlohou přibližně ${new Intl.NumberFormat("cs-CZ", { maximumSignificantDigits: 2 }).format(ratio * 100)} % Česka.`;
    const population = FACTS[name]?.population || "";
    const match = population.match(/^([\d,]+)\s+(milion|miliard|tisíc)/);
    if (!match) return comparison;
    const residents =
      Number(match[1].replace(",", ".")) *
      (match[2] === "milion" ? 1e6 : match[2] === "miliard" ? 1e9 : 1e3);
    const density = residents / area;
    return `${comparison} V průměru ${density < 1 ? "méně než 1 člověk" : `asi ${number.format(Math.round(density))} lidí`} na km².`;
  }
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
      color: COLORS[pieces.length % COLORS.length],
      anonymous: false,
    };
    setPieces((prev) => [...prev, piece]);
    setActiveId(piece.id);
    setDetailId(null);
    setQuery("");
    setSearchOpen(false);
    setOptionIndex(-1);
  }
  function newGame(count: 5 | 10 | 15) {
    stopDrag();
    const names = drawRound(
      ROUND_POOL.filter((name) => byName.has(name)),
      previousRound.current,
      count,
    );
    try {
      sessionStorage.setItem("true-size-round", JSON.stringify(names));
    } catch {}
    previousRound.current = names;
    const additions: GamePiece[] = names.map((name, i) => ({
      id: nextId.current++,
      name,
      lon: 0,
      lat: 0,
      angle: 0,
      pinned: false,
      color: COLORS[i % COLORS.length],
      anonymous: true,
    }));
    setPieces(spreadPieces(additions, byName, projectionId, mapHeight));
    setActiveId(additions[additions.length - 1]?.id || null);
    resolved.current.clear();
    setDetailId(null);
    setView(fullView);
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
    setDetailId(null);
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
                    aria-selected={optionIndex === i}
                    onPointerDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setOptionIndex(i)}
                    onClick={() => addCountry(name)}
                  >
                    {label(name)}
                    <span>＋</span>
                  </li>
                ))}
                {!results.length && (
                  <li role="presentation">{pieces.length >= 20 ? "Na mapě už je 20 zemí. Pro další výběr začni novou hru." : "Žádná další země nenalezena."}</li>
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
          <button
            className={styles.expand}
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? "Zmenšit mapu" : "Zvětšit mapu"}
            title={expanded ? "Zmenšit mapu" : "Zvětšit mapu"}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                d={
                  expanded
                    ? "M4 9h5V4M15 4v5h5M20 15h-5v5M9 20v-5H4"
                    : "M9 4H4v5M15 4h5v5M20 15v5h-5M9 20H4v-5"
                }
              />
            </svg>
          </button>
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
      <ProjectionGuide key={projectionId} projectionId={projectionId} />
      <div className={styles.mapArea}>
        <svg
          ref={svg}
          className={styles.map}
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
            projectionId={projectionId}
            height={mapHeight}
          />
          {ordered.map((piece) => {
            const anchor = projection([piece.lon, piece.lat]);
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
                onKeyDown={(e) => keyMove(e, piece)}
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
        <div className={styles.zoom}>
          <button
            onClick={() => zoom(1 / 1.5)}
            disabled={view.width <= WIDTH / 6}
            aria-label="Přiblížit mapu"
          >
            ＋
          </button>
          <button
            onClick={() => zoom(1.5)}
            disabled={view.width >= WIDTH}
            aria-label="Oddálit mapu"
          >
            −
          </button>
          <button
            onClick={() => {
              stopDrag();
              setView(fullView);
            }}
            aria-label="Celý svět"
            title="Celý svět"
          >
            ⌂
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
            <span>Počet obyvatel: {FACTS[detail.name]?.population}</span>
            <span>Hlavní město: {FACTS[detail.name]?.capital}</span>
            <span>{countryContext(detail.name)}</span>
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
