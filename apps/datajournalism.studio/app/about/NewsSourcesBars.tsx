'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './NewsSourcesBars.module.css';

type Bar = {
  label: string;
  value: number;
  // Earlier value drawn behind the main bar in a lighter ink (e.g. 2021).
  previous?: number;
  caption: string;
};

const bars: Bar[] = [
  {
    label: 'News source: social media',
    value: 54,
    caption: '54% of people now get their news from social media.',
  },
  {
    label: 'Visits to news websites',
    value: 51,
    previous: 63,
    caption: '51% go straight to news websites – just five years ago it was 63%.',
  },
  {
    label: 'Looking for information with AI / language models',
    value: 10,
    caption: '10% ask AI chatbots about the world around them – but note that this share is growing fast.',
  },
];

const BAR_MS = 1100;
const STAGGER_MS = 900;
const TYPE_MS = 22;

function Typewriter({ text, start }: { text: string; start: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(text.length);
      return;
    }
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setCount(index);
      if (index >= text.length) window.clearInterval(timer);
    }, TYPE_MS);
    return () => window.clearInterval(timer);
  }, [start, text]);

  // The full text reserves the height, so nothing below jumps while typing.
  return (
    <p className={styles.caption} aria-label={text}>
      <span className={styles.captionGhost} aria-hidden="true">{text}</span>
      <span className={styles.captionTyped} aria-hidden="true">
        {text.slice(0, count)}
        {start && count < text.length ? <span className={styles.cursor} /> : null}
      </span>
    </p>
  );
}

export default function NewsSourcesBars() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [typed, setTyped] = useState<boolean[]>(bars.map(() => false));

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
      { threshold: 0.35 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  // Each caption starts typing once its bar has finished growing.
  useEffect(() => {
    if (!visible) return;
    const timers = bars.map((bar, index) => window.setTimeout(() => {
      setTyped((previous) => previous.map((value, i) => (i === index ? true : value)));
    }, index * STAGGER_MS + BAR_MS + (bar.previous ? BAR_MS / 2 : 0)));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [visible]);

  return (
    <div ref={rootRef} className={`${styles.chart} ${visible ? styles.visible : ''}`}>
      {bars.map((bar, index) => {
        const delay = index * STAGGER_MS;
        return (
          <div key={bar.label} className={styles.row}>
            <p className={styles.label}>{bar.label}</p>
            <div className={styles.track} role="img" aria-label={`${bar.label}: ${bar.value}%`}>
              {bar.previous ? (
                <div
                  className={`${styles.fill} ${styles.fillPrevious}`}
                  style={{ width: visible ? `${bar.previous}%` : 0, transitionDelay: `${delay}ms` }}
                />
              ) : null}
              <div
                className={styles.fill}
                style={{
                  width: visible ? `${bar.value}%` : 0,
                  transitionDelay: `${delay + (bar.previous ? BAR_MS / 2 : 0)}ms`,
                }}
              />
            </div>
            <Typewriter text={bar.caption} start={typed[index]} />
          </div>
        );
      })}
      <p className={styles.source}>
        Source: Digital News Report 2026, 48 countries, ~100,000 respondents
      </p>
    </div>
  );
}
