'use client';

import { useEffect, useState } from 'react';
import styles from './ClosingNote.module.css';

// Fired by AboutScrolly once the fading tail of the route line reaches its end.
export const ROUTE_END_EVENT = 'o-nas:route-end';

/**
 * Donut logo waiting under the end of the route line. It makes one full turn
 * when the line arrives, and another one on every mouse hover.
 */
export default function RouteEndLogo() {
  const [turns, setTurns] = useState(0);
  const spin = () => setTurns((count) => count + 1);

  useEffect(() => {
    window.addEventListener(ROUTE_END_EVENT, spin);
    return () => window.removeEventListener(ROUTE_END_EVENT, spin);
  }, []);

  return (
    <img
      src="/images/datatimes-donut.svg"
      alt=""
      aria-hidden="true"
      data-route-end
      className={styles.endLogo}
      style={{ transform: `rotate(${turns * 360}deg)` }}
      onMouseEnter={spin}
    />
  );
}
