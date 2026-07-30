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
    text: 'První ročník jednoho z nejstarších filmových festivalů na světě se odehrál hlavně v Mariánských Lázních. Část projekcí hostily také Karlovy Vary. Festival ještě neměl soutěžní část ani dnešní pevné centrum.',
    x: 320,
    y: 300,
    side: 'right',
  },
  {
    year: 1948,
    eyebrow: 'vzniká soutěž',
    title: 'Poprvé se uděluje Křišťálový glóbus',
    text: 'Třetí ročník přinesl soutěž a poprvé také hlavní cenu, z níž se stal nejznámější symbol festivalu. Křišťálový glóbus od té doby spojuje jednotlivé, velmi rozdílné etapy jeho historie.',
    x: 690,
    y: 650,
    side: 'left',
  },
  {
    year: 1950,
    eyebrow: 'Karlovy Vary',
    title: 'Festival se stěhuje do jediného města',
    text: 'Po čtyřech letech společného lázeňského dějiště se přehlídka přesunula výhradně do Karlových Varů. Město se tím stalo nejen místem projekcí, ale postupně i obrazem a značkou celého festivalu.',
    x: 405,
    y: 1110,
    side: 'right',
  },
  {
    year: 1956,
    eyebrow: 'festival kategorie A',
    title: 'Vary vstupují do nejvyšší festivalové kategorie',
    text: 'Mezinárodní federace asociací filmových producentů FIAPF zařadila Karlovy Vary do kategorie A: mezi nespecializované festivaly se soutěží celovečerních hraných filmů. Festival tak získal formální mezinárodní postavení, které si drží dodnes.',
    x: 705,
    y: 1570,
    side: 'left',
  },
  {
    year: 1959,
    eyebrow: 'střídání s Moskvou',
    title: 'Politické rozhodnutí přerušuje každoroční rytmus',
    text: 'Po roce 1959 se Karlovy Vary musely střídat s festivalem v Moskvě. Vary připadaly na sudé roky, Moskva na liché. Nešlo tedy o jednu dlouhou pauzu: z kalendáře postupně zmizelo osmnáct možných karlovarských ročníků.',
    x: 355,
    y: 2070,
    side: 'right',
  },
  {
    year: 1994,
    eyebrow: 'začátek moderní éry',
    title: 'Bartoška a Zaoralová přebírají festival na hraně zániku',
    text: 'Festival po změně režimu hledal nové místo i smysl a počátkem devadesátých let bojoval o přežití. Tým Jiřího Bartošky a Evy Zaoralové jej od roku 1994 začal měnit v každoroční mezinárodní fórum pro filmaře, profesionály i široké publikum.',
    x: 700,
    y: 2750,
    side: 'left',
  },
  {
    year: 2011,
    eyebrow: 'generační předání',
    title: 'Umělecké vedení přebírá Karel Och',
    text: 'Eva Zaoralová předala pozici umělecké ředitelky Karlu Ochovi, dál však působila jako umělecká poradkyně. Moderní festival tím poprvé prošel řízenou generační výměnou, aniž by přerušil programovou kontinuitu.',
    x: 390,
    y: 3370,
    side: 'right',
  },
  {
    year: 2020,
    eyebrow: 'pandemická mezera',
    title: 'Covid zastavuje festival po 26 každoročních ročnících',
    text: 'Od obnovení v roce 1994 se festival konal každý rok až do pandemie. Ročník 2020 se jako jediný v moderní éře neuskutečnil. Následující festival se do Varů vrátil v roce 2021.',
    x: 700,
    y: 3950,
    side: 'left',
  },
  {
    year: 2025,
    eyebrow: 'konec prezidentské éry',
    title: 'Festival se loučí s Jiřím Bartoškou',
    text: 'Jiří Bartoška zemřel po více než třiceti letech v čele festivalu. Funkce prezidenta už nebyla znovu obsazena a jeho jméno zůstává s KVIFF spojeno jako „Festival President In Memoriam“. Vedení převzal dlouholetý výkonný ředitel Kryštof Mucha.',
    x: 380,
    y: 4500,
    side: 'right',
  },
  {
    year: 2026,
    eyebrow: '60 ročníků · 80 let',
    title: 'Šedesátý ročník přichází po osmdesáti letech',
    text: 'Festival slaví osmdesát let od prvních projekcí, ale teprve šedesátý ročník. Rozdíl vytvořily neuskutečněné roky 1953 a 1955, osmnáct ročníků odňatých střídáním s Moskvou a covidová pauza v roce 2020.',
    x: 650,
    y: 5050,
    side: 'left',
  },
];

const DESKTOP_PATH =
  'M 320 30 L 320 300 C 300 440, 730 450, 690 650 C 655 870, 340 900, 405 1110 C 470 1310, 760 1340, 705 1570 C 650 1800, 310 1830, 355 2070 C 410 2380, 760 2420, 700 2750 C 650 3050, 340 3090, 390 3370 C 440 3630, 760 3670, 700 3950 C 650 4210, 330 4260, 380 4500 C 430 4760, 700 4810, 650 5170';
const MOBILE_PATH =
  'M 92 30 L 92 300 C 90 440, 700 460, 650 650 C 610 870, 55 900, 100 1110 C 145 1320, 700 1350, 650 1570 C 605 1790, 65 1840, 110 2070 C 160 2400, 700 2430, 650 2750 C 605 3060, 65 3100, 110 3370 C 155 3630, 700 3680, 650 3950 C 610 4210, 65 4280, 110 4500 C 150 4770, 700 4840, 650 5170';
const MOBILE_X = [92, 650, 100, 650, 110, 650, 110, 650, 110, 650];
const ROUTE_HEIGHT = 5200;

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
      const isActive = index === active;
      const isPast = index <= active;
      return (
        <g key={milestone.year} className={styles.marker}>
          <rect
            className={`${styles.markerNode} ${isActive ? styles.markerNodeActive : ''}`}
            x={cx - (isActive ? 11 : 8)}
            y={milestone.y - (isActive ? 11 : 8)}
            width={isActive ? 22 : 16}
            height={isActive ? 22 : 16}
            rx="2"
            transform={`rotate(45 ${cx} ${milestone.y})`}
          />
          <text
            className={`${styles.markerYear} ${isPast ? styles.markerYearPast : ''}`}
            x={cx}
            y={milestone.y - 25}
            textAnchor="middle"
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
        viewBox={`0 0 1000 ${ROUTE_HEIGHT}`}
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
        {renderDots()}
      </svg>

      <svg
        className={`${styles.route} ${styles.routeMobile}`}
        viewBox={`0 0 760 ${ROUTE_HEIGHT}`}
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
        {renderDots(true)}
      </svg>

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
          style={{ '--milestone-y': `${(milestone.y / ROUTE_HEIGHT) * 100}%` } as React.CSSProperties}
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
    </div>
  );
}
