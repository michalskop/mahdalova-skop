'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styles from './AboutScrolly.module.css';

type Step = {
  index: string;
  eyebrow: string;
  eyebrowPlain?: boolean;
  title: string;
  // Centred title with the eyebrow below it (intro card, mirrors the person cards).
  masthead?: boolean;
  // Title in the dark ink blue of the route line.
  titleInk?: boolean;
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
    eyebrow: 'mahdalova-skop.cz',
    title: 'DataTimes.cz',
    masthead: true,
    paragraphs: [
      'Vyprávíme příběhy, které tvoříme z&nbsp;dat, hledáme kontext a&nbsp;na vlastní kůži jsme si už vyzkoušeli, že věrně popisovat skutečnost si leckdy žádá i&nbsp;kus odvahy (nás to stálo práci).',
      'Hodně nám záleží na tom, aby naše práce odrážela realitu co nejvěrněji. Naše výhoda je, umíme pracovat s&nbsp;daty, hledat je, číst, vizualizovat, interpretovat.',
      'Hledáme a&nbsp;poctivě zachycujeme. Nepřibarvujeme. Nepracujeme pro zájmové skupiny. A&nbsp;rozhodně se nebojíme.',
    ],
    chips: ['Data', 'Kontext', 'Odvaha', 'Srozumitelnost'],
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
    title: 'Hledáme pravdu',
    masthead: true,
    titleInk: true,
    paragraphs: [
      'Vyrábět lži je dnes velmi levné. Kvalitní žurnalistika naproti tomu stojí čas i&nbsp;peníze. Věříme, že dobře informovaná veřejnost je podmínkou fungující demokracie. Kdo přestane chtít znát pravdu, přijde nakonec o&nbsp;to nejcennější – o&nbsp;svobodu.',
      'Věnujeme se coby novináři samozřejmě také investigativě, náš typ práce je v&nbsp;podstatě nekonečné pátrání. A&nbsp;hledání pravdy. Sbíráme informace kousek po kousku a&nbsp;dáváme jim kontext. Skládáme příběhy, které by jinak zůstaly skryté v&nbsp;nánosech lží, manipulací, ideologií nebo obyčejné hlouposti.',
    ],
    x: 300,
    y: 1905,
    side: 'right',
  },
];

const MOBILE_X = [710, 50, 710, 50];
// Where the line ends (it spills below the section into the next block and
// fades out there), measured from the centre of the last card.
const ROUTE_END = 360;
const ROUTE_FADE = 300;
// Where the head of the red line settles in the viewport (fraction of height)
// and over how many scrolled px it glides there from the first logo.
const HEAD_ANCHOR = 0.55;
const HEAD_RAMP = 360;

// Every segment leaves and enters its logo vertically, so the tangents match
// and the logos sit on one continuous curve like beads (no kinks at nodes).
function buildRoute(nodes: number[], endY: number, mobile = false) {
  const xs = mobile ? MOBILE_X : steps.map((step) => step.x);
  const route = nodes.map((y, index) => {
    if (index === 0) return `M ${xs[index]} ${y}`;
    const previousY = nodes[index - 1];
    const bend = (y - previousY) / 2;
    return `C ${xs[index - 1]} ${previousY + bend}, ${xs[index]} ${y - bend}, ${xs[index]} ${y}`;
  }).join(' ');
  const lastX = xs[xs.length - 1];
  const lastY = nodes[nodes.length - 1];
  const tail = endY - lastY;
  return `${route} C ${lastX} ${lastY + tail * 0.4}, ${lastX + 30} ${lastY + tail * 0.75}, ${lastX + 100} ${endY}`;
}

const smoothstep = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};
const LOGO_SRC = '/images/datatimes-donut.svg';

export default function AboutScrolly() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const desktopPathRef = useRef<SVGPathElement>(null);
  const mobilePathRef = useRef<SVGPathElement>(null);
  const [active, setActive] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [layout, setLayout] = useState({
    centers: steps.map((step) => step.y),
    nodes: steps.map((step) => step.y),
    height: 2260,
  });
  const lastCenter = layout.centers[layout.centers.length - 1];
  const endY = lastCenter + ROUTE_END;
  const desktopPath = buildRoute(layout.nodes, endY);
  const mobilePath = buildRoute(layout.nodes, endY, true);
  // The route canvas is taller than the section: its tail runs into the next block.
  const routeHeight = endY + 16;

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const cards = Array.from(section.querySelectorAll<HTMLElement>('[data-step]'));
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
        top += cardRect.height + 48;
        return node;
      });
      setLayout((previous) => previous.height === top &&
        previous.centers.every((center, index) => center === centers[index]) &&
        previous.nodes.every((node, index) => node === nodes[index])
        ? previous : { centers, nodes, height: top });
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
      const scrollY = Math.max(0, window.scrollY);
      const viewport = window.innerHeight;
      const sectionTop = section.getBoundingClientRect().top + scrollY;
      const firstY = layout.nodes[0];
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - viewport);

      // The head of the line starts exactly under the first logo (so nothing
      // shows before the first scroll), then glides to a fixed spot in the
      // viewport and travels with the reader from there.
      const logoScreenY = sectionTop + firstY;
      const rawRouteY = (y: number) => {
        const headScreenY = logoScreenY + (viewport * HEAD_ANCHOR - logoScreenY) * smoothstep(y / HEAD_RAMP);
        return y + headScreenY - sectionTop;
      };
      // If the page ends too early for the head to reach the tail, stretch the
      // whole run evenly instead of snapping at the bottom.
      const routeAtBottom = rawRouteY(maxScroll);
      const stretch = routeAtBottom < endY && routeAtBottom > firstY
        ? (endY - firstY) / (routeAtBottom - firstY) : 1;
      const routeY = scrollY <= 0
        ? firstY
        : Math.min(endY, firstY + (rawRouteY(scrollY) - firstY) * stretch);

      const path = window.innerWidth <= 820 ? mobilePathRef.current : desktopPathRef.current;
      if (path && routeY > firstY) {
        const totalLength = path.getTotalLength();
        let low = 0;
        let high = totalLength;
        for (let iteration = 0; iteration < 18; iteration += 1) {
          const middle = (low + high) / 2;
          if (path.getPointAtLength(middle).y < routeY) low = middle;
          else high = middle;
        }
        setProgress(routeY >= endY ? 1 : ((low + high) / 2) / totalLength);
      } else {
        setProgress(0);
      }

      // The first logo + card are lit from page load (the starting point);
      // every further one lights up once the red line reaches its logo.
      let reachedIndex = 0;
      steps.forEach((_, index) => {
        if (routeY >= layout.nodes[index]) reachedIndex = index;
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
  }, [layout, endY]);

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
            top: layout.nodes[index],
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
      '--route-height': `${routeHeight}px`,
      '--route-fade-start': `${endY - ROUTE_FADE}px`,
      '--route-fade-end': `${endY}px`,
    } as React.CSSProperties}>
      <svg
        className={`${styles.route} ${styles.routeDesktop}`}
        viewBox={`0 0 1000 ${routeHeight}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path className={styles.routeTrack} d={desktopPath} />
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
        viewBox={`0 0 760 ${routeHeight}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path className={styles.routeTrack} d={mobilePath} />
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
          style={{ '--milestone-y': `${layout.centers[index]}px` } as React.CSSProperties}
        >
          <div className={`${styles.bubble} ${step.masthead ? styles.bubbleCentered : ''}`}>
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
            ) : step.masthead ? (
              <div className={styles.bubbleMasthead}>
                <h3 className={step.titleInk ? styles.titleInk : undefined}>{step.title}</h3>
                <span className={styles.bubbleEyebrow}>{step.eyebrow}</span>
              </div>
            ) : (
              <>
                {step.eyebrow ? (
                  <div className={styles.bubbleMeta}>
                    <span
                      className={`${styles.bubbleEyebrow} ${
                        step.eyebrowPlain ? styles.bubbleEyebrowPlain : ''
                      }`}
                    >
                      {step.eyebrow}
                    </span>
                  </div>
                ) : null}
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
