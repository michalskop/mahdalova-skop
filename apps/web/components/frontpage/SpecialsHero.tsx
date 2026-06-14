'use client';

import { Box, Group, Stack, Title, Paper } from '@mantine/core';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Arrow } from '@repo/ui/components/Arrow';

const BG = '#044d5e';
const WHITE = '#ffffff';
const AUTOPLAY_MS = 6000;
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
// coverImage: cesta z /public/images/specials/ — stačí sem přidat soubor a vyplnit cestu.
// Pokud coverImage chybí, zobrazí se SVG ikona (logoType).
const TILES = [
  { href: '/special/data-pro-budouci-premierku', title: 'Data pro budoucí premiérku', bg: '#ff3f30', external: false, logoType: 'dpbp', coverImage: '/images/specials/data-pro-budouci-premierku.svg' },
  { href: '/special/svobodna-media', title: 'Svobodná média', bg: '#812840', external: false, logoType: 'media', coverImage: '/images/specials/svobodna-media.svg' },
  { href: '/special/investigace', title: 'M & Š investigace', bg: '#351040', external: false, logoType: 'lupa', coverImage: '/images/specials/investigace.svg' },
  { href: 'https://snemovna.datatimes.cz', title: 'Sněmovna DataTimes.cz', bg: '#2f325c', external: true, logoType: 'flag', coverImage: '/images/specials/snemovna.svg' },
  { href: 'https://mandaty.cz', title: 'Mandáty.cz', bg: 'linear-gradient(90deg, #f71b4b, #101432)', external: true, logoType: 'mandaty', coverImage: '/images/specials/mandaty.svg' },
  { href: '/special/klima', title: 'Data o klimatu', bg: 'linear-gradient(135deg, #2a3f04, #639e0a)', external: false, logoType: 'klima', coverImage: '/images/specials/klima.svg' },
];

const POSITIONS = TILES.length - VISIBLE + 1; // 4 pozice (0–3)

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

  if (hasCover) {
    // Obrázková dlaždice — fotografický fill + tmavý gradient na titulku
    return (
      <a href={href} target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className="special-tile"
        style={{ textDecoration: 'none', display: 'block', flexShrink: 0 }}>
        <Box className="specials-tile" style={{
          borderRadius: 12, overflow: 'hidden', aspectRatio: '1 / 1',
          position: 'relative', cursor: 'pointer',
          transition: 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}>
          <img src={coverImage} alt={title}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <Box style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)',
          }} />
          <Box style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '12px 16px 16px',
          }}>
            <Title order={3} style={{ color: WHITE, fontFamily: "'Roboto Slab', Georgia, serif", fontWeight: 500, fontSize: 'var(--mantine-font-size-lg)', lineHeight: 1.35 }}>
              {title}
            </Title>
          </Box>
        </Box>
      </a>
    );
  }

  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="special-tile"
      style={{ textDecoration: 'none', display: 'block', flexShrink: 0 }}
    >
      <Box style={{
        background: bg,
        borderRadius: 12,
        overflow: 'hidden',
        aspectRatio: '1 / 1',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }} className="specials-tile">
        {/* Logo area */}
        <Box style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: isFullBleed ? 0 : '16px 16px 0',
          minHeight: 0,
        }}>
          <TileLogo type={logoType} />
        </Box>
        {/* Title bar */}
        <Box style={{
          width: '100%',
          padding: '12px 16px 16px',
          background: 'rgba(0,0,0,0.28)',
          minHeight: 68,
          display: 'flex',
          alignItems: 'flex-start',
          flexShrink: 0,
        }}>
          <Title order={3} style={{
            color: WHITE,
            fontFamily: "'Roboto Slab', Georgia, serif",
            fontWeight: 500,
            fontSize: 'var(--mantine-font-size-lg)',
            lineHeight: 1.35,
          }}>
            {title}
          </Title>
        </Box>
      </Box>
    </a>
  );
}

/* ── Plynulý scroll přes RAF ─────────────────────────────────────── */
const SCROLL_DURATION = 700; // ms — čím více, tím pomalejší a plynulejší

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function animateScroll(el: HTMLElement, targetLeft: number) {
  const startLeft = el.scrollLeft;
  const distance = targetLeft - startLeft;
  if (Math.abs(distance) < 1) return;
  const startTime = performance.now();
  // dočasně vypneme snap, aby nepřerušoval animaci
  const prevSnap = el.style.scrollSnapType;
  el.style.scrollSnapType = 'none';
  function step(now: number) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / SCROLL_DURATION, 1);
    el.scrollLeft = startLeft + distance * easeInOut(progress);
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.style.scrollSnapType = prevSnap;
    }
  }
  requestAnimationFrame(step);
}

/* ── SpecialsHero ─────────────────────────────────────────────────── */
export default function SpecialsHero() {
  const [titleHovered, setTitleHovered] = useState(false);
  const [pos, setPos] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Posune karusel na pozici p (0 = dlaždice 0,1,2 vlevo)
  const scrollToPos = useCallback((p: number) => {
    const track = trackRef.current;
    if (!track) return;
    const tile = track.firstElementChild as HTMLElement | null;
    if (!tile) return;
    const tileW = tile.offsetWidth + GAP;
    animateScroll(track, p * tileW);
    setPos(p);
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setPos(p => {
        const next = (p + 1) % POSITIONS;
        const track = trackRef.current;
        if (track) {
          const tile = track.firstElementChild as HTMLElement | null;
          if (tile) animateScroll(track, next * (tile.offsetWidth + GAP));
        }
        return next;
      });
    }, AUTOPLAY_MS);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  function handleDot(i: number) {
    scrollToPos(i);
    resetTimer();
  }

  return (
    <>
      <style>{`
        .specials-tile:hover { transform: scale(1.025); }
        .carousel-track {
          display: flex;
          gap: ${GAP}px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scrollbar-width: none;
        }
        .carousel-track::-webkit-scrollbar { display: none; }
        .carousel-tile {
          flex: 0 0 calc((100% - ${GAP * (VISIBLE - 1)}px) / ${VISIBLE});
          scroll-snap-align: start;
        }
      `}</style>

      <Paper py={20} bg={BG} radius={0}>
        <Group gap={0} align="flex-start" wrap="wrap">

          {/* Nadpis vlevo */}
          <Stack w={{ base: '100%', md: 200 }} mb={{ base: 'xs', md: 0 }} pt={15} pl={{ base: 'md', md: 'md' }}>
            <a
              href="/special"
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
          <Box flex={1} px="md" style={{ minWidth: 0 }}>
            {/* Track */}
            <Box ref={trackRef} className="carousel-track">
              {TILES.map((tile) => (
                <Box key={tile.title} className="carousel-tile">
                  <SpecialTile {...tile} />
                </Box>
              ))}
            </Box>

            {/* Tečky — jedna na každou pozici */}
            <Group gap={7} justify="center" mt={12}>
              {Array.from({ length: POSITIONS }).map((_, i) => (
                <Box
                  key={i}
                  onClick={() => handleDot(i)}
                  style={{
                    width: i === pos ? 22 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: i === pos ? WHITE : 'rgba(255,255,255,0.28)',
                    cursor: 'pointer',
                    transition: 'width 0.4s ease, background 0.4s ease',
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
