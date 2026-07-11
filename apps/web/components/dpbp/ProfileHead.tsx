'use client';

import { useCallback, useId, useRef, useState } from 'react';

// Profile-head silhouette used across the DPBP special (homepage hero +
// chapter headers). One shared SVG source so colour/shape tweaks only need
// to happen in one place.
const SIL_PATH = "M4505 7963 c-130 -6 -403 -34 -524 -53 -875 -143 -1458 -484 -1863 -1090 -346 -518 -477 -1123 -368 -1705 43 -227 39 -248 -73 -460 -80 -152 -188 -320 -354 -551 -209 -292 -206 -335 33 -435 232 -98 281 -180 198 -336 -79 -149 -63 -208 69 -257 80 -30 86 -62 22 -137 -73 -85 -67 -119 34 -223 97 -99 125 -156 153 -308 35 -198 89 -290 200 -339 72 -32 227 -32 338 0 487 140 868 94 1071 -127 132 -144 194 -445 149 -727 -30 -196 -25 -214 37 -117 392 610 481 1639 233 2680 -56 232 -151 553 -257 860 -212 618 -252 809 -240 1147 28 809 505 1251 1512 1400 322 47 693 35 950 -31 455 -117 664 -411 601 -843 -23 -155 -12 -163 42 -31 99 245 86 520 -34 708 -290 453 -1118 597 -2214 386 -102 -19 -277 -55 -390 -79 -274 -57 -296 -60 -326 -40 -95 62 112 247 407 364 466 185 1039 256 1523 190 135 -18 160 -18 140 0 -28 27 -336 105 -494 125 -129 16 -422 37 -475 34 -16 -1 -61 -3 -100 -5z";
const SIL_T = "translate(-117.098299,796.836783) scale(0.100000,-0.100000)";

export const DEFAULT_DOTS: [number, number, number, string][] = [
  [358.4,156.6,40.6,'#ff3f30'],[412.8,347.0,35.3,'#ff7f2a'],[340.9,512.7,24.7,'#5fcce6'],
  [280.6,220.0,24.7,'#4a51ab'],[379.8,253.5,21.2,'#ff7e6e'],[311.7,364.6,17.6,'#5e66d5'],
  [537.3,304.7,17.6,'#efb704'],[313.7,292.3,17.6,'#7997e1'],[449.8,213.0,17.6,'#efb704'],
  [358.4,435.1,15.9,'#6493d4'],[471.2,424.6,12.3,'#ff5c4a'],[525.6,361.1,12.3,'#ff7f2a'],
  [469.2,280.0,12.3,'#ff934d'],[457.6,138.9,12.3,'#ffdc33'],[412.8,488.0,8.8,'#ff934d'],
  [539.2,234.1,8.8,'#ffe680'],
];

// Brand palette only – every hover re-roll picks colours exclusively from
// this pool (DESIGN.md / theme.ts brand colours), so the logo always stays
// on-brand no matter what combination lands.
export const BRAND_PALETTE: string[] = [
  '#de1743', // crimson
  '#ffcf02', // gold
  '#f76800', // orange
  '#5e66d5', // royal blue
  '#4a51ab', // royal blue (dark)
  '#0e839e', // teal
  '#1a9fbd', // teal (light)
  '#5fcce6', // teal (lighter)
  '#6267a3', // navy/purple
  '#639e0a', // forest green
  '#12b886', // emerald mint
  '#a03250', // deep red
  '#ff5c4a', // coral red
];

function randomColor(pool: string[]): string {
  return pool[Math.floor(Math.random() * pool.length)];
}

// SVG viewBox is "-8 -8 716 716" → x/y range from -8 to 708.
const VB_MIN = -8;
const VB_SIZE = 716;
// How close the cursor must be (in viewBox units) to a dot before it
// "catches" the cursor and repaints – tuned to the dots' own spacing
// (roughly 50–150 units apart) so passing nearby paints a few at a time.
const PROXIMITY = 90;

interface ProfileHeadProps {
  silColor?: string;
  dots?: [number, number, number, string][];
  palette?: string[];
  className?: string;
  style?: React.CSSProperties;
}

export default function ProfileHead({
  silColor = '#ff1a4a',
  dots = DEFAULT_DOTS,
  palette = BRAND_PALETTE,
  className,
  style,
}: ProfileHeadProps) {
  const uid = useId().replace(/:/g, '');
  const clipId = `sil-${uid}`;
  const hoverClass = `ph-${uid}`;
  const svgRef = useRef<SVGSVGElement>(null);
  // Dots the cursor is currently "inside" – lets each dot repaint once per
  // entry instead of re-rolling on every mousemove tick while hovering.
  const insideRef = useRef<Set<number>>(new Set());

  const [defaultSil] = useState(silColor);
  const [defaultDotColors] = useState<string[]>(() => dots.map(d => d[3]));
  const [activeSil, setActiveSil] = useState(defaultSil);
  const [activeDots, setActiveDots] = useState<string[]>(defaultDotColors);

  const handleEnter = useCallback(() => {
    setActiveSil(randomColor(palette));
  }, [palette]);

  const handleMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    // Cursor position translated from screen pixels into the SVG's own
    // viewBox coordinate space, so distance-to-dot comparisons line up.
    const x = VB_MIN + ((e.clientX - rect.left) / rect.width) * VB_SIZE;
    const y = VB_MIN + ((e.clientY - rect.top) / rect.height) * VB_SIZE;

    setActiveDots(prev => {
      let changed = false;
      const next = prev.slice();
      dots.forEach((d, i) => {
        const dist = Math.hypot(x - d[0], y - d[1]);
        const inRange = dist < PROXIMITY;
        const wasIn = insideRef.current.has(i);
        if (inRange && !wasIn) {
          insideRef.current.add(i);
          next[i] = randomColor(palette);
          changed = true;
        } else if (!inRange && wasIn) {
          insideRef.current.delete(i);
        }
      });
      return changed ? next : prev;
    });
  }, [dots, palette]);

  const handleLeave = useCallback(() => {
    insideRef.current.clear();
    // Only the silhouette reverts, to the chapter's dominant colour – it's
    // the one fixed brand marker. The dots are playful confetti: they keep
    // whatever colour the hover scatter left them in, even a combination
    // that never appeared on load.
    setActiveSil(defaultSil);
  }, [defaultSil]);

  return (
    <>
      {/* Per-instance scoped transition so fill changes (triggered by the
          random re-roll on hover, set via React state below) fade smoothly
          instead of snapping instantly. */}
      <style>{`
        .${hoverClass} .ph-sil-fill,
        .${hoverClass} .ph-sil-stroke,
        .${hoverClass} .ph-dot {
          transition: fill 0.3s ease-out, stroke 0.3s ease-out;
        }
      `}</style>
      <svg
        ref={svgRef}
        viewBox="-8 -8 716 716"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        overflow="visible"
        className={className ? `${hoverClass} ${className}` : hoverClass}
        style={style}
        onMouseEnter={handleEnter}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
      >
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            <path transform={SIL_T} d={SIL_PATH} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <rect className="ph-sil-fill" x="0" y="0" width="700" height="700" fill={activeSil} />
        </g>
        <path className="ph-sil-stroke" transform={SIL_T} d={SIL_PATH} fill="none" stroke={activeSil} strokeWidth={80} />
        {dots.map(([cx, cy, r], i) => (
          <circle
            key={i}
            className="ph-dot"
            cx={cx}
            cy={cy}
            r={r}
            fill={activeDots[i]}
            stroke={activeDots[i]}
            strokeWidth={8}
          />
        ))}
      </svg>
    </>
  );
}
