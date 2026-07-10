'use client';

import { Box, Group, Stack, Title, Paper } from '@mantine/core';
import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { Arrow } from '@repo/ui/components/Arrow';

const BG = '#044d5e';
const WHITE = '#ffffff';
const GAP = 16;
const VISIBLE = 3;

/* ── SVG loga ────────────────────────────────────────────────────── */
const DpbpLogo = () => (
  <svg viewBox="-8 -8 716 716" xmlns="http://www.w3.org/2000/svg" overflow="visible"
    style={{ width: '100%', height: '100%', display: 'block' }}>
    <defs>
      <clipPath id="sil-clip-hero">
        <path transform="translate(-117.098299,796.836783) scale(0.100000,-0.100000)"
          d="M4505 7963 c-130 -6 -403 -34 -524 -53 -875 -143 -1458 -484 -1863
-1090 -346 -518 -477 -1123 -368 -1705 43 -227 39 -248 -73 -460 -80 -152
-188 -320 -354 -551 -209 -292 -206 -335 33 -435 232 -98 281 -180 198 -336
-79 -149 -63 -208 69 -257 80 -30 86 -62 22 -137 -73 -85 -67 -119 34 -223 97
-99 125 -156 153 -308 35 -198 89 -290 200 -339 72 -32 227 -32 338 0 487 140
868 94 1071 -127 132 -144 194 -445 149 -727 -30 -196 -25 -214 37 -117 392
610 481 1639 233 2680 -56 232 -151 553 -257 860 -212 618 -252 809 -240 1147
28 809 505 1251 1512 1400 322 47 693 35 950 -31 455 -117 664 -411 601 -843
-23 -155 -12 -163 42 -31 99 245 86 520 -34 708 -290 453 -1118 597 -2214 386
-102 -19 -277 -55 -390 -79 -274 -57 -296 -60 -326 -40 -95 62 112 247 407
364 466 185 1039 256 1523 190 135 -18 160 -18 140 0 -28 27 -336 105 -494
125 -129 16 -422 37 -475 34 -16 -1 -61 -3 -100 -5z" />
      </clipPath>
    </defs>
    <g><g clipPath="url(#sil-clip-hero)"><rect x="0" y="0" width="700" height="700" fill="#351040" /></g></g>
    <circle cx="358.4" cy="156.6" r="40.6" fill="#3391b5" /><circle cx="412.8" cy="347.0" r="35.3" fill="#34638b" />
    <circle cx="340.9" cy="512.7" r="24.7" fill="#351343" /><circle cx="280.6" cy="220.0" r="24.7" fill="#34628a" />
    <circle cx="379.8" cy="253.5" r="21.2" fill="#34789e" /><circle cx="311.7" cy="364.6" r="17.6" fill="#343b67" />
    <circle cx="537.3" cy="304.7" r="17.6" fill="#339cbf" /><circle cx="313.7" cy="292.3" r="17.6" fill="#34547e" />
    <circle cx="449.8" cy="213.0" r="17.6" fill="#339dc0" /><circle cx="358.4" cy="435.1" r="15.9" fill="#353360" />
    <circle cx="471.2" cy="424.6" r="12.3" fill="#345d86" /><circle cx="525.6" cy="361.1" r="12.3" fill="#3485aa" />
    <circle cx="469.2" cy="280.0" r="12.3" fill="#348db1" /><circle cx="457.6" cy="138.9" r="12.3" fill="#33b9d9" />
    <circle cx="412.8" cy="488.0" r="8.8" fill="#353460" /><circle cx="539.2" cy="234.1" r="8.8" fill="#33b4d5" />
  </svg>
);

const LupaIcon = () => (
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"
    style={{ width: '55%', height: '55%' }}>
    <circle cx="82" cy="82" r="52" fill="none" stroke="#de1743" strokeWidth="16" />
    <line x1="120" y1="120" x2="172" y2="172" stroke="#de1743" strokeWidth="16" strokeLinecap="round" />
  </svg>
);

const MandatyM = () => (
  <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" style={{ width: '65%', height: '65%' }}>
    <defs>
      <linearGradient id="mg-h" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f71b4b" /><stop offset="100%" stopColor="#101432" />
      </linearGradient>
    </defs>
    <text x="150" y="240" textAnchor="middle" fontFamily="'Roboto Slab',serif" fontWeight="700" fontSize="240" fill="url(#mg-h)">M</text>
  </svg>
);

const CzechFlag = () => (
  <svg viewBox="0 0 200 133" xmlns="http://www.w3.org/2000/svg" style={{ width: '70%', height: '70%' }}>
    <rect width="200" height="133" rx="6" fill="#fff" />
    <rect y="66.5" width="200" height="66.5" fill="#de1743" />
    <path d="M0,0 L100,66.5 L0,133 Z" fill="#4a51ab" />
  </svg>
);

const KlimaIcon = () => (
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '55%', height: '55%' }}>
    <rect x="88" y="20" width="24" height="110" rx="12" fill="none" stroke="#de1743" strokeWidth="5" />
    <circle cx="100" cy="148" r="28" fill="none" stroke="#de1743" strokeWidth="5" />
    <rect x="91" y="80" width="18" height="72" rx="9" fill="#de1743" />
    <circle cx="100" cy="148" r="18" fill="#de1743" />
    <line x1="112" y1="40" x2="130" y2="40" stroke="#de1743" strokeWidth="4" strokeLinecap="round" />
    <line x1="112" y1="60" x2="130" y2="60" stroke="#de1743" strokeWidth="4" strokeLinecap="round" />
    <line x1="112" y1="80" x2="130" y2="80" stroke="#de1743" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

/* ── Data dlaždic ─────────────────────────────────────────────────── */
// coverImage: cesta z /public/images/specials/ – stačí sem přidat soubor a vyplnit cestu.
// Pokud coverImage chybí, zobrazí se SVG ikona (logoType).
const TILES = [
  { href: '/specialy/data-pro-budouci-premierku', title: 'Data pro budoucí premiérku', bg: '#ff3f30', external: false, logoType: 'dpbp', coverImage: '/images/specials/data-pro-budouci-premierku.svg' },
  { href: '/specialy/karlovy-vary', title: 'Festival Karlovy Vary v datech', bg: '#121212', external: false, logoType: 'kviff', coverImage: '/images/specials/karlovy-vary.svg' },
  { href: '/specialy/svobodna-media', title: 'Svobodná média', bg: '#812840', external: false, logoType: 'media', coverImage: '/images/specials/svobodna-media.svg' },
  { href: '/specialy/investigace', title: 'M & Š investigace', bg: '#351040', external: false, logoType: 'lupa', coverImage: '/images/specials/investigace.svg' },
  { href: 'https://snemovna.datatimes.cz', title: 'Sněmovna.DataTimes.cz', bg: '#2f325c', external: true, logoType: 'flag', coverImage: '/images/specials/snemovna.svg' },
  { href: 'https://mandaty.cz', title: 'Mandáty.cz', bg: 'linear-gradient(90deg, #f71b4b, #101432)', external: true, logoType: 'mandaty', coverImage: '/images/specials/mandaty.svg' },
  { href: '/specialy/klima', title: 'Data o klimatu', bg: 'linear-gradient(135deg, #2a3f04, #639e0a)', external: false, logoType: 'klima', coverImage: '/images/specials/klima.svg' },
];

// Nekonečná smyčka: klonujeme VISIBLE dlaždic na začátek a konec tracku.
const N = TILES.length;
const EXT_TILES = [...TILES.slice(-VISIBLE), ...TILES, ...TILES.slice(0, VISIBLE)];
const EXT_START = VISIBLE; // index první skutečné dlaždice v EXT_TILES

function renderSpecialTitle(title: string) {
  if (title !== 'Festival Karlovy Vary v datech') return title;

  return (
    <>
      Festival Karlovy Vary
      <br className="kviff-mobile-title-break" />
      <span className="kviff-desktop-title-space"> </span>
      v datech
    </>
  );
}

function TileLogo({ type }: { type: string }) {
  if (type === 'dpbp') return <DpbpLogo />;
  if (type === 'lupa') return <LupaIcon />;
  if (type === 'mandaty') return <MandatyM />;
  if (type === 'flag') return <CzechFlag />;
  if (type === 'klima') return <KlimaIcon />;
  if (type === 'media') return (
    <img src="/images/svobodna-media-logo.svg" alt="Svobodná média"
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
  );
  return null;
}

/* ── Tile ─────────────────────────────────────────────────────────── */
function SpecialTile({ href, title, bg, external, logoType, coverImage }: typeof TILES[0]) {
  const hasCover = Boolean(coverImage);
  const isFullBleed = logoType === 'media' || hasCover;

  const base: React.CSSProperties = {
    textDecoration: 'none',
    display: 'block',
    flexShrink: 0,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative' as const,
    cursor: 'pointer',
    transition: 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    aspectRatio: '1 / 1',
  };

  if (hasCover) {
    return (
      <a href={href} target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className="specials-tile"
        style={{ ...base, position: 'relative' }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: `url(${coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 16px 16px' }}>
          <Title order={3} style={{ color: WHITE, fontFamily: "'Roboto Slab', Georgia, serif", fontWeight: 500, fontSize: 'var(--mantine-font-size-lg)', lineHeight: 1.35 }}>
            {renderSpecialTitle(title)}
          </Title>
        </div>
      </a>
    );
  }

  return (
    <a href={href} target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="specials-tile"
      style={{ ...base, background: bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: isFullBleed ? 0 : '16px 16px 0', minHeight: 0 }}>
        <TileLogo type={logoType} />
      </div>
      <div style={{ width: '100%', padding: '12px 16px 16px', background: 'rgba(0,0,0,0.28)', minHeight: 68, display: 'flex', alignItems: 'flex-start', flexShrink: 0 }}>
        <Title order={3} style={{ color: WHITE, fontFamily: "'Roboto Slab', Georgia, serif", fontWeight: 500, fontSize: 'var(--mantine-font-size-lg)', lineHeight: 1.35 }}>
          {renderSpecialTitle(title)}
        </Title>
      </div>
    </a>
  );
}

/* ── Animace scrollu přes RAF, vrací cancel funkci ───────────────── */
const SCROLL_DURATION = 700;

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function animateScroll(el: HTMLElement, targetLeft: number, duration = SCROLL_DURATION): () => void {
  const startLeft = el.scrollLeft;
  const distance = targetLeft - startLeft;
  if (Math.abs(distance) < 1) return () => {};
  let frameId: number | null = null;
  let cancelled = false;
  const startTime = performance.now();
  el.style.scrollSnapType = 'none';
  function step(now: number) {
    if (cancelled) return;
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    el.scrollLeft = startLeft + distance * easeInOut(progress);
    if (progress < 1) {
      frameId = requestAnimationFrame(step);
    } else {
      el.style.scrollSnapType = '';
    }
  }
  frameId = requestAnimationFrame(step);
  return () => {
    cancelled = true;
    if (frameId !== null) cancelAnimationFrame(frameId);
    el.style.scrollSnapType = '';
  };
}

/* ── SpecialsHero ─────────────────────────────────────────────────── */
export default function SpecialsHero({ sectionLink = '/specialy' }: { sectionLink?: string }) {
  const [titleHovered, setTitleHovered] = useState(false);
  const [logicalPos, setLogicalPos] = useState(0);
  const [dragging, setDragging] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(EXT_START);
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);
  const draggingRef = useRef(false);
  const wrapping = useRef(false);
  const dragOccurred = useRef(false);
  const velEvents = useRef<Array<{ x: number; t: number }>>([]);
  const cancelAnimRef = useRef<(() => void) | null>(null);
  const wrapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchAxis = useRef<'h' | 'v' | null>(null);

  const getTileW = () => {
    const inner = innerRef.current;
    if (!inner) return 0;
    const tile = inner.firstElementChild as HTMLElement | null;
    return tile ? tile.getBoundingClientRect().width + GAP : 0;
  };

  // Zruší probíhající RAF animaci i čekající wrap setTimeout
  const cancelCurrentAnim = useCallback(() => {
    if (cancelAnimRef.current) { cancelAnimRef.current(); cancelAnimRef.current = null; }
    if (wrapTimerRef.current) { clearTimeout(wrapTimerRef.current); wrapTimerRef.current = null; wrapping.current = false; }
  }, []);

  // Okamžitý skok bez animace (při přechodu klon→skutečná dlaždice)
  const jumpTo = useCallback((extPos: number) => {
    const track = trackRef.current;
    const tileW = getTileW();
    if (!track || !tileW) return;
    track.style.scrollSnapType = 'none';
    track.scrollLeft = extPos * tileW;
    posRef.current = extPos;
    setLogicalPos((extPos - EXT_START + N) % N);
    requestAnimationFrame(() => {
      if (trackRef.current) trackRef.current.style.scrollSnapType = '';
    });
  }, []);

  // Animovaný posun + silent wrap po animaci
  const goToExt = useCallback((extPos: number, duration = SCROLL_DURATION) => {
    const track = trackRef.current;
    const tileW = getTileW();
    if (!track || !tileW) return;
    if (cancelAnimRef.current) cancelAnimRef.current();
    cancelAnimRef.current = animateScroll(track, extPos * tileW, duration);
    posRef.current = extPos;
    setLogicalPos((extPos - EXT_START + N) % N);

    if (!wrapping.current) {
      wrapping.current = true;
      wrapTimerRef.current = setTimeout(() => {
        const ep = posRef.current;
        if (ep >= N + EXT_START) jumpTo(ep - N);
        else if (ep < EXT_START) jumpTo(ep + N);
        wrapping.current = false;
        wrapTimerRef.current = null;
      }, duration + 80);
    }
  }, [jumpTo]);

  // Inicializace: nastavíme scroll na EXT_START (první skutečná dlaždice)
  useLayoutEffect(() => {
    const track = trackRef.current;
    const tileW = getTileW();
    if (track && tileW) {
      track.style.scrollSnapType = 'none';
      track.scrollLeft = EXT_START * tileW;
    }
    return () => { cancelCurrentAnim(); };
  }, [cancelCurrentAnim]);

  // Při resize přepočítáme scrollLeft podle aktuální šířky dlaždic
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(() => {
      cancelCurrentAnim();
      const tileW = getTileW();
      if (!tileW) return;
      track.style.scrollSnapType = 'none';
      track.scrollLeft = posRef.current * tileW;
      requestAnimationFrame(() => {
        if (trackRef.current) trackRef.current.style.scrollSnapType = '';
      });
    });
    observer.observe(track);
    return () => observer.disconnect();
  }, [cancelCurrentAnim]);

  function handleDot(i: number) {
    goToExt(i + EXT_START);
  }

  function getVelocity(): number {
    const ev = velEvents.current;
    if (ev.length < 2) return 0;
    const dt = ev[ev.length - 1].t - ev[0].t;
    if (dt < 16) return 0;
    return (ev[ev.length - 1].x - ev[0].x) / dt; // px/ms, kladná = pohyb doprava
  }

  // Ukončení dragu: snapne na nejbližší dlaždici s momentem dle rychlosti.
  function finishDrag(endX: number) {
    draggingRef.current = false;
    setDragging(false);
    const diff = endX - dragStartX.current;
    const track = trackRef.current;
    const tileW = getTileW();
    if (!track || !tileW) { velEvents.current = []; return; }

    if (Math.abs(diff) > 12) {
      // velocity kladná = pohyb doprava = scrollLeft klesá → odečítáme
      const velocity = getVelocity();
      const projected = track.scrollLeft - velocity * 320;
      const targetPos = Math.round(projected / tileW);
      const currentPos = Math.round(track.scrollLeft / tileW);
      const steps = Math.abs(targetPos - currentPos);
      const duration = Math.min(600, 200 + steps * 160);
      goToExt(targetPos, duration);
    } else {
      dragOccurred.current = false;
      cancelAnimRef.current = animateScroll(track, posRef.current * tileW, 260);
    }
    velEvents.current = [];
  }

  // ── Touch ─────────────────────────────────────────────────────────
  function onTouchStart(e: React.TouchEvent) {
    // Don't cancel animation yet — wait until we know the gesture axis.
    const t = e.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
    touchAxis.current = null;
    dragOccurred.current = false;
    velEvents.current = [{ x: t.clientX, t: performance.now() }];
  }
  function onTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null || touchStartY.current === null || !trackRef.current) return;
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;

    // Determine axis on first significant movement
    if (touchAxis.current === null) {
      const adx = Math.abs(x - touchStartX.current);
      const ady = Math.abs(y - touchStartY.current);
      if (adx < 5 && ady < 5) return;
      touchAxis.current = adx >= ady ? 'h' : 'v';
      if (touchAxis.current === 'h') {
        cancelCurrentAnim();
        // Re-anchor to current position to avoid a jump
        dragStartX.current = x;
        dragStartScroll.current = trackRef.current.scrollLeft;
      }
    }

    if (touchAxis.current === 'v') return; // let browser handle vertical scroll

    const dx = x - dragStartX.current;
    if (Math.abs(dx) > 5) dragOccurred.current = true;
    velEvents.current.push({ x, t: performance.now() });
    if (velEvents.current.length > 6) velEvents.current.shift();
    trackRef.current.scrollLeft = dragStartScroll.current - dx;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const axis = touchAxis.current;
    touchStartX.current = null;
    touchStartY.current = null;
    touchAxis.current = null;

    if (axis !== 'h') {
      // Vertical or undetermined gesture — don't snap the carousel
      dragOccurred.current = false;
      velEvents.current = [];
      return;
    }

    if (dragOccurred.current) e.preventDefault();
    finishDrag(e.changedTouches[0].clientX);
  }

  // ── Mouse ─────────────────────────────────────────────────────────
  function onMouseDown(e: React.MouseEvent) {
    cancelCurrentAnim();
    draggingRef.current = true;
    setDragging(true);
    dragOccurred.current = false;
    dragStartX.current = e.clientX;
    dragStartScroll.current = trackRef.current?.scrollLeft ?? 0;
    velEvents.current = [{ x: e.clientX, t: performance.now() }];
    e.preventDefault();
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!draggingRef.current || !trackRef.current) return;
    const x = e.clientX;
    const dx = x - dragStartX.current;
    if (Math.abs(dx) > 5) dragOccurred.current = true;
    trackRef.current.scrollLeft = dragStartScroll.current - dx;
    velEvents.current.push({ x, t: performance.now() });
    if (velEvents.current.length > 6) velEvents.current.shift();
    e.preventDefault();
  }
  function onMouseUp(e: React.MouseEvent) {
    if (!draggingRef.current) return;
    finishDrag(e.clientX);
  }
  function onMouseLeave(e: React.MouseEvent) {
    if (draggingRef.current) finishDrag(e.clientX);
  }
  function onDragStart(e: React.DragEvent) { e.preventDefault(); }

  // Zachytí kliknutí na <a> dlaždic – pokud předcházel drag, klik zablokuje
  function onClickCapture(e: React.MouseEvent) {
    if (dragOccurred.current) {
      e.preventDefault();
      e.stopPropagation();
      dragOccurred.current = false;
    }
  }

  return (
    <>
      <style>{`
        .specials-tile { -webkit-mask-image: -webkit-radial-gradient(white, black); }
        .specials-tile:hover { transform: scale(1.025); }
        .specials-tile::after {
          content: '';
          position: absolute;
          inset: 0;
          border: 1px solid var(--mantine-color-default-border);
          border-radius: inherit;
          pointer-events: none;
          z-index: 10;
        }
        .carousel-outer {
          overflow: hidden;
          padding: 16px;
          margin: -16px;
          cursor: grab;
        }
        .carousel-outer.is-dragging { cursor: grabbing; }
        .carousel-track {
          display: flex;
          gap: ${GAP}px;
          overflow: visible;
          scrollbar-width: none;
        }
        .carousel-track::-webkit-scrollbar { display: none; }
        .carousel-tile {
          flex: 0 0 calc((100% - ${GAP * (VISIBLE - 1)}px) / ${VISIBLE});
        }
        .kviff-mobile-title-break { display: none; }
        .kviff-desktop-title-space { display: inline; }
        @media (max-width: 640px) {
          .kviff-mobile-title-break { display: block; }
          .kviff-desktop-title-space { display: none; }
        }
      `}</style>

      <Paper py={20} bg={BG} radius={0}>
        <Group gap={0} align="flex-start" wrap="wrap">

          {/* Nadpis vlevo */}
          <Stack w={{ base: '100%', md: 200 }} mb={{ base: 'xs', md: 0 }} pt={15} pl={{ base: 'md', md: 'md' }}>
            <a
              href={sectionLink}
              onMouseEnter={() => setTitleHovered(true)}
              onMouseLeave={() => setTitleHovered(false)}
              style={{ textDecoration: titleHovered ? 'underline' : 'none', display: 'inline-flex', color: WHITE }}
            >
              <Title order={2} style={{ display: 'flex', alignItems: 'center', gap: 5, color: WHITE }}>
                Speciály
                <Arrow size={80} color={WHITE} />
              </Title>
            </a>
          </Stack>

          {/* Karusel vpravo */}
          <Box flex={1} px="md" style={{ minWidth: 0, overflow: 'visible' }}>
            {/* Outer: scroll container + horizontální clip */}
            <div
              ref={trackRef}
              className={`carousel-outer${dragging ? ' is-dragging' : ''}`}
              style={{ userSelect: 'none' }}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseLeave}
              onClickCapture={onClickCapture}
              onDragStart={onDragStart}
            >
            {/* Track – flex, overflow visible, dlaždice se mohou vertikálně přetéct při scale */}
            <Box ref={innerRef} className="carousel-track">
              {EXT_TILES.map((tile, i) => (
                <Box key={`${tile.title}-${i}`} className="carousel-tile">
                  <SpecialTile {...tile} />
                </Box>
              ))}
            </Box>
            </div>

            {/* Tečky – jedna na každou dlaždici, aktivní je sytější */}
            <Group gap={8} justify="center" mt={12}>
              {TILES.map((_, i) => (
                <Box
                  key={i}
                  onClick={() => handleDot(i)}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: WHITE,
                    opacity: i === logicalPos ? 1 : 0.3,
                    cursor: 'pointer',
                    transition: 'opacity 0.35s ease',
                    flexShrink: 0,
                  }}
                />
              ))}
            </Group>
          </Box>

        </Group>
      </Paper>
    </>
  );
}
