import { useEffect, useRef, useState } from "react";
import { geoProjection } from "d3-geo";
import { WIDTH, type GeoProjection } from "./geometry";

// Interpolate geographic points, not SVG commands. Keeping d3's projection
// stream preserves antimeridian clipping and curved-line resampling.
export function interpolateProjection(from: GeoProjection, to: GeoProjection, t: number, height: number) {
  const a0 = from([0, 0])!;
  const b0 = to([0, 0])!;
  return geoProjection((lambda: number, phi: number) => {
    // Mercator is infinite at the poles. d3's antimeridian stream visits
    // those points when closing polygons; keep them finite during the tween.
    const point: [number, number] = [lambda * 180 / Math.PI, Math.max(-89.999999, Math.min(89.999999, phi * 180 / Math.PI))];
    const a = from(point)!;
    const b = to(point)!;
    return [a[0] + (b[0] - a[0]) * t, -(a[1] + (b[1] - a[1]) * t)];
  }).scale(1).translate([a0[0] + (b0[0] - a0[0]) * t, a0[1] + (b0[1] - a0[1]) * t])
    .precision(0.2).clipExtent([[0, 0], [WIDTH, height]]);
}

export function useProjectionMorph(target: GeoProjection, height: number) {
  const [rendered, setRendered] = useState(() => target);
  const current = useRef(target);
  useEffect(() => {
    const from = current.current;
    if (from === target) return;
    let frame = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finish = () => {
      cancelAnimationFrame(frame);
      current.current = target;
      setRendered(() => target);
    };
    if (reduced.matches || document.hidden) { finish(); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 760);
      if (t >= 1) { finish(); return; }
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      current.current = interpolateProjection(from, target, eased, height);
      setRendered(() => current.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const onVisibility = () => { if (document.hidden) finish(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [target, height]);
  return { rendered, animating: rendered !== target };
}
