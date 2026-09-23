'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
    y: 330,
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
      'Novinářka, analytička, autorka tisíců vizualizací a&nbsp;analýz. V&nbsp;letech 2016–19 vedla datové projekty v&nbsp;ČTK; dlouhodobě spolupracuje s&nbsp;předními médii u&nbsp;nás i&nbsp;ve světě. Vizualizuje data, vyhledává kontext, zaměřuje se na lidská práva a&nbsp;na kontrolu mocných.',
      'Dvojnásobná vítězka Novinářské ceny a&nbsp;držitelka osmi finálových nominací, včetně Data Journalism Award. Absolvovala Literární akademii Josefa Škvoreckého a&nbsp;informační vědy na Masarykově univerzitě. Studovala na Kalifornské univerzitě v&nbsp;San Diegu a&nbsp;Bangor University ve Walesu. Nyní mj. učí datovou žurnalistiku na Univerzitě Jana Evangelisty Purkyně.',
    ],
    x: 300,
    y: 910,
    side: 'right',
  },
  {
    index: '03',
    eyebrow: 'Šéfredaktor & majitel',
    title: 'Michal Škop',
    portrait: {
      src: '/authors/ms_circle.png',
      alt: 'Portrét Michala Škopa',
    },
    paragraphs: [
      'Statistik, demograf a&nbsp;programátor, zakladatel a&nbsp;ředitel neziskových <a href="https://volebnikalkulacka.cz/" target="_blank" rel="noreferrer">Volebních kalkulaček</a>, které od roku 2006 pomáhají v&nbsp;mnoha zemích milionům voličů k&nbsp;lepšímu rozhodování ve volbách.',
      'Vítěz Novinářské ceny (2025) a&nbsp;držitel tří finálových nominací. Působil v&nbsp;Institutu Maxe Plancka v&nbsp;německém Rostocku, na Universidad de Salamanca ve Španělsku a&nbsp;na Karlově univerzitě. Specializuje se na volební analýzy a&nbsp;predikce. Nyní mj. vyučuje na Západočeské univerzitě v&nbsp;Plzni.',
    ],
    x: 700,
    y: 1430,
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
    y: 1905,
    side: 'right',
  },
];

const MOBILE_X = [710, 50, 710, 50];
const ROUTE_TAIL = 275;

function buildRoute(centers: number[], mobile = false) {
  const xs = mobile ? MOBILE_X : steps.map((step) => step.x);
  const route = centers.map((y, index) => {
    if (index === 0) return `M ${xs[index]} ${y}`;
    const previousY = centers[index - 1];
    const bend = (y - previousY) / 3;
    const sway = xs[index - 1] > xs[index] ? 1 : -1;
    const amplitude = mobile ? 40 : 60;
    return `C ${xs[index - 1] + sway * amplitude} ${previousY + bend}, ${xs[index] - sway * amplitude} ${y - bend}, ${xs[index]} ${y}`;
  }).join(' ');
  const lastX = xs[xs.length - 1];
  const lastY = centers[centers.length - 1];
  return `${route} C ${lastX + 14} ${lastY + 95}, ${lastX + 40} ${lastY + 195}, ${lastX + 60} ${lastY + ROUTE_TAIL}`;
}
const LOGO_SRC = '/images/datatimes-donut.svg';

export default function AboutScrolly() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const desktopPathRef = useRef<SVGPathElement>(null);
  const mobilePathRef = useRef<SVGPathElement>(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [layout, setLayout] = useState({ centers: steps.map((step) => step.y), height: 2260 });
  const desktopPath = buildRoute(layout.centers);
  const mobilePath = buildRoute(layout.centers, true);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const cards = Array.from(section.querySelectorAll<HTMLElement>('[data-step]'));
    const measure = () => {
      let top = 24;
      const centers = cards.map((card) => {
        const height = card.getBoundingClientRect().height;
        const center = top + height / 2;
        top += height + 48;
        return center;
      });
      top = Math.max(top, centers[centers.length - 1] + ROUTE_TAIL + 24);
      setLayout((previous) => previous.height === top &&
        previous.centers.every((center, index) => center === centers[index])
        ? previous : { centers, height: top });
    };
    measure();
    const observer = new ResizeObserver(measure);
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;
    const updateProgress = () => {
      frame = 0;
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const firstY = layout.centers[0];
      const lastY = layout.centers[layout.centers.length - 1] + ROUTE_TAIL;
      // Keep the original one-to-one scroll movement, anchored to the first node.
      // The viewport midpoint must not create an initial head start or delay.
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrolledY = Math.max(0, window.scrollY) * layout.height / rect.height;
      const routeY = window.scrollY > 0 && window.scrollY >= maxScroll - 1
        ? lastY : Math.min(lastY, firstY + scrolledY);
      const scrollProgress = (routeY - firstY) / (lastY - firstY);
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
        setProgress(scrollProgress === 0 ? 0 : scrollProgress === 1 ? 1 : ((low + high) / 2) / totalLength);
      }

      let reachedIndex = -1;
      steps.forEach((_, index) => {
        if (routeY >= layout.centers[index]) reachedIndex = index;
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
  }, [layout]);

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
            top: `${(layout.centers[index] / layout.height) * 100}%`,
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
    <div ref={sectionRef} className={styles.scrolly} style={{
      height: layout.height,
      '--route-fade-start': `${layout.centers[layout.centers.length - 1] + 24}px`,
      '--route-fade-end': `${layout.centers[layout.centers.length - 1] + ROUTE_TAIL}px`,
    } as React.CSSProperties}>
      <svg
        className={`${styles.route} ${styles.routeDesktop}`}
        viewBox={`0 0 1000 ${layout.height}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          ref={desktopPathRef}
          className={styles.routeProgress}
          d={desktopPath}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - progress}
          visibility={progress > 0 ? 'visible' : 'hidden'}
        />
      </svg>

      <svg
        className={`${styles.route} ${styles.routeMobile}`}
        viewBox={`0 0 760 ${layout.height}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          ref={mobilePathRef}
          className={styles.routeProgress}
          d={mobilePath}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - progress}
          visibility={progress > 0 ? 'visible' : 'hidden'}
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
          style={{ '--milestone-y': `${(layout.centers[index] / layout.height) * 100}%` } as React.CSSProperties}
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
