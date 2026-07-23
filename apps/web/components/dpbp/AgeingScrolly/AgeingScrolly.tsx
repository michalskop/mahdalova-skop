'use client';

import { useEffect, useRef, useState } from 'react';
import ChartSignature from '../ChartSignature';
import styles from './AgeingScrolly.module.css';

type AgeCategory = 'young' | 'working' | 'senior';
type InactiveCategoryMode = 'hidden' | 'muted';

type AgeingScrollyProps = {
  inactiveCategoryMode?: InactiveCategoryMode;
};

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

function category(index: number, snapshot: (typeof SNAPSHOTS)[number]): AgeCategory {
  if (index < snapshot.senior) return 'senior';
  if (index < snapshot.senior + snapshot.working) return 'working';
  return 'young';
}

const LEGEND_ITEMS: ReadonlyArray<{ category: AgeCategory; label: string }> = [
  { category: 'young', label: '0–14 let' },
  { category: 'working', label: '15–64 let' },
  { category: 'senior', label: '65+' },
];

export default function AgeingScrolly({ inactiveCategoryMode = 'hidden' }: AgeingScrollyProps) {
  const [active, setActive] = useState(0);
  const [visibleCategories, setVisibleCategories] = useState<Record<AgeCategory, boolean>>({
    young: true,
    working: true,
    senior: true,
  });
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
  const dots = Array.from({ length: 100 }, (_, index) => ({
    index,
    category: category(index, snapshot),
  })).filter(dot => inactiveCategoryMode === 'muted' || visibleCategories[dot.category]);

  const toggleCategory = (ageCategory: AgeCategory) => {
    setVisibleCategories(current => ({
      ...current,
      [ageCategory]: !current[ageCategory],
    }));
  };

  return (
    <section className={styles.scrolly} aria-label="Jak se podle projekce ČSÚ změní věková skladba Česka">
      <div className={styles.graphicStage}>
        <div className={styles.graphic}>
          <header className={styles.header}>
          <div>
            <h2>Česko nezmizí, ale výrazně zestárne</h2>
            <p>Věková skladba obyvatel v %, střední varianta projekce ČSÚ</p>
          </div>
          <ChartSignature
            size="clamp(36px, 4.5vw, 44px)"
            textSize="clamp(14px, 1.8vw, 18px)"
            layout="stacked"
            textWeight={400}
          />
          </header>

          <div className={styles.year} aria-live="polite">{snapshot.year}</div>
          <div className={styles.people} aria-hidden="true">
            {dots.map(dot => (
              <span
                key={dot.index}
                className={`${styles[dot.category]} ${
                  inactiveCategoryMode === 'muted' && !visibleCategories[dot.category] ? styles.muted : ''
                }`}
              />
            ))}
          </div>

          <div className={styles.legend} aria-label="Zobrazené věkové kategorie">
            {LEGEND_ITEMS.map(item => {
              const isVisible = visibleCategories[item.category];
              return (
                <button
                  key={item.category}
                  type="button"
                  className={`${styles.legendItem} ${isVisible ? '' : styles.legendItemInactive}`}
                  aria-pressed={isVisible}
                  onClick={() => toggleCategory(item.category)}
                >
                  <i className={styles[item.category]} aria-hidden="true" />
                  <span>{item.label}</span>
                  <strong>{snapshot[item.category]} %</strong>
                  <span className={styles.state}>{isVisible ? 'zapnuto' : 'vypnuto'}</span>
                </button>
              );
            })}
          </div>
          <p className={styles.ratio}>{snapshot.ratio}</p>

          <footer className={styles.footer}>
            <div>• autoři: Kateřina Mahdalová &amp; Michal Škop</div>
            <div>• data: ČSÚ, Projekce obyvatelstva České republiky 2023–2100, střední varianta</div>
            <div>• výchozí stav projekce: 1. 1. 2023; projekce byla vydána v roce 2023</div>
          </footer>
        </div>
      </div>

      <div className={styles.steps}>
        {STEPS.map((text, index) => (
          <div
            key={index}
            ref={element => { stepRefs.current[index] = element; }}
            data-step={index}
            className={`${styles.step} ${active === index ? styles.active : ''}`}
          >
            <div className={styles.bubble}>
              <strong>{SNAPSHOTS[index].year}</strong>
              <p>{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
