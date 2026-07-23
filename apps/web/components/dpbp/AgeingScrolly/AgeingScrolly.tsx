'use client';

import { useEffect, useRef, useState } from 'react';
import ChartSignature from '../ChartSignature';
import styles from './AgeingScrolly.module.css';

const SNAPSHOTS = [
  { year: 2023, young: 16, working: 64, senior: 20, ratio: '1 senior na 3,1 lidí ve věku 15–64 let' },
  { year: 2040, young: 12, working: 62, senior: 26, ratio: '1 senior na 2,4 lidí ve věku 15–64 let' },
  { year: 2060, young: 13, working: 56, senior: 31, ratio: '1 senior na 1,8 lidí ve věku 15–64 let' },
  { year: 2100, young: 12, working: 54, senior: 34, ratio: '1 senior na 1,6 lidí ve věku 15–64 let' },
] as const;

const STEPS = [
  'Dnes tvoří lidé ve věku 65 a více let přibližně pětinu obyvatel. Na jednoho seniora připadají zhruba tři lidé v obvyklém produktivním věku.',
  'Kolem roku 2040 začnou do seniorského věku naplno vstupovat silné ročníky ze 70. let. Podíl seniorů se přiblíží čtvrtině populace.',
  'Do roku 2060 se poměr přiblíží jednomu seniorovi na dva lidi ve věku 15–64 let. Ne každý z nich ovšem skutečně pracuje a odvádí pojistné.',
  'Na konci století projekce neukazuje prázdnou zemi. Ukazuje zemi s podobným počtem obyvatel, ale výrazně jinou věkovou skladbou.',
] as const;

function category(index: number, snapshot: (typeof SNAPSHOTS)[number]) {
  if (index < snapshot.senior) return 'senior';
  if (index < snapshot.senior + snapshot.working) return 'working';
  return 'young';
}

export default function AgeingScrolly() {
  const [active, setActive] = useState(0);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(Number((visible.target as HTMLElement).dataset.step));
      },
      { rootMargin: '-30% 0px -45% 0px', threshold: [0.2, 0.5, 0.8] },
    );
    stepRefs.current.forEach(step => step && observer.observe(step));
    return () => observer.disconnect();
  }, []);

  const snapshot = SNAPSHOTS[active];

  return (
    <section className={styles.scrolly} aria-label="Jak se podle projekce ČSÚ změní věková skladba Česka">
      <div className={styles.graphic}>
        <header className={styles.header}>
          <div>
            <h2>Česko nezmizí, ale výrazně zestárne</h2>
            <p>Věková skladba obyvatel v %, střední varianta projekce ČSÚ</p>
          </div>
          <ChartSignature size={30} layout="stacked" textWeight={400} />
        </header>

        <div className={styles.year} aria-live="polite">{snapshot.year}</div>
        <div className={styles.people} aria-hidden="true">
          {Array.from({ length: 100 }, (_, index) => (
            <span key={index} className={styles[category(index, snapshot)]} />
          ))}
        </div>

        <div className={styles.legend}>
          <span><i className={styles.young} />0–14 let <strong>{snapshot.young} %</strong></span>
          <span><i className={styles.working} />15–64 let <strong>{snapshot.working} %</strong></span>
          <span><i className={styles.senior} />65+ <strong>{snapshot.senior} %</strong></span>
        </div>
        <p className={styles.ratio}>{snapshot.ratio}</p>

        <footer className={styles.footer}>
          <div>• autoři: Kateřina Mahdalová &amp; Michal Škop</div>
          <div>• data: ČSÚ, Projekce obyvatelstva České republiky 2023–2100, střední varianta</div>
        </footer>
      </div>

      <div className={styles.steps}>
        {STEPS.map((text, index) => (
          <div
            key={index}
            ref={element => { stepRefs.current[index] = element; }}
            data-step={index}
            className={`${styles.step} ${active === index ? styles.active : ''}`}
          >
            <strong>{SNAPSHOTS[index].year}</strong>
            <p>{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
