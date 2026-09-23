'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './AboutScrolly.module.css';

type Step = {
  index: string;
  eyebrow: string;
  title: string;
  paragraphs: string[];
  x: number;
  y: number;
  side: 'left' | 'right';
  portrait?: {
    src: string;
    alt: string;
    lead: string;
  };
};

const steps: Step[] = [
  {
    index: '01',
    eyebrow: 'DataTimes · Mahdalová & Škop',
    title: 'Datová žurnalistika, které se dá věřit',
    paragraphs: [
      'Jsme datoví novináři a analytici. Z dat tvoříme ověřitelné a srozumitelné příběhy — analýzy, vizualizace, mapy, dashboardy a interaktivní nástroje — o tématech, která mají dopad na společnost, politiku i ekonomiku.',
      'Z jednoho výzkumu děláme víc výstupů najednou. Tak, aby fungovaly pro čtenáře i pro stroj: ověřitelně, s metodikou, trvanlivě.',
    ],
    x: 700,
    y: 350,
    side: 'left',
  },
  {
    index: '02',
    eyebrow: 'Spoluzakladatelka',
    title: 'Kateřina Mahdalová',
    portrait: {
      src: '/authors/km_circle.png',
      alt: 'Portrét Kateřiny Mahdalové',
      lead: 'Průkopnice datové žurnalistiky v Česku',
    },
    paragraphs: [
      'Zakladatelka webu <a href="https://www.datovazurnalistika.cz/" target="_blank" rel="noreferrer">datovazurnalistika.cz</a>. Vytvořila stovky vizualizací a analýz, vedla datové projekty v ČTK a spolupracuje s předními médii u nás i ve světě.',
      'Dvojnásobná vítězka Novinářské ceny (2021 a 2025) a sedm finálových nominací. Studovala na UC San Diego, Bangor University a nyní dokončuje informační vědy na Masarykově univerzitě.',
    ],
    x: 300,
    y: 1650,
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
    y: 2950,
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
    y: 4250,
    side: 'right',
  },
];

const DESKTOP_PATH =
  'M 700 350 C 730 780, 270 1230, 300 1650 C 330 2080, 730 2520, 700 2950 C 670 3380, 270 3830, 300 4250 C 312 4420, 350 4520, 400 4600';
const MOBILE_PATH =
  'M 650 350 C 690 780, 70 1230, 110 1650 C 150 2080, 690 2520, 650 2950 C 610 3380, 70 3830, 110 4250 C 122 4420, 160 4520, 210 4600';
const MOBILE_X = [650, 110, 650, 110];
const ROUTE_HEIGHT = 4700;

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

  const renderNodes = (mobile = false) =>
    steps.map((step, index) => {
      const cx = mobile ? MOBILE_X[index] : step.x;
      const isActive = index === active;
      const isPast = index <= active;
      const size = isActive ? 30 : 22;
      return (
        <g key={step.index} className={styles.marker}>
          <rect
            className={`${styles.markerNode} ${isPast ? styles.markerNodePast : ''} ${
              isActive ? styles.markerNodeActive : ''
            }`}
            x={cx - size / 2}
            y={step.y - size / 2}
            width={size}
            height={size}
            rx={5}
          />
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
          ref={desktopPathRef}
          className={styles.routeProgress}
          d={DESKTOP_PATH}
          strokeDasharray={pathLengths.desktop}
          strokeDashoffset={pathLengths.desktop * (1 - progress)}
        />
        {renderNodes()}
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
        {renderNodes(true)}
      </svg>

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
            <div className={styles.bubbleMeta}>
              <span className={styles.bubbleEyebrow}>{step.eyebrow}</span>
            </div>
            {step.portrait ? (
              <div className={styles.bubblePortrait}>
                <img src={step.portrait.src} alt={step.portrait.alt} loading="lazy" />
                <span className={styles.bubblePortraitLead}>{step.portrait.lead}</span>
              </div>
            ) : null}
            <h3>{step.title}</h3>
            {step.paragraphs.map((paragraph) => (
              <p key={paragraph} dangerouslySetInnerHTML={{ __html: paragraph }} />
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
