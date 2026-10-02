'use client';

/**
 * RouteTimeline – the "wavy" timeline (vlnovka) first built for /o-nas.
 *
 * Alternative to the classic Timeline: cards alternate left / right, a
 * scroll-driven ink line (ScrollRoute) waves between them and runs through a
 * donut logo next to each card's title. Logos are grey until the line
 * reaches them, every logo turns 360° on hover, and the line ends in a final
 * donut that lights up and turns once when the line arrives.
 *
 * - Items carry their own card content (any ReactNode with an <h3> title –
 *   the stop sits level with the first <h3>, else with the card's middle).
 * - The end: by default an own donut below the last card. With `endSelector`
 *   the line instead runs into an element elsewhere on the page (/o-nas:
 *   the logo of the closing note) and `onArrive` tells the page to light it.
 *   `tail="fade"` ends with a fading line, no logo.
 */

import { CSSProperties, ReactNode, useLayoutEffect, useRef, useState } from 'react';
import ScrollRoute from '../ScrollRoute/ScrollRoute';
import SpinningLogo from './SpinningLogo';
import styles from './RouteTimeline.module.css';

export type RouteTimelineItem = {
  id: string;
  /** Which side the card sits on (desktop). Alternate them. */
  side: 'left' | 'right';
  content: ReactNode;
  /** Stop position, fraction of the width (desktop). Default by side: left card → 0.7, right → 0.3. */
  x?: number;
  /** Stop position on mobile. Default by side: left card → right edge, right card → left edge. */
  xMobile?: number;
  /** Extra class for the card (e.g. centred content). */
  cardClassName?: string;
};

type RouteTimelineProps = {
  items: RouteTimelineItem[];
  /** CSS selector of an element outside the timeline the line runs into (its top rim). */
  endSelector?: string;
  /** How the line ends when there is no `endSelector`. */
  tail?: 'node' | 'fade';
  /** Called once when the line arrives at its end. */
  onArrive?: () => void;
  /** Vertical gap between cards in px. */
  gap?: number;
  className?: string;
  style?: CSSProperties;
};

const DEFAULT_X = { left: 0.7, right: 0.3 };
const DEFAULT_X_MOBILE = { left: 710 / 760, right: 50 / 760 };
// The line's tip tucks this far under the end logo (which sits above it).
const END_TUCK = 10;
// Own end logo (no endSelector): space above it and its size.
const END_GAP = 40;
const END_SIZE = 64;
const FADE_LENGTH = 260;

export default function RouteTimeline({
  items,
  endSelector,
  tail = 'node',
  onArrive,
  gap = 48,
  className,
  style,
}: RouteTimelineProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(-1);
  const [arrived, setArrived] = useState(0);
  const [layout, setLayout] = useState({
    centers: items.map((_, index) => 300 + index * 500),
    nodes: items.map((_, index) => 300 + index * 500),
    height: items.length * 500 + 100,
    width: 1000,
  });
  const [externalEndY, setExternalEndY] = useState<number | null>(null);

  const ownEnd = !endSelector;
  const ownEndTop = layout.height + END_GAP;
  const endY = ownEnd
    ? tail === 'fade' ? layout.height + FADE_LENGTH * 0.6 : ownEndTop
    : externalEndY ?? layout.centers[layout.centers.length - 1] + 360;
  const sectionHeight = ownEnd
    ? tail === 'fade' ? endY : ownEndTop + END_SIZE
    : layout.height;

  const routeStops = items.map((item, index) => ({
    y: layout.nodes[index],
    x: item.x ?? DEFAULT_X[item.side],
    xMobile: item.xMobile ?? DEFAULT_X_MOBILE[item.side],
  }));

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const cards = Array.from(section.querySelectorAll<HTMLElement>('[data-route-card]'));
    const measure = () => {
      let top = 24;
      const centers: number[] = [];
      // Each logo sits level with its card's title, not the card's middle.
      const nodes = cards.map((card) => {
        const cardRect = card.getBoundingClientRect();
        const title = card.querySelector('h3')?.getBoundingClientRect();
        const titleOffset = title
          ? title.top + title.height / 2 - cardRect.top : cardRect.height / 2;
        centers.push(top + cardRect.height / 2);
        const node = top + titleOffset;
        top += cardRect.height + gap;
        return node;
      });
      const width = section.getBoundingClientRect().width;
      setLayout((previous) => previous.height === top && previous.width === width &&
        previous.centers.length === centers.length &&
        previous.centers.every((center, index) => center === centers[index]) &&
        previous.nodes.every((node, index) => node === nodes[index])
        ? previous : { centers, nodes, height: top, width });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(section);
    cards.forEach((card) => observer.observe(card));
    // Fallbacks for late fonts / images and environments without observer callbacks.
    window.addEventListener('load', measure);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('load', measure);
      window.removeEventListener('resize', measure);
    };
  }, [items.length, gap]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const target = endSelector ? document.querySelector<HTMLElement>(endSelector) : null;
    if (!section || !target) return;
    const measureEnd = () => {
      const offset = target.getBoundingClientRect().top - section.getBoundingClientRect().top;
      setExternalEndY((previous) => (previous === offset ? previous : offset));
    };
    measureEnd();
    window.addEventListener('resize', measureEnd);
    return () => window.removeEventListener('resize', measureEnd);
  }, [layout, endSelector]);

  const routeTail = ownEnd ? tail : 'node';

  return (
    <div
      ref={sectionRef}
      className={`${styles.timeline} ${className ?? ''}`}
      style={{ height: sectionHeight, ...style }}
    >
      <ScrollRoute
        containerRef={sectionRef}
        width={layout.width}
        stops={routeStops}
        end={routeTail === 'fade' ? { y: endY, x: 0.5 } : { y: endY + END_TUCK, x: 0.5 }}
        tail={routeTail}
        fadeLength={FADE_LENGTH}
        arriveBefore={END_TUCK}
        onReach={(index) => setActive(Math.max(0, index))}
        onArrive={() => {
          setArrived((count) => count + 1);
          onArrive?.();
        }}
      />

      {/* Donut stops on the line: grey until reached, 360° turn on hover. */}
      {items.map((item, index) => (
        <SpinningLogo
          key={item.id}
          lit={index <= active}
          duration={1600}
          className={`${styles.stop} ${index === active ? styles.stopActive : ''}`}
          style={{
            top: layout.nodes[index],
            '--stop-left-d': `${routeStops[index].x * 100}%`,
            '--stop-left-m': `${routeStops[index].xMobile * 100}%`,
          } as CSSProperties}
        />
      ))}

      {ownEnd && tail === 'node' ? (
        <SpinningLogo
          lit={arrived > 0}
          spinSignal={arrived}
          size={END_SIZE}
          className={styles.endLogo}
          style={{ top: ownEndTop }}
        />
      ) : null}

      {items.map((item, index) => (
        <article
          key={item.id}
          data-route-card={index}
          className={`${styles.milestone} ${styles[item.side]} ${
            index <= active ? styles.milestoneReached : ''
          }`}
          style={{ '--milestone-y': `${layout.centers[index]}px` } as CSSProperties}
        >
          <div className={`${styles.card} ${item.cardClassName ?? ''}`}>
            <span className={styles.cardFrame} aria-hidden="true" />
            {item.content}
          </div>
        </article>
      ))}
    </div>
  );
}
