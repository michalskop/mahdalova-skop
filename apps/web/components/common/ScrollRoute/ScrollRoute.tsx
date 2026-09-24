'use client';

/**
 * ScrollRoute – a scroll-driven line that runs through a series of stops.
 *
 * First built for the /o-nas timeline; meant as the base for the next
 * Timeline and other scrollytelling pieces (move to packages/ui on reuse).
 *
 * - A grey track shows the whole route; an ink line draws over it as the
 *   reader scrolls. Nothing is drawn before the first scroll.
 * - The head of the line starts at the first stop, glides to `headAnchor`
 *   of the viewport and then travels with the reader. It eases towards its
 *   target every frame, so wheel steps become one continuous stroke.
 * - Every segment enters and leaves a stop vertically → one smooth curve,
 *   the stops sit on it like beads.
 * - The SVG is never stretched: the route is built in real px of `width`,
 *   so the drawn length always equals the computed head position and stop
 *   lighting (`onReach`) is exact.
 * - End variants: `tail="node"` runs into an end marker (touches its top
 *   rim at `end.y`); `tail="fade"` fades the line out over `fadeLength`.
 *
 * All y values are px from the top of `containerRef` (a positioned element
 * the SVG is absolutely placed in); x values are fractions of `width`.
 */

import { RefObject, useEffect, useRef } from 'react';
import styles from './ScrollRoute.module.css';

export type RoutePoint = {
  y: number;
  /** Fraction of the width (0–1) on desktop. */
  x: number;
  /** Fraction of the width (0–1) at ≤ MOBILE_BREAKPOINT; defaults to `x`. */
  xMobile?: number;
};

type ScrollRouteProps = {
  containerRef: RefObject<HTMLElement>;
  /** Container width in px (measure it; the route is rebuilt on change). */
  width: number;
  stops: RoutePoint[];
  end: RoutePoint;
  tail?: 'node' | 'fade';
  /** tail="fade": over how many px before `end.y` the line fades out. */
  fadeLength?: number;
  /** Radius of the stop markers: a stop counts as reached when the head touches its rim. */
  stopRadius?: { desktop: number; mobile: number };
  /** Where the head settles in the viewport (fraction of its height). */
  headAnchor?: number;
  /** Over how many scrolled px the head glides from the first stop to the anchor. */
  headRamp?: number;
  /** Index of the last reached stop (0 from load on); called on every change. */
  onReach?: (index: number) => void;
  /** Called once when the line arrives at its end. */
  onArrive?: () => void;
};

// Keep in sync with the media query in ScrollRoute.module.css.
const MOBILE_BREAKPOINT = 820;
// tail="fade": the line reads as "arrived" once it has practically faded out.
const FADE_ARRIVAL = 60;

const smoothstep = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};

function buildRoute(stops: RoutePoint[], end: RoutePoint, width: number, tail: 'node' | 'fade', mobile: boolean) {
  const px = (point: RoutePoint) => (mobile ? point.xMobile ?? point.x : point.x) * width;
  const route = stops.map((stop, index) => {
    if (index === 0) return `M ${px(stop)} ${stop.y}`;
    const previous = stops[index - 1];
    const bend = (stop.y - previous.y) / 2;
    return `C ${px(previous)} ${previous.y + bend}, ${px(stop)} ${stop.y - bend}, ${px(stop)} ${stop.y}`;
  }).join(' ');
  const last = stops[stops.length - 1];
  const lastX = px(last);
  const endX = px(end);
  const span = end.y - last.y;
  // "node" arrives vertically, like into another bead; "fade" swings in softly.
  const control2 = tail === 'node'
    ? `${endX} ${last.y + span * 0.55}`
    : `${endX + (lastX - endX) * 0.3} ${last.y + span * 0.8}`;
  return `${route} C ${lastX} ${last.y + span * 0.45}, ${control2}, ${endX} ${end.y}`;
}

export default function ScrollRoute({
  containerRef,
  width,
  stops,
  end,
  tail = 'node',
  fadeLength = 300,
  stopRadius = { desktop: 20, mobile: 17 },
  headAnchor = 0.55,
  headRamp = 360,
  onReach,
  onArrive,
}: ScrollRouteProps) {
  const desktopRef = useRef<SVGPathElement>(null);
  const mobileRef = useRef<SVGPathElement>(null);
  const headRef = useRef<number | null>(null);
  const arrivedRef = useRef(false);
  const reachedRef = useRef(-1);
  // Latest callbacks without re-subscribing the scroll loop on every render.
  const callbacks = useRef({ onReach, onArrive });
  callbacks.current = { onReach, onArrive };

  const desktopPath = buildRoute(stops, end, width, tail, false);
  const mobilePath = buildRoute(stops, end, width, tail, true);
  const height = end.y + 16;
  const stopKey = stops.map((stop) => stop.y).join(',');

  useEffect(() => {
    let frame = 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const firstY = stops[0].y;
    const arrivalY = tail === 'fade' ? end.y - FADE_ARRIVAL : end.y - 1;

    // Where the head should be for the current scroll position.
    const targetY = () => {
      const container = containerRef.current;
      if (!container) return firstY;
      const scrollY = Math.max(0, window.scrollY);
      const viewport = window.innerHeight;
      const containerTop = container.getBoundingClientRect().top + scrollY;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - viewport);
      const firstScreenY = containerTop + firstY;
      const raw = (y: number) => {
        const headScreenY = firstScreenY + (viewport * headAnchor - firstScreenY) * smoothstep(y / headRamp);
        return y + headScreenY - containerTop;
      };
      // If the page ends too early for the head to reach the end, stretch the
      // whole run evenly instead of snapping at the bottom.
      const atBottom = raw(maxScroll);
      const stretch = atBottom < end.y && atBottom > firstY ? (end.y - firstY) / (atBottom - firstY) : 1;
      return scrollY <= 0 ? firstY : Math.min(end.y, firstY + (raw(scrollY) - firstY) * stretch);
    };

    // Draws the line up to `routeY` straight in the DOM (no React render per
    // frame) and reports reached stops from that very same head position.
    const render = (routeY: number) => {
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
      const path = mobile ? mobileRef.current : desktopRef.current;
      let progress = 0;
      if (path && routeY > firstY) {
        const total = path.getTotalLength();
        let low = 0;
        let high = total;
        for (let iteration = 0; iteration < 22; iteration += 1) {
          const middle = (low + high) / 2;
          if (path.getPointAtLength(middle).y < routeY) low = middle;
          else high = middle;
        }
        progress = routeY >= end.y ? 1 : ((low + high) / 2) / total;
        path.setAttribute('stroke-dasharray', `${total} ${total}`);
        path.setAttribute('stroke-dashoffset', String(total * (1 - progress)));
      }
      [desktopRef.current, mobileRef.current].forEach((line) => {
        line?.setAttribute('visibility', line === path && progress > 0 ? 'visible' : 'hidden');
      });

      const radius = mobile ? stopRadius.mobile : stopRadius.desktop;
      let reached = 0;
      stops.forEach((stop, index) => {
        if (routeY >= stop.y - radius) reached = index;
      });
      if (reached !== reachedRef.current) {
        reachedRef.current = reached;
        callbacks.current.onReach?.(reached);
      }
      if (routeY >= arrivalY && !arrivedRef.current) {
        arrivedRef.current = true;
        callbacks.current.onArrive?.();
      }
    };

    const tick = () => {
      frame = 0;
      const target = targetY();
      const current = headRef.current ?? target;
      const next = reducedMotion || Math.abs(target - current) < 0.5
        ? target : current + (target - current) * 0.2;
      headRef.current = next;
      render(next);
      if (next !== target) frame = window.requestAnimationFrame(tick);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(tick);
    };

    // On load (or relayout) jump straight to the right place, no glide.
    headRef.current = targetY();
    render(headRef.current);
    const settleTimer = window.setTimeout(onScroll, 120);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer);
    };
    // stopKey stands in for `stops` (a new array every render would restart
    // the loop and reset the eased head on each lit stop).
  }, [containerRef, width, stopKey, end.y, end.x, tail, headAnchor, headRamp, stopRadius.desktop, stopRadius.mobile]);

  const fadeStyle = tail === 'fade'
    ? {
      WebkitMaskImage: `linear-gradient(to bottom, #000 ${end.y - fadeLength}px, transparent ${end.y}px)`,
      maskImage: `linear-gradient(to bottom, #000 ${end.y - fadeLength}px, transparent ${end.y}px)`,
    }
    : undefined;

  return (
    <>
      {[
        { key: 'desktop', className: styles.desktop, d: desktopPath, ref: desktopRef },
        { key: 'mobile', className: styles.mobile, d: mobilePath, ref: mobileRef },
      ].map((variant) => (
        <svg
          key={variant.key}
          className={`${styles.route} ${variant.className}`}
          viewBox={`0 0 ${width} ${height}`}
          style={{ height, ...fadeStyle }}
          aria-hidden="true"
        >
          <path className={styles.track} d={variant.d} />
          {/* stroke-dasharray / -dashoffset / visibility are driven per frame */}
          <path ref={variant.ref} className={styles.progress} d={variant.d} visibility="hidden" />
        </svg>
      ))}
    </>
  );
}
