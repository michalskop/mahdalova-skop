'use client';

import { useEffect, useRef, useState } from 'react';
import { NUM_FONT } from './ChartFrame';
import styles from './HistoryScrolly.module.css';

// Scrollytelling historie festivalu (§5, §6). Kill Zone princip: osa příběhu
// je fyzická osa času 1946–2026, scroll = pohyb po ní. Zvraty jsou uzly;
// vyšrafované období = střídání s Moskvou (hlavní důvod rozdílu 80 let vs
// 60 ročníků); 2020 je jen mezera (covid), ne zvrat.

type Step = {
  year: number;
  title: string;
  text: string;
  caption: string;
};

const steps: Step[] = [
  {
    year: 1946,
    title: '1946 — první ročník',
    text: 'Festival začal hlavně v Mariánských Lázních. Karlovy Vary byly zpočátku druhým dějištěm a přehlídka ještě neměla soutěž.',
    caption: '1. ročník',
  },
  {
    year: 1948,
    title: '1948 — poprvé Křišťálový globus',
    text: 'Po únoru 1948 vznikla soutěž a poprvé se udělil Křišťálový globus. O dva roky později se festival natrvalo přestěhoval do Varů, v roce 1956 získal od FIAPF prestižní kategorii A.',
    caption: 'vzniká soutěž',
  },
  {
    year: 1959,
    title: '1959 — rozdělení s Moskvou',
    text: 'Politické rozhodnutí přikázalo Varům střídat se s moskevským festivalem: sudé roky Vary, liché Moskva. Právě tady vzniká většina rozdílu mezi stářím festivalu a počtem ročníků.',
    caption: 'sudé roky Vary, liché Moskva',
  },
  {
    year: 1994,
    title: '1994 — návrat každoročního rytmu',
    text: 'Po revoluci se v roce 1990 neudělila hlavní cena a ročník 1993 se nekonal. Od roku 1994 vede festival tým Jiřího Bartošky a Evy Zaoralové, koná se každý rok a začíná budovat archiv. Jedinou novodobou mezerou zůstal covidový rok 2020.',
    caption: '29. ročník',
  },
  {
    year: 2026,
    title: '2026 — šedesátý ročník za osmdesát let',
    text: 'Dvacet chybějících ročníků nezpůsobila jedna přestávka, ale střídání s Moskvou, nekonaný rok 1993 a covidový 2020. Šedesátý ročník tak přišel až osmdesát let po prvním.',
    caption: '60 ročníků · 80 let',
  },
];

const YEAR_MIN = 1946;
const YEAR_MAX = 2026;
const AX = { x0: 64, x1: 690, y: 168 };
const MOSCOW_FROM = 1959;
const MOSCOW_TO = 1993;

const xOf = (year: number) => AX.x0 + ((year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * (AX.x1 - AX.x0);

const PURPLE = 'var(--mantine-color-brandNavy-6)';
const PURPLE_DARK = 'var(--mantine-color-brandNavy-9)';
const PURPLE_LIGHT = 'var(--mantine-color-brandNavy-2)';
const GOLD = 'var(--mantine-color-brandYellow-8)';
const TRACK = '#d4d4c8';

export default function HistoryScrolly() {
  const [active, setActive] = useState(0);
  const refs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(Number((visible.target as HTMLElement).dataset.step));
      },
      { rootMargin: '-25% 0px -45% 0px', threshold: [0.2, 0.55, 0.9] },
    );
    refs.current.forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const activeYear = steps[active].year;
  const fillX = xOf(activeYear);

  return (
    <div className={styles.scrolly}>
      <div className={styles.sticky}>
        <svg
          className={styles.axisSvg}
          viewBox="0 0 740 250"
          role="img"
          aria-label={`Časová osa festivalu 1946–2026, aktivní rok ${activeYear}: ${steps[active].caption}`}
        >
          <defs>
            <pattern id="kviff-moscow-hatch" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
              <rect width="8" height="8" fill={PURPLE_LIGHT} />
              <line x1="0" y1="0" x2="0" y2="8" stroke="#ffffff" strokeWidth="3" />
            </pattern>
          </defs>

          {/* velký odpočet nahoře: aktivní rok + krátká pointa */}
          <text x="64" y="52" style={{ ...NUM_FONT }} fontSize="66" fontWeight="800" fill={PURPLE_DARK}>{activeYear}</text>
          <text x="66" y="80" style={{ ...NUM_FONT }} fontSize="17" fontWeight="700" fill={GOLD}>{steps[active].caption}</text>

          {/* období střídání s Moskvou jako vyšrafovaný pás */}
          <rect x={xOf(MOSCOW_FROM)} y={AX.y - 9} width={xOf(MOSCOW_TO) - xOf(MOSCOW_FROM)} height={18} fill="url(#kviff-moscow-hatch)" />
          <text x={(xOf(MOSCOW_FROM) + xOf(MOSCOW_TO)) / 2} y={AX.y - 18} textAnchor="middle" style={{ ...NUM_FONT }} fontSize="12.5" fill="#555">
            střídání s Moskvou (1959–1993)
          </text>

          {/* základní osa + fialová výplň k aktivnímu roku */}
          <line x1={AX.x0} y1={AX.y} x2={AX.x1} y2={AX.y} stroke={TRACK} strokeWidth="6" strokeLinecap="round" />
          <line x1={AX.x0} y1={AX.y} x2={fillX} y2={AX.y} stroke={PURPLE} strokeWidth="6" strokeLinecap="round" />

          {/* mezera 2020 (covid) jako tick, ne zvrat */}
          <g>
            <line x1={xOf(2020)} y1={AX.y - 12} x2={xOf(2020)} y2={AX.y + 12} stroke="#b03a3a" strokeWidth="2" strokeDasharray="3 3" />
            <text x={xOf(2020)} y={AX.y + 30} textAnchor="middle" style={{ ...NUM_FONT }} fontSize="11" fill="#b03a3a">2020 — covid</text>
          </g>

          {/* uzly zvratů */}
          {steps.map((s, i) => {
            const cx = xOf(s.year);
            const isActive = i === active;
            const isPast = i <= active;
            return (
              <g key={s.year}>
                <circle
                  cx={cx}
                  cy={AX.y}
                  r={isActive ? 15 : 9}
                  fill={isActive ? GOLD : isPast ? PURPLE : '#ffffff'}
                  stroke={isActive ? GOLD : PURPLE}
                  strokeWidth="3"
                />
                <text
                  x={cx}
                  y={AX.y + 54}
                  textAnchor="middle"
                  style={{ ...NUM_FONT }}
                  fontSize={isActive ? 15 : 12.5}
                  fontWeight={isActive ? 800 : 600}
                  fill={isActive ? PURPLE_DARK : '#777'}
                >
                  {s.year}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className={styles.steps}>
        {steps.map((step, index) => (
          <div
            key={step.year}
            ref={(node) => { refs.current[index] = node; }}
            data-step={index}
            className={`${styles.step} ${index === active ? styles.stepActive : ''}`}
          >
            <div className={styles.bubble}>
              <strong>{step.title}</strong>
              <p>{step.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
