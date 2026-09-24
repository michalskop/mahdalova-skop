'use client';

import { useEffect, useState } from 'react';
import styles from './ClosingNote.module.css';

// Fired by AboutScrolly once the fading tail of the route line reaches its end.
export const ROUTE_END_EVENT = 'o-nas:route-end';

/**
 * Donut logo at the end of the route line. Grey like the other stops until
 * the line touches it; then it lights up for good and makes one full turn.
 * Every mouse hover spins it once more.
 */
export default function RouteEndLogo() {
  const [lit, setLit] = useState(false);
  const [turns, setTurns] = useState(0);
  const spin = () => setTurns((count) => count + 1);

  useEffect(() => {
    const onArrive = () => {
      setLit(true);
      spin();
    };
    window.addEventListener(ROUTE_END_EVENT, onArrive);
    return () => window.removeEventListener(ROUTE_END_EVENT, onArrive);
  }, []);

  return (
    <img
      src="/images/datatimes-donut.svg"
      alt=""
      aria-hidden="true"
      data-route-end
      className={`${styles.endLogo} ${lit ? styles.endLogoLit : ''}`}
      style={{ transform: `rotate(${turns * 360}deg)` }}
      onMouseEnter={spin}
    />
  );
}
