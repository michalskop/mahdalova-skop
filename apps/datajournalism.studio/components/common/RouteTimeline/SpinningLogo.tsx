'use client';

/**
 * SpinningLogo – the DataTimes donut used as a stop of RouteTimeline.
 *
 * - Grey until `lit`, then in full colour.
 * - Every mouse hover makes one full 360° turn (turns add up, so the logo
 *   never spins back).
 * - Each change of `spinSignal` adds one more turn (e.g. when the route line
 *   arrives at the end logo).
 *
 * The rotation sits on an inner element, so the outer one stays free for
 * positioning / scaling by the consumer.
 */

import { CSSProperties, HTMLAttributes, useEffect, useRef, useState } from 'react';
import styles from './SpinningLogo.module.css';

export const DONUT_LOGO_SRC = '/images/datatimes-donut.svg';

type SpinningLogoProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
  lit?: boolean;
  /** Diameter in px (overridable from CSS via `--spinning-logo-size`). */
  size?: number;
  /** Bump the number to spin once more (0 = no spin on mount). */
  spinSignal?: number;
  /** Length of one turn in ms. */
  duration?: number;
  src?: string;
};

export default function SpinningLogo({
  lit = false,
  size,
  spinSignal = 0,
  duration = 2400,
  src = DONUT_LOGO_SRC,
  className,
  style,
  onMouseEnter,
  ...rest
}: SpinningLogoProps) {
  const [turns, setTurns] = useState(0);
  const lastSignal = useRef(spinSignal);

  useEffect(() => {
    if (spinSignal === lastSignal.current) return;
    lastSignal.current = spinSignal;
    setTurns((count) => count + 1);
  }, [spinSignal]);

  return (
    <span
      aria-hidden="true"
      {...rest}
      className={`${styles.logo} ${lit ? styles.lit : ''} ${className ?? ''}`}
      style={{
        ...(size ? { '--spinning-logo-size': `${size}px` } : null),
        '--spinning-logo-duration': `${duration}ms`,
        ...style,
      } as CSSProperties}
      onMouseEnter={(event) => {
        setTurns((count) => count + 1);
        onMouseEnter?.(event);
      }}
    >
      <span className={styles.spinner} style={{ transform: `rotate(${turns * 360}deg)` }}>
        <img src={src} alt="" className={styles.img} />
      </span>
    </span>
  );
}
