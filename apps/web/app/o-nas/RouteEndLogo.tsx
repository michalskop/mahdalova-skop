'use client';

import { useEffect, useState } from 'react';
import SpinningLogo from '@/components/common/RouteTimeline/SpinningLogo';
import styles from './ClosingNote.module.css';

// Fired by AboutScrolly once the route line reaches the logo.
export const ROUTE_END_EVENT = 'o-nas:route-end';

/**
 * Donut logo at the end of the /o-nas route line (in the closing note, the
 * line runs into it via RouteTimeline's `endSelector`). Grey like the other
 * stops until the line touches it; then it lights up for good and makes one
 * full turn. Every mouse hover spins it once more (SpinningLogo).
 */
export default function RouteEndLogo() {
  const [arrived, setArrived] = useState(0);

  useEffect(() => {
    const onArrive = () => setArrived((count) => count + 1);
    window.addEventListener(ROUTE_END_EVENT, onArrive);
    return () => window.removeEventListener(ROUTE_END_EVENT, onArrive);
  }, []);

  // The wrapper is an opaque disc in the section's colour (invisible), so the
  // tip of the line tucked under the logo never shows through the grey logo.
  return (
    <SpinningLogo
      data-route-end
      lit={arrived > 0}
      spinSignal={arrived}
      size={64}
      className={styles.endLogo}
    />
  );
}
