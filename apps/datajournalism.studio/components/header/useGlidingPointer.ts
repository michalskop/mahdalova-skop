'use client';

import { useCallback, useEffect, useRef } from 'react';

// „Klouzavé ukazovátko" pro dropdown Speciálů: jedna sdílená šipka, která
// sjíždí za myší mezi položkami (pružina), mírně se natáčí ve směru pohybu
// a při rychlém pohybu se víc rozvlní (roztáhne na výšku). Položky, na které
// má šipka ukazovat, nesou atribut data-pointer-item.

const STIFFNESS = 0.14; // síla pružiny k cíli
const DAMPING = 0.6; // tlumení rychlosti (0–1, víc = delší dojezd)
const MOUSE_PULL = 0.35; // jak moc se cíl uvnitř řádku přitahuje k výšce kurzoru
const TILT_PER_PX = 0.9; // natočení (°) na px/snímek rychlosti
const MAX_TILT = 12; // max. natočení ve stupních
const WAVE_PER_PX = 0.035; // rozvlnění na px/snímek rychlosti
const MAX_WAVE = 0.5; // max. zvětšení výšky vlnky (0.5 = +50 %)

export function useGlidingPointer() {
  const containerRef = useRef<HTMLElement | null>(null);
  const pointerRef = useRef<HTMLDivElement | null>(null);
  const state = useRef({ y: 0, v: 0, target: 0, visible: false, raf: 0 });

  const reducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const render = useCallback(() => {
    const el = pointerRef.current;
    if (!el) return;
    const { y, v } = state.current;
    const tilt = Math.max(-MAX_TILT, Math.min(MAX_TILT, v * TILT_PER_PX));
    const wave = 1 + Math.min(MAX_WAVE, Math.abs(v) * WAVE_PER_PX);
    el.style.transform = `translate3d(0, ${y}px, 0) translateY(-50%) rotate(${tilt}deg) scale(${1 / Math.sqrt(wave)}, ${wave})`;
  }, []);

  const tick = useCallback(() => {
    const s = state.current;
    s.v = (s.v + (s.target - s.y) * STIFFNESS) * DAMPING;
    s.y += s.v;
    if (Math.abs(s.target - s.y) < 0.1 && Math.abs(s.v) < 0.05) {
      s.y = s.target;
      s.v = 0;
      s.raf = 0;
      render();
      return;
    }
    render();
    s.raf = requestAnimationFrame(tick);
  }, [render]);

  const moveTo = useCallback(
    (item: HTMLElement, clientY?: number) => {
      const container = containerRef.current;
      const pointer = pointerRef.current;
      if (!container || !pointer) return;
      const c = container.getBoundingClientRect();
      const r = item.getBoundingClientRect();
      const center = r.top - c.top + r.height / 2;
      const target = clientY === undefined ? center : center + (clientY - r.top - r.height / 2) * MOUSE_PULL;
      const s = state.current;
      s.target = target;

      // První zobrazení: bez klouzání odněkud, šipka se objeví rovnou u položky.
      if (!s.visible || reducedMotion()) {
        s.y = target;
        s.v = 0;
        s.visible = true;
        pointer.dataset.visible = 'true';
        render();
        return;
      }
      if (!s.raf) s.raf = requestAnimationFrame(tick);
    },
    [render, tick],
  );

  const hide = useCallback(() => {
    const s = state.current;
    s.visible = false;
    if (pointerRef.current) pointerRef.current.dataset.visible = 'false';
  }, []);

  useEffect(
    () => () => {
      if (state.current.raf) cancelAnimationFrame(state.current.raf);
    },
    [],
  );

  const findItem = (target: EventTarget | null) =>
    (target as HTMLElement | null)?.closest?.<HTMLElement>('[data-pointer-item]') ?? null;

  const containerProps = {
    ref: (node: HTMLElement | null) => {
      containerRef.current = node;
      // Dropdown se při zavření odmontuje – po novém otevření začínáme od nuly.
      if (!node) {
        state.current.visible = false;
        state.current.v = 0;
      }
    },
    onMouseMove: (e: React.MouseEvent) => {
      const item = findItem(e.target);
      if (item) moveTo(item, e.clientY);
      else hide();
    },
    onMouseLeave: hide,
    onFocus: (e: React.FocusEvent) => {
      const item = findItem(e.target);
      if (item && !item.matches(':hover')) moveTo(item);
    },
  };

  return { containerProps, pointerRef };
}
