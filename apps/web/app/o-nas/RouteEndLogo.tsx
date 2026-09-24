'use client';

import { useEffect, useState } from 'react';
import styles from './ClosingNote.module.css';

// Fired by AboutScrolly once the fading tail of the route line reaches its end.
export const ROUTE_END_EVENT = 'o-nas:route-end';

/** Donut logo waiting under the end of the route line; spins once on arrival. */
export default function RouteEndLogo() {
  const [spun, setSpun] = useState(false);

  useEffect(() => {
    const onEnd = () => setSpun(true);
    window.addEventListener(ROUTE_END_EVENT, onEnd);
    return () => window.removeEventListener(ROUTE_END_EVENT, onEnd);
  }, []);

  return (
    <img
      src="/images/datatimes-donut.svg"
      alt=""
      aria-hidden="true"
      data-route-end
      className={`${styles.endLogo} ${spun ? styles.endLogoSpun : ''}`}
    />
  );
}
