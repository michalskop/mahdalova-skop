'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './HistoryScrolly.module.css';

type Milestone = {
  year: number;
  eyebrow: string;
  title: string;
  text: string;
  x: number;
  y: number;
  side: 'left' | 'right';
};

const milestones: Milestone[] = [
  {
    year: 1946,
    eyebrow: '1. ročník',
    title: 'Festival začíná ve dvou lázeňských městech',
    text: 'První ročník se odehrál hlavně v Mariánských Lázních. Karlovy Vary byly druhým dějištěm a přehlídka ještě neměla soutěžní část.',
    x: 320,
    y: 210,
    side: 'right',
  },
  {
    year: 1948,
    eyebrow: 'vzniká soutěž',
    title: 'Poprvé se uděluje Křišťálový glóbus',
    text: 'Po únoru 1948 vznikla soutěž a festival poprvé udělil svou hlavní cenu. V roce 1950 se natrvalo přestěhoval do Karlových Varů a roku 1956 získal od FIAPF prestižní kategorii A.',
    x: 690,
    y: 765,
    side: 'left',
  },
  {
    year: 1959,
    eyebrow: 'střídání s Moskvou',
    title: 'Politické rozhodnutí přerušuje každoroční rytmus',
    text: 'Vary se musely střídat s moskevským festivalem: sudé roky patřily Karlovým Varům, liché Moskvě. Právě toto období vysvětluje většinu rozdílu mezi stářím festivalu a počtem jeho ročníků.',
    x: 385,
    y: 1370,
    side: 'right',
  },
  {
    year: 1994,
    eyebrow: '29. ročník',
    title: 'Festival se vrací ke každoročnímu rytmu',
    text: 'Po revoluci se v roce 1990 neudělila hlavní cena a ročník 1993 se nekonal. Od roku 1994 vede festival tým Jiřího Bartošky a Evy Zaoralové a přehlídka znovu probíhá každý rok.',
    x: 700,
    y: 2090,
    side: 'left',
  },
  {
    year: 2026,
    eyebrow: '60 ročníků · 80 let',
    title: 'Šedesátý ročník přichází po osmdesáti letech',
    text: 'Chybějící ročníky nezpůsobila jediná dlouhá přestávka. Sečetlo se střídání s Moskvou, nekonaný rok 1993 a covidový rok 2020.',
    x: 430,
    y: 2790,
    side: 'right',
  },
];

const DESKTOP_PATH =
  'M 320 40 C 250 250, 720 390, 690 765 C 660 1030, 310 1090, 385 1370 C 445 1600, 790 1750, 700 2090 C 630 2350, 330 2490, 430 2960';
const MOBILE_PATH =
  'M 92 40 C 70 280, 690 430, 650 765 C 620 1010, 90 1110, 120 1370 C 145 1640, 690 1770, 640 2090 C 605 2380, 80 2520, 120 2960';
const MOBILE_X = [92, 650, 120, 640, 120];

export default function HistoryScrolly() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const milestoneRefs = useRef<Array<HTMLElement | null>>([]);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const updateProgress = () => {
      frame = 0;
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const viewportMarker = window.innerHeight * 0.52;
      const scrollable = Math.max(1, rect.height - window.innerHeight * 0.35);
      setProgress(Math.min(1, Math.max(0, (viewportMarker - rect.top) / scrollable)));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(Number((visible.target as HTMLElement).dataset.step));
      },
      { rootMargin: '-34% 0px -42% 0px', threshold: [0.1, 0.35, 0.65] },
    );
    milestoneRefs.current.forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const renderDots = (mobile = false) =>
    milestones.map((milestone, index) => {
      const cx = mobile ? MOBILE_X[index] : milestone.x;
      const mobilePointIsLeft = mobile && cx < 380;
      const isActive = index === active;
      const isPast = index <= active;
      return (
        <g key={milestone.year} className={styles.marker}>
          <circle
            className={styles.markerHalo}
            cx={cx}
            cy={milestone.y}
            r={isActive ? 25 : 17}
          />
          <circle
            className={`${styles.markerDot} ${isActive ? styles.markerDotActive : ''}`}
            cx={cx}
            cy={milestone.y}
            r={isActive ? 11 : 8}
          />
          <text
            className={`${styles.markerYear} ${isPast ? styles.markerYearPast : ''}`}
            x={mobile ? cx + (mobilePointIsLeft ? 32 : -32) : cx}
            y={milestone.y - 25}
            textAnchor={mobile ? (mobilePointIsLeft ? 'start' : 'end') : 'middle'}
          >
            {milestone.year}
          </text>
        </g>
      );
    });

  return (
    <div ref={sectionRef} className={styles.scrolly}>
      <svg
        className={`${styles.route} ${styles.routeDesktop}`}
        viewBox="0 0 1000 3000"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path className={styles.routeShadow} d={DESKTOP_PATH} />
        <path
          className={styles.routeProgress}
          d={DESKTOP_PATH}
          pathLength={1}
          style={{ strokeDasharray: 1, strokeDashoffset: 1 - progress }}
        />
        <path className={styles.moscowSection} d="M 385 1370 C 445 1600, 790 1750, 700 2090" />
        {renderDots()}
      </svg>

      <svg
        className={`${styles.route} ${styles.routeMobile}`}
        viewBox="0 0 760 3000"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path className={styles.routeShadow} d={MOBILE_PATH} />
        <path
          className={styles.routeProgress}
          d={MOBILE_PATH}
          pathLength={1}
          style={{ strokeDasharray: 1, strokeDashoffset: 1 - progress }}
        />
        <path className={styles.moscowSection} d="M 120 1370 C 145 1640, 690 1770, 640 2090" />
        {renderDots(true)}
      </svg>

      <p className={styles.routeNote}>1959–1993 · střídání s Moskvou</p>

      {milestones.map((milestone, index) => (
        <article
          key={milestone.year}
          ref={(node) => {
            milestoneRefs.current[index] = node;
          }}
          data-step={index}
          className={`${styles.milestone} ${styles[milestone.side]} ${
            index === active ? styles.milestoneActive : ''
          }`}
          style={{ '--milestone-y': `${(milestone.y / 3000) * 100}%` } as React.CSSProperties}
        >
          <div className={styles.bubble}>
            <div className={styles.bubbleMeta}>
              <span className={styles.bubbleYear}>{milestone.year}</span>
              <span className={styles.bubbleEyebrow}>{milestone.eyebrow}</span>
            </div>
            <h3>{milestone.title}</h3>
            <p>{milestone.text}</p>
          </div>
        </article>
      ))}

      <p className={styles.covidNote}>2020 · ročník se kvůli covidu nekonal</p>
    </div>
  );
}
