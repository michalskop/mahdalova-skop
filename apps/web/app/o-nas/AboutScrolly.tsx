'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './AboutScrolly.module.css';

type Step = {
  index: string;
  eyebrow: string;
  eyebrowPlain?: boolean;
  title: string;
  paragraphs: string[];
  chips?: string[];
  x: number;
  y: number;
  side: 'left' | 'right';
  portrait?: {
    src: string;
    alt: string;
    lead?: string;
  };
};

const steps: Step[] = [
  {
    index: '01',
    eyebrow: 'DataTimes.cz • mahdalova-skop.cz',
    eyebrowPlain: true,
    title: 'Kateřina Mahdalová & Michal Škop',
    paragraphs: [
      'Vyprávíme příběhy, které tvoříme z&nbsp;dat, hledáme kontext a&nbsp;na vlastní kůži jsme si už vyzkoušeli, že věrně popisovat skutečnost si leckdy žádá i&nbsp;kus odvahy (nás to stálo práci).',
      'Hodně nám záleží na tom, aby naše práce odrážela realitu co nejvěrněji. Naše výhoda je, umíme pracovat s&nbsp;daty, hledat je, číst, vizualizovat, interpretovat.',
      'Hledáme a&nbsp;poctivě zachycujeme. Nepřibarvujeme. Nepracujeme pro zájmové skupiny. A&nbsp;rozhodně se nebojíme.',
    ],
    chips: ['Data', 'Kontext', 'Srozumitelnost', 'Odvaha'],
    x: 700,
    y: 340,
    side: 'left',
  },
  {
    index: '02',
    eyebrow: 'Šéfredaktorka & majitelka',
    title: 'Kateřina Mahdalová',
    portrait: {
      src: '/authors/km_circle.png',
      alt: 'Portrét Kateřiny Mahdalové',
    },
    paragraphs: [
      'Novinářka, analytička, zakladatelka webu DataTimes.cz a&nbsp;DatovaZurnalistika.cz. Autorka tisíců vizualizací a&nbsp;analýz. V&nbsp;letech 2016–19 vedla datové projekty v&nbsp;ČTK a&nbsp;dlouhodobě spolupracuje s&nbsp;předními médii u&nbsp;nás i&nbsp;ve světě.',
      'Dvojnásobná vítězka Novinářské ceny a&nbsp;držitelka sedmi finálových nominací, včetně Data Journalism Award. Absolvovala Literární akademii Josefa Škvoreckého a&nbsp;informační vědy na Masarykově univerzitě. Studovala na UC San Diego a&nbsp;Bangor University a&nbsp;nyní mj. učí datovou žurnalistiku na Univerzitě Jana Evangelisty Purkyně.',
    ],
    x: 300,
    y: 1000,
    side: 'right',
  },
  {
    index: '03',
    eyebrow: 'Spoluzakladatel',
    title: 'Michal Škop',
    portrait: {
      src: '/authors/ms_circle.png',
      alt: 'Portrét Michala Škopa',
      lead: 'Statistik, demograf a vývojář',
    },
    paragraphs: [
      'Zakladatel a ředitel neziskových <a href="https://volebnikalkulacka.cz/" target="_blank" rel="noreferrer">Volebních kalkulaček</a>, které v sedmi zemích pomohly milionům voličů k lepšímu rozhodování ve volbách.',
      'Vítěz Novinářské ceny (2025) a tři finálové nominace. Působil v Max Planck Institute v Rostocku, na Universidad de Salamanca a Karlově univerzitě. Specializuje se na volební analýzy a predikce.',
    ],
    x: 700,
    y: 1660,
    side: 'left',
  },
  {
    index: '04',
    eyebrow: 'Proč to děláme',
    title: 'Fakta musí existovat dřív, než je začne hledat AI',
    paragraphs: [
      'Vyrábět lži je levné. Kvalitní datová žurnalistika ne. Věříme, že dobře informovaná veřejnost je podmínkou fungující demokracie — a proto pravda bez aktivní podpory nutně prohrává.',
      'Děláme datovou investigativu a analýzy, z nichž vzniká víc výstupů najednou: pro čtenáře, novináře, školy, instituce i AI nástroje, které stále víc formují veřejnou debatu.',
    ],
    x: 300,
    y: 2320,
    side: 'right',
  },
];

const DESKTOP_PATH =
  'M 700 340 C 760 560, 240 800, 300 1000 C 360 1200, 760 1460, 700 1660 C 640 1860, 240 2120, 300 2320 C 314 2420, 340 2520, 360 2600';
const MOBILE_PATH =
  'M 650 340 C 700 560, 60 800, 110 1000 C 160 1200, 700 1460, 650 1660 C 600 1860, 60 2120, 110 2320 C 124 2420, 150 2520, 170 2600';
const MOBILE_X = [650, 110, 650, 110];
const ROUTE_HEIGHT = 2650;
const LOGO_SRC = '/images/datatimes-donut.svg';

export default function AboutScrolly() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const desktopPathRef = useRef<SVGPathElement>(null);
  const mobilePathRef = useRef<SVGPathElement>(null);
  const [active, setActive] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [pathLengths, setPathLengths] = useState({ desktop: 1, mobile: 1 });

  useEffect(() => {
    setPathLengths({
      desktop: desktopPathRef.current?.getTotalLength() ?? 1,
      mobile: mobilePathRef.current?.getTotalLength() ?? 1,
    });

    let frame = 0;
    const updateProgress = () => {
      frame = 0;
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const viewportMarker = window.innerHeight * 0.52;
      const routeY = Math.min(
        ROUTE_HEIGHT,
        Math.max(0, ((viewportMarker - rect.top) / rect.height) * ROUTE_HEIGHT),
      );
      const path = window.innerWidth <= 820 ? mobilePathRef.current : desktopPathRef.current;

      if (path) {
        const totalLength = path.getTotalLength();
        let low = 0;
        let high = totalLength;
        for (let iteration = 0; iteration < 16; iteration += 1) {
          const middle = (low + high) / 2;
          if (path.getPointAtLength(middle).y < routeY) low = middle;
          else high = middle;
        }
        setProgress(Math.min(1, Math.max(0, ((low + high) / 2) / totalLength)));
      }

      let reachedIndex = -1;
      steps.forEach((step, index) => {
        if (routeY >= step.y) reachedIndex = index;
      });
      setActive(reachedIndex);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateProgress);
    };

    frame = window.requestAnimationFrame(updateProgress);
    const settleTimer = window.setTimeout(updateProgress, 120);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer);
    };
  }, []);

  // Donut logo markers sit on the line (as HTML, so they are never deformed by
  // the stretched SVG). They stay greyed until the red line reaches them.
  const markers = steps.map((step, index) => {
    const isReached = index <= active;
    const isActive = index === active;
    return (
      <span
        key={step.index}
        aria-hidden="true"
        className={`${styles.logoMark} ${isReached ? styles.logoMarkOn : ''} ${
          isActive ? styles.logoMarkActive : ''
        }`}
        style={
          {
            top: `${(step.y / ROUTE_HEIGHT) * 100}%`,
            '--logo-left-d': `${(step.x / 1000) * 100}%`,
            '--logo-left-m': `${(MOBILE_X[index] / 760) * 100}%`,
          } as React.CSSProperties
        }
      >
        <img src={LOGO_SRC} alt="" className={styles.logoImg} />
      </span>
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
          ref={desktopPathRef}
          className={styles.routeProgress}
          d={DESKTOP_PATH}
          strokeDasharray={pathLengths.desktop}
          strokeDashoffset={pathLengths.desktop * (1 - progress)}
        />
      </svg>

      <svg
        className={`${styles.route} ${styles.routeMobile}`}
        viewBox={`0 0 760 ${ROUTE_HEIGHT}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path className={styles.routeShadow} d={MOBILE_PATH} />
        <path
          ref={mobilePathRef}
          className={styles.routeProgress}
          d={MOBILE_PATH}
          strokeDasharray={pathLengths.mobile}
          strokeDashoffset={pathLengths.mobile * (1 - progress)}
        />
      </svg>

      {markers}

      {steps.map((step, index) => (
        <article
          key={step.index}
          data-step={index}
          className={`${styles.milestone} ${styles[step.side]} ${
            index <= active ? styles.milestoneReached : ''
          } ${index === active ? styles.milestoneActive : ''}`}
          style={{ '--milestone-y': `${(step.y / ROUTE_HEIGHT) * 100}%` } as React.CSSProperties}
        >
          <div className={styles.bubble}>
            <svg className={styles.bubbleTrace} aria-hidden="true" preserveAspectRatio="none">
              <rect
                className={styles.bubbleTraceLine}
                x="1"
                y="1"
                width="calc(100% - 2px)"
                height="calc(100% - 2px)"
                rx="4"
                pathLength="1"
              />
            </svg>
            {step.portrait ? (
              <div className={styles.bubbleHeader}>
                <img
                  className={styles.bubbleHeaderImg}
                  src={step.portrait.src}
                  alt={step.portrait.alt}
                  loading="lazy"
                />
                <div className={styles.bubbleHeaderText}>
                  <h3>{step.title}</h3>
                  <span className={styles.bubbleEyebrow}>{step.eyebrow}</span>
                  {step.portrait.lead ? (
                    <span className={styles.bubbleHeaderLead}>{step.portrait.lead}</span>
                  ) : null}
                </div>
              </div>
            ) : (
              <>
                <div className={styles.bubbleMeta}>
                  <span
                    className={`${styles.bubbleEyebrow} ${
                      step.eyebrowPlain ? styles.bubbleEyebrowPlain : ''
                    }`}
                  >
                    {step.eyebrow}
                  </span>
                </div>
                <h3>{step.title}</h3>
              </>
            )}
            {step.paragraphs.map((paragraph) => (
              <p key={paragraph} dangerouslySetInnerHTML={{ __html: paragraph }} />
            ))}
            {step.chips ? (
              <p className={styles.bubbleChips}>{step.chips.join(' • ')}</p>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
