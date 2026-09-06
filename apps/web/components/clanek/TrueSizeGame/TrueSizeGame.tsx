"use client";

import { memo, useEffect, useId, useMemo, useRef, useState } from "react";
import type { PointerEvent as Pointer, KeyboardEvent } from "react";
import { geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { FeatureCollection } from "geojson";
import { COUNTRIES } from "./countries";
import {
  areaKm2,
  chooseRound,
  clampLat,
  COLORS,
  decodeExperiment,
  encodeExperiment,
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
  "United Kingdom",
  "Norway",
  "Sweden",
  "Finland",
  "Czechia",
  // North and South America
  "Greenland",
  "Mexico",
  "Brazil",
  "Argentina",
  "Chile",
  // Asia
  "China",
  "India",
  "Japan",
  "Russia",
  "Iran",
  "Afghanistan",
  "Mongolia",
  "Kazakhstan",
  "Saudi Arabia",
  "Turkey",
  // Africa: north, large areas and recognisable silhouettes
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
const VIEW = { x: 0, y: 0, width: WIDTH, height: HEIGHT };
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
const countryFacts: Record<
  string,
  { population: string; capital: string; note: string }
> = {
  Greenland: {
    population: "56 tisíc",
    capital: "Nuuk",
    note: "Arktida; autonomní území Dánska",
  },
  Brazil: {
    population: "203 milionů",
    capital: "Brasília",
    note: "Jižní Amerika; Mercosur je společný trh jihoamerických států",
  },
  India: {
    population: "1,43 miliardy",
    capital: "Nové Dillí",
    note: "Jižní Asie; federativní republika",
  },
  Australia: {
    population: "26 milionů",
    capital: "Canberra",
    note: "Oceánie; stát i kontinent",
  },
  Madagascar: {
    population: "31 milionů",
    capital: "Antananarivo",
    note: "Indický oceán; ostrovní stát",
  },
  Czechia: {
    population: "10,9 milionu",
    capital: "Praha",
    note: "Střední Evropa; EU je politické a hospodářské sdružení evropských států",
  },
  France: {
    population: "68 milionů",
    capital: "Paříž",
    note: "Západní Evropa; EU je politické a hospodářské sdružení evropských států",
  },
  Germany: {
    population: "84 milionů",
    capital: "Berlín",
    note: "Střední Evropa; EU je politické a hospodářské sdružení evropských států",
  },
  UnitedStates: {
    population: "340 milionů",
    capital: "Washington, D.C.",
    note: "Severní Amerika; federální republika",
  },
  China: {
    population: "1,41 miliardy",
    capital: "Peking",
    note: "Východní Asie",
  },
  Russia: {
    population: "144 milionů",
    capital: "Moskva",
    note: "Východní Evropa a severní Asie",
  },
  Japan: {
    population: "124 milionů",
    capital: "Tokio",
    note: "Východní Asie; ostrovní stát",
  },
  SouthAfrica: {
    population: "63 milionů",
    capital: "Pretoria",
    note: "Jižní Afrika; Africká unie podporuje spolupráci afrických států",
  },
};

const countryFlags: Record<string, string> = {
  Greenland: "🇬🇱",
  Brazil: "🇧🇷",
  India: "🇮🇳",
  Australia: "🇦🇺",
  Madagascar: "🇲🇬",
  Czechia: "🇨🇿",
  France: "🇫🇷",
  Germany: "🇩🇪",
  China: "🇨🇳",
  Russia: "🇷🇺",
  Japan: "🇯🇵",
  "South Africa": "🇿🇦",
  Ukraine: "🇺🇦",
  Poland: "🇵🇱",
  Spain: "🇪🇸",
  "United Kingdom": "🇬🇧",
  Norway: "🇳🇴",
  Sweden: "🇸🇪",
  Finland: "🇫🇮",
  Mexico: "🇲🇽",
  Argentina: "🇦🇷",
  Chile: "🇨🇱",
  Iran: "🇮🇷",
  Afghanistan: "🇦🇫",
  Mongolia: "🇲🇳",
  Kazakhstan: "🇰🇿",
  "Saudi Arabia": "🇸🇦",
  Turkey: "🇹🇷",
  Morocco: "🇲🇦",
  Algeria: "🇩🇿",
  Tunisia: "🇹🇳",
  Libya: "🇱🇾",
  Egypt: "🇪🇬",
  Niger: "🇳🇪",
  Chad: "🇹🇩",
  Sudan: "🇸🇩",
  Ethiopia: "🇪🇹",
  Kenya: "🇰🇪",
  Mali: "🇲🇱",
  Angola: "🇦🇴",
  Nigeria: "🇳🇬",
  Somalia: "🇸🇴",
  "Dem. Rep. Congo": "🇨🇩",
};
const projectionGuides: Record<ProjectionId, string> = {
  mercator:
    "Mercatorova projekce vznikla v 16. století pro námořní navigaci. Zachovává úhly a směry, ale směrem k pólům výrazně zvětšuje plochy.",
  equal:
    "Equal Earth je moderní plochojevná projekce z roku 2018. Dobře porovnává rozlohy kontinentů, ale tvary a úhly se od zeměkoule liší.",
  peters:
    "Gall-Petersova projekce byla navržena v 19. století. Zachovává poměr ploch, takže je vhodná pro srovnání rozloh, za cenu výrazně protažených tvarů.",
  mollweide:
    "Mollweidova projekce z roku 1805 zobrazuje celý svět jako elipsu a zachovává plochu. Používá se hlavně pro globální tematická data, například klima nebo populaci.",
  robinson:
    "Robinsonova projekce vznikla v roce 1963 jako kompromis pro školní a obecné mapy světa. Nevystihuje dokonale plochy ani úhly, ale působí vyváženě.",
  winkel:
    "Winkel-Tripelova projekce byla představena v roce 1921 a kombinuje více druhů zkreslení. Snaží se současně zmírnit chyby v plochách, tvarech i vzdálenostech.",
};

const Basemap = memo(function Basemap({
  countries,
  projectionId,
}: {
  countries: Country[];
  projectionId: ProjectionId;
}) {
  const path = geoPath(makeProjection(projectionId));
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
  const [correct, setCorrect] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [optionIndex, setOptionIndex] = useState(-1);
  const [notice, setNotice] = useState("");
  const [noticeResult, setNoticeResult] = useState<Result | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [roundMenuOpen, setRoundMenuOpen] = useState(false);
  const previousRound = useRef<string[]>(STARTERS);
  const restartButton = useRef<HTMLButtonElement>(null);
  const roundMenuId = useId();
  const [view, setView] = useState(VIEW);
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<Drag | null>(null);
  const pan = useRef<{
    pointer: number;
    x: number;
    y: number;
    view: typeof VIEW;
  } | null>(null);
  const pending = useRef<GamePiece | null>(null);
  const frame = useRef(0);
  const nextId = useRef(6);
  const resolved = useRef(new Set<number>());
  const searchId = useId();
  const byName = useMemo(
    () => new Map(countries.map((c) => [c.properties.name, c])),
    [countries],
  );
  const projection = useMemo(
    () => makeProjection(projectionId),
    [projectionId],
  );
  const path = useMemo(() => geoPath(projection), [projection]);
  const selected =
    pieces.find((p) => p.id === activeId) ||
    pieces.find((p) => !p.result) ||
    pieces[pieces.length - 1];
  const detail = pieces.find((p) => p.id === detailId);
  const ordered = useMemo(
    () =>
      [...pieces].sort(
        (a, b) => Number(a.id === selected?.id) - Number(b.id === selected?.id),
      ),
    [pieces, selected?.id],
  );
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
        const data = collection.features.filter(
          (f) =>
            (f.geometry.type === "Polygon" ||
              f.geometry.type === "MultiPolygon") &&
            f.properties?.name,
        ) as Country[];
        const map = new Map(data.map((c) => [c.properties.name, c]));
        setCountries(data);
        const saved = decodeExperiment(window.location.hash, map);
        const initial: GamePiece[] = saved
          ? saved.pieces.map((p) => ({ ...p, anonymous: false }))
          : STARTERS.filter((n) => map.has(n)).map((name, i) => ({
              id: i + 1,
              name,
              lon: START_POSITIONS[i]?.[0] ?? 0,
              lat: START_POSITIONS[i]?.[1] ?? 10,
              angle: 0,
              pinned: false,
              color: COLORS[i % COLORS.length],
              anonymous: true,
            }));
        setPieces(initial);
        previousRound.current = initial.map((piece) => piece.name);
        setActiveId(initial[initial.length - 1]?.id || null);
        nextId.current = initial.length + 1;
        if (saved) setProjectionId(saved.projection);
        else if (window.location.hash.startsWith("#mapa="))
          setNotice("Odkaz se nepodařilo načíst. Začíná nová hra.");
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => controller.abort();
  }, [retry]);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  useEffect(() => {
    const text = projectionGuides[projectionId];
    let index = 0;
    setProjectionText("");
    const timer = window.setInterval(() => {
      index += 1;
      setProjectionText(text.slice(0, index));
      if (index >= text.length) window.clearInterval(timer);
    }, 18);
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
  }
  function update(piece: GamePiece) {
    setPieces((prev) => prev.map((p) => (p.id === piece.id ? piece : p)));
  }
  function select(piece: GamePiece) {
    setActiveId(piece.id);
    setDetailId(piece.anonymous && !piece.result ? null : piece.id);
    setNotice("");
  }
  function addCountry(name: string) {
    if (pieces.length >= 20) {
      setNotice("Na mapě může být 20 zemí. Některou nejdřív odeber.");
      return;
    }
    if (pieces.some((p) => p.name === name)) return;
    const piece: GamePiece = {
      id: nextId.current++,
      name,
      lon: START_POSITIONS[pieces.length % START_POSITIONS.length]?.[0] ?? 0,
      lat: START_POSITIONS[pieces.length % START_POSITIONS.length]?.[1] ?? 10,
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
    setNotice("");
  }
  function newGame(count: 5 | 10 | 15) {
    stopDrag();
    const pool = CURATED_COUNTRIES.filter((name) => {
      const country = byName.get(name);
      return country && COUNTRIES[name]?.target && areaKm2(country) >= 50000;
    });
    const names = chooseRound(pool, previousRound.current, count);
    // Keep each round visually and geographically varied when the random draw
    // happens to cluster in one region.
    const represented = new Set(
      names.map((name) => COUNTRIES[name]?.continent),
    );
    if (represented.size < Math.min(3, count)) {
      const replacements = pool.filter(
        (name) =>
          !names.includes(name) && !represented.has(COUNTRIES[name]?.continent),
      );
      for (let i = 0; i < names.length && replacements.length; i += 1) {
        const continent = COUNTRIES[names[i]]?.continent;
        if (represented.has(continent)) continue;
        const replacement = replacements.shift();
        if (!replacement) break;
        names[i] = replacement;
        represented.add(COUNTRIES[replacement]?.continent);
      }
    }
    previousRound.current = names;
    const additions: GamePiece[] = names.map((name, i) => ({
      id: nextId.current++,
      name,
      lon: START_POSITIONS[i % START_POSITIONS.length]?.[0] ?? 0,
      lat: START_POSITIONS[i % START_POSITIONS.length]?.[1] ?? 10,
      angle: 0,
      pinned: false,
      color: COLORS[i % COLORS.length],
      anonymous: true,
    }));
    setPieces(additions);
    setActiveId(additions[additions.length - 1]?.id || null);
    setCorrect(0);
    setAttempts(0);
    resolved.current.clear();
    setNotice("");
    setDetailId(null);
    setShareUrl("");
    setView(VIEW);
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
    setAttempts((n) => n + 1);
    if (success) setCorrect((n) => n + 1);
    setNotice("");
    setNoticeResult(null);
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
    if (e.button !== 0 || drag.current || pan.current) return;
    e.stopPropagation();
    setActiveId(piece.id);
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
  function onMove(e: Pointer<SVGSVGElement>) {
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
      const height = (width * HEIGHT) / WIDTH;
      return width === WIDTH
        ? VIEW
        : {
            x: old.x + (old.width - width) / 2,
            y: old.y + (old.height - height) / 2,
            width,
            height,
          };
    });
  }
  async function share() {
    const url = new URL(window.location.href);
    url.hash = "mapa=" + encodeExperiment(projectionId, pieces);
    setShareUrl(url.toString());
    try {
      await navigator.clipboard.writeText(url.toString());
      setNotice("Odkaz na mapu je zkopírovaný.");
    } catch {
      setNotice("Odkaz můžeš zkopírovat z pole.");
    }
    setNoticeResult(null);
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
                  <li role="presentation">Žádná další země nenalezena.</li>
                )}
              </ul>
            )}
          </div>
          <label className={styles.projection}>
            <select
              aria-label="Typ zobrazení"
              value={projectionTouched ? projectionId : ""}
              onChange={(e) => {
                stopDrag();
                setProjectionTouched(true);
                setProjectionId(e.target.value as ProjectionId);
                setView(VIEW);
              }}
            >
              <option value="" disabled>
                Typ zobrazení
              </option>
              {PROJECTIONS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <button
            className={styles.expand}
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? "Zavřít velkou mapu" : "Zvětšit mapu"}
            title={expanded ? "Zavřít" : "Zvětšit mapu"}
          >
            {expanded ? "⤡" : "⤢"}
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
            <button
              onClick={share}
              disabled={!pieces.length}
              aria-label="Sdílet mapu"
              title="Sdílet mapu"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 17 17 7" />
                <path d="M10 7h7v7" />
              </svg>
            </button>
          </div>
        </div>
        <div
          className={styles.score}
          aria-label={`${attempts ? Math.round((correct / attempts) * 100) : 0}% správně`}
          title="Správné / ověřené pokusy"
        >
          <span aria-hidden="true">✓</span>{" "}
          {attempts ? Math.round((correct / attempts) * 100) : 0}%
        </div>
      </div>
      <div className={styles.mapArea}>
        <svg
          ref={svg}
          className={styles.map}
          viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`}
          aria-label="Mapa. Obrys přesuň tažením nebo šipkami, polohu ověř fajfkou."
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={cancelDrag}
          onLostPointerCapture={() => {
            if (drag.current || pan.current) cancelDrag();
          }}
          onPointerDown={(e) => {
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
          <Basemap countries={countries} projectionId={projectionId} />
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
                {anchor && (
                  <g transform={`translate(${anchor[0]},${anchor[1]})`}>
                    <circle r={r * 2.3} fill="transparent" />
                    <circle
                      r={r}
                      fill={piece.color}
                      stroke="#fdfbf7"
                      strokeWidth={1.5}
                      vectorEffect="non-scaling-stroke"
                    />
                    {(!piece.anonymous || piece.result) && (
                      <text
                        y={-r - 5}
                        className={styles.countryLabel}
                        textAnchor="middle"
                      >
                        {label(piece.name)}
                      </text>
                    )}
                  </g>
                )}
              </g>
            );
          })}
        </svg>
        <aside className={styles.projectionGuide} aria-live="polite">
          <strong>
            {PROJECTIONS.find((item) => item.id === projectionId)?.name}
          </strong>
          <span>{projectionText}</span>
        </aside>
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
              setView(VIEW);
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
              onClick={() => setDetailId(null)}
              aria-label="Zavřít detail"
            >
              ×
            </button>
            <strong style={{ color: detail.color }}>
              <span className={styles.detailFlag} aria-hidden="true">
                {countryFlags[detail.name] || "🌐"}
              </span>{" "}
              {label(detail.name)}
            </strong>
            <small>
              ≈ {number.format(areaKm2(byName.get(detail.name)!))} km²
            </small>
            <span>
              Počet obyvatel:{" "}
              {countryFacts[detail.name]?.population || "údaj není k dispozici"}
            </span>
            <span>
              Hlavní město:{" "}
              {countryFacts[detail.name]?.capital || "údaj není k dispozici"}
            </span>
            <span>
              {countryFacts[detail.name]?.note ||
                `Geografická poloha: ${COUNTRIES[detail.name]?.continent || "svět"}`}
            </span>
          </aside>
        )}
        {shareUrl && (
          <div className={styles.share}>
            <input
              aria-label="Odkaz na mapu"
              readOnly
              value={shareUrl}
              onFocus={(e) => e.target.select()}
            />
            <button onClick={() => setShareUrl("")} aria-label="Zavřít odkaz">
              ×
            </button>
          </div>
        )}
        <div className={styles.credit}>
          <a
            href="https://thetruesize.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            The True Size Of…
          </a>
        </div>
        <div className={styles.creditBrand}>DataTimes.cz</div>
      </div>
    </section>
  );
}
