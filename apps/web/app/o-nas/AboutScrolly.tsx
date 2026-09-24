'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { SupportMenuButton } from '@/components/common/SupportMenuButton';
import styles from './AboutScrolly.module.css';
import NewsSourcesBars from './NewsSourcesBars';
import { ROUTE_END_EVENT } from './RouteEndLogo';

type Step = {
  index: string;
  eyebrow: string;
  eyebrowPlain?: boolean;
  title: string;
  // Centred title with the eyebrow below it (intro card, mirrors the person cards).
  masthead?: boolean;
  // Title in the dark ink blue of the route line.
  titleInk?: boolean;
  // Closes the card with the centred „Podpořte nás" button (same as the header).
  cta?: boolean;
  // Paragraphs rendered below the button, then optionally the animated bars.
  afterCta?: string[];
  bars?: boolean;
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
    eyebrow: 'Hledáme pravdu',
    title: 'Proč to děláme',
    masthead: true,
    titleInk: true,
    paragraphs: [
      'Věříme, že dobře informovaná veřejnost je podmínkou fungující demokracie. Kdo přestane chtít znát pravdu, přijde nakonec o&nbsp;to nejcennější – o&nbsp;svobodu.',
      'Věnujeme se coby novináři dlouhodobě investigativě, náš typ práce je v&nbsp;podstatě nekonečné pátrání. <strong>A&nbsp;hledání pravdy.</strong> Sbíráme informace kousek po kousku a&nbsp;dáváme jim kontext. Skládáme příběhy, které by jinak zůstaly skryté v&nbsp;nánosech lží, manipulací, ideologií nebo obyčejné hlouposti.',
    ],
    x: 300,
    y: 1905,
    side: 'right',
  },
  {
    index: '05',
    eyebrow: '',
    title: 'Jdete do toho s námi?',
    masthead: true,
    titleInk: true,
    cta: true,
    paragraphs: [
      'Vyrábět a&nbsp;šířit neověřené informace, polopravdy a&nbsp;účelová PR sdělení je stonásobně levnější než dělat kvalitní žurnalistiku. Veřejný prostor válcují dezinformace, influenceři parazitující na novinařině a&nbsp;marketingové projekty – nesené algoritmy sociálních sítí a&nbsp;partikulárními zájmy.',
    ],
    afterCta: [
      'Pokud jste dočetli až sem, stejně jako my víte, že vymyslet chytlavý nesmysl, šířit polopravdu nebo zaplatit kampaň se skrytým zájmem je nyní snazší a&nbsp;levnější než kdy dřív. Důkladná, nezávislá novinařina mezitím čelí brutální přesile: algoritmy přejí zkratkám, emoce porážejí fakta a&nbsp;pozornost lidí se tříští.',
    ],
    bars: true,
    x: 700,
    y: 2400,
    side: 'left',
  },
  {
    index: '06',
    eyebrow: '',
    title: 'Co za to',
    masthead: true,
    titleInk: true,
    paragraphs: [
      'Místo velkých gest raději pojmenováváme výsek reality, na který naše práce dosáhne – a&nbsp;u&nbsp;kterého mnohdy dokážeme změřit, jestli jsme s&nbsp;ním skutečně pohnuli. Takže nebudeme slibovat, že sami zachráníme demokracii nebo vymýtíme lži z&nbsp;internetu. Ale rozhodně svobodu a&nbsp;demokracii podporujeme a&nbsp;nehodláme v&nbsp;tom přestat.',
      '<strong>Vždy budeme na straně slabších, přehlížených, utlačovaných a&nbsp;leckdy i&nbsp;právem naštvaných.</strong>',
      '<a href="https://buy.stripe.com/cNicN6damdlO7rY1x93ks0a" target="_blank" rel="noopener noreferrer"><strong>Buďte u&nbsp;toho s&nbsp;námi.</strong></a>',
    ],
    x: 300,
    y: 2900,
    side: 'right',
  },
];

const MOBILE_X = [710, 50, 710, 50, 710, 50];
// Where the line ends (it spills below the section into the next block and
// fades out there), measured from the centre of the last card.
const ROUTE_END = 360;
const ROUTE_FADE = 300;
// How far before its (fully faded) end the line counts as having arrived.
const ROUTE_ARRIVAL = 60;
// Where the head of the red line settles in the viewport (fraction of height)
// and over how many scrolled px it glides there from the first logo.
const HEAD_ANCHOR = 0.55;
const HEAD_RAMP = 360;

// Every segment leaves and enters its logo vertically, so the tangents match
// and the logos sit on one continuous curve like beads (no kinks at nodes).
// Built in real px of the section width: the SVG is never stretched, so the
// drawn length always matches the computed head position.
function buildRoute(nodes: number[], endY: number, width: number, mobile = false) {
  const xs = (mobile ? MOBILE_X.map((x) => x / 760) : steps.map((step) => step.x / 1000))
    .map((fraction) => fraction * width);
  const route = nodes.map((y, index) => {
    if (index === 0) return `M ${xs[index]} ${y}`;
    const previousY = nodes[index - 1];
    const bend = (y - previousY) / 2;
    return `C ${xs[index - 1]} ${previousY + bend}, ${xs[index]} ${y - bend}, ${xs[index]} ${y}`;
  }).join(' ');
  const lastX = xs[xs.length - 1];
  const lastY = nodes[nodes.length - 1];
  // The tail swings towards the centred heading of the next block, so the
  // line leads the reader on instead of away from the page.
  const tail = endY - lastY;
  const endX = width / 2;
  return `${route} C ${lastX} ${lastY + tail * 0.45}, ${endX + (lastX - endX) * 0.3} ${lastY + tail * 0.8}, ${endX} ${endY}`;
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
  // Current (eased) position of the line's head, in section px.
  const headRef = useRef<number | null>(null);
  const [layout, setLayout] = useState({
    centers: steps.map((step) => step.y),
    nodes: steps.map((step) => step.y),
    height: 2260,
    width: 1000,
  });
  const lastCenter = layout.centers[layout.centers.length - 1];
  // The line ends just above the donut logo of the closing note (measured);
  // until it is measured, fall back to a fixed distance below the last card.
  const [logoEndY, setLogoEndY] = useState<number | null>(null);
  const endY = logoEndY ?? lastCenter + ROUTE_END;
  const endReachedRef = useRef(false);
  const desktopPath = buildRoute(layout.nodes, endY, layout.width);
  const mobilePath = buildRoute(layout.nodes, endY, layout.width, true);
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
      const width = section.getBoundingClientRect().width;
      setLayout((previous) => previous.height === top && previous.width === width &&
        previous.centers.every((center, index) => center === centers[index]) &&
        previous.nodes.every((node, index) => node === nodes[index])
        ? previous : { centers, nodes, height: top, width });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(section);
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const logo = document.querySelector<HTMLElement>('[data-route-end]');
    if (!section || !logo) return;
    const measureEnd = () => {
      const offset = logo.getBoundingClientRect().top - section.getBoundingClientRect().top - 8;
      setLogoEndY((previous) => (previous === offset ? previous : offset));
    };
    measureEnd();
    window.addEventListener('resize', measureEnd);
    return () => window.removeEventListener('resize', measureEnd);
  }, [layout]);

  useEffect(() => {
    let frame = 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Where the head of the line should be for the current scroll position.
    const targetRouteY = () => {
      const section = sectionRef.current;
      if (!section) return layout.nodes[0];
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
      return scrollY <= 0
        ? firstY
        : Math.min(endY, firstY + (rawRouteY(scrollY) - firstY) * stretch);
    };

    // Draws the line up to `routeY` straight in the DOM (no React re-render
    // per frame) and lights the logos from that very same head position, so
    // the drawing and the lighting can never drift apart.
    const render = (routeY: number) => {
      const firstY = layout.nodes[0];
      const mobile = window.innerWidth <= 820;
      const path = mobile ? mobilePathRef.current : desktopPathRef.current;
      let progress = 0;
      if (path && routeY > firstY) {
        const totalLength = path.getTotalLength();
        let low = 0;
        let high = totalLength;
        for (let iteration = 0; iteration < 22; iteration += 1) {
          const middle = (low + high) / 2;
          if (path.getPointAtLength(middle).y < routeY) low = middle;
          else high = middle;
        }
        progress = routeY >= endY ? 1 : ((low + high) / 2) / totalLength;
        // Dashes in real px of the unstretched path: drawn length == head.
        path.setAttribute('stroke-dasharray', `${totalLength} ${totalLength}`);
        path.setAttribute('stroke-dashoffset', String(totalLength * (1 - progress)));
      }
      [desktopPathRef.current, mobilePathRef.current].forEach((line) => {
        if (!line) return;
        line.setAttribute('visibility', line === path && progress > 0 ? 'visible' : 'hidden');
      });

      // The tail is practically faded out a little before endY: that is when
      // the reader sees the line arrive, so the closing logo spins right then.
      if (routeY >= endY - ROUTE_ARRIVAL && !endReachedRef.current) {
        endReachedRef.current = true;
        window.dispatchEvent(new Event(ROUTE_END_EVENT));
      }

      // The first logo + card are lit from page load (the starting point);
      // every further one lights up the moment the head touches its rim.
      const logoRadius = mobile ? 17 : 20;
      let reachedIndex = 0;
      layout.nodes.forEach((node, index) => {
        if (routeY >= node - logoRadius) reachedIndex = index;
      });
      setActive(reachedIndex);
    };

    // The head eases towards its target every frame: wheel steps turn into
    // one continuous stroke instead of jumps.
    const tick = () => {
      frame = 0;
      const target = targetRouteY();
      const current = headRef.current ?? target;
      const next = reducedMotion || Math.abs(target - current) < 0.5
        ? target : current + (target - current) * 0.2;
      headRef.current = next;
      render(next);
      if (next !== target) frame = window.requestAnimationFrame(tick);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(tick);
    };

    // On load (or relayout) jump straight to the right place, no glide.
    headRef.current = targetRouteY();
    render(headRef.current);
    const settleTimer = window.setTimeout(onScroll, 120);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer);
    };
  }, [layout, endY]);

  // Donut logo markers sit on the line (as HTML, positioned by the same
  // fractions as the route). They stay greyed until the line reaches them.
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
        viewBox={`0 0 ${layout.width} ${routeHeight}`}
        aria-hidden="true"
      >
        <path className={styles.routeTrack} d={desktopPath} />
        {/* stroke-dasharray / -dashoffset / visibility are driven per frame by render() */}
        <path
          ref={desktopPathRef}
          className={styles.routeProgress}
          d={desktopPath}
          visibility="hidden"
        />
      </svg>

      <svg
        className={`${styles.route} ${styles.routeMobile}`}
        viewBox={`0 0 ${layout.width} ${routeHeight}`}
        aria-hidden="true"
      >
        <path className={styles.routeTrack} d={mobilePath} />
        <path
          ref={mobilePathRef}
          className={styles.routeProgress}
          d={mobilePath}
          visibility="hidden"
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
                {step.eyebrow ? <span className={styles.bubbleEyebrow}>{step.eyebrow}</span> : null}
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
            {step.cta ? (
              <div className={styles.bubbleCta}>
                <SupportMenuButton />
              </div>
            ) : null}
            {step.afterCta?.map((paragraph) => (
              <p key={paragraph} className={styles.afterCta} dangerouslySetInnerHTML={{ __html: paragraph }} />
            ))}
            {step.bars ? (
              <div className={styles.bubbleBars}>
                <NewsSourcesBars />
              </div>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
