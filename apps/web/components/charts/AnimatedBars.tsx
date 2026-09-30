'use client';

import { useEffect, useRef, useState } from 'react';

import ChartCard from './ChartCard';
import styles from './AnimatedBars.module.css';

// Simple horizontal bar chart for articles: when the chart scrolls into view,
// each bar grows from zero to its value and the number counts up with it.
// Same in-view pattern as app/o-nas/NewsSourcesBars.tsx, generalised for MDX.

export interface AnimatedBar {
  label: string;
  value: number;
  // Palette token such as "brand.6" or "brandNavy.9" (resolved to the Mantine
  // CSS variable), or a hex colour taken from the binding palette.
  color?: string;
  // Optional note under the bar.
  note?: string;
}

export interface AnimatedBarsProps {
  bars: AnimatedBar[];
  title?: string;
  subtitle?: string;
  source?: string;
  // Suffix after the number, e.g. " %".
  unit?: string;
  // Scale maximum; defaults to the largest value.
  max?: number;
}

const BAR_MS = 3000;
const STAGGER_MS = 700;

const resolveColor = (color?: string) => {
  if (!color) return 'var(--mantine-color-brandNavy-9)';
  const token = color.match(/^([a-zA-Z]+)\.(\d)$/);
  return token ? `var(--mantine-color-${token[1]}-${token[2]})` : color;
};

// Czech number format with a non-breaking space as the thousands separator.
const formatNumber = (value: number) =>
  Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function CountUp({ value, start, delay, unit }: { value: number; start: boolean; delay: number; unit?: string }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!start) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(value);
      return;
    }
    let frame = 0;
    const begin = performance.now() + delay;
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - begin) / BAR_MS));
      setShown(value * easeOut(t));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [start, value, delay]);

  return <>{formatNumber(shown)}{unit}</>;
}

export default function AnimatedBars({ bars, title, subtitle, source, unit, max }: AnimatedBarsProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const scaleMax = max ?? Math.max(...bars.map((bar) => bar.value));

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return (
    // A full-width chart must never sit next to a floated aside.
    <div style={{ clear: 'both' }}>
    <ChartCard title={title} subtitle={subtitle} source={source}>
      <div ref={rootRef} className={styles.chart}>
        {bars.map((bar, index) => {
          const delay = index * STAGGER_MS;
          const width = `${(bar.value / scaleMax) * 100}%`;
          return (
            <div key={bar.label} className={styles.row}>
              <div className={styles.head}>
                <span className={styles.label}>{bar.label}</span>
                <span className={styles.value}>
                  <CountUp value={bar.value} start={visible} delay={delay} unit={unit} />
                </span>
              </div>
              <div
                className={styles.track}
                role="img"
                aria-label={`${bar.label}: ${formatNumber(bar.value)}${unit ?? ''}`}
              >
                <div
                  className={styles.fill}
                  style={{
                    width: visible ? width : 0,
                    background: resolveColor(bar.color),
                    transitionDelay: `${delay}ms`,
                  }}
                />
              </div>
              {bar.note ? <p className={styles.note}>{bar.note}</p> : null}
            </div>
          );
        })}
      </div>
    </ChartCard>
    </div>
  );
}
