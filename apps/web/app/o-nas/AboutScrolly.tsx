'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import ScrollRoute from '@/components/common/ScrollRoute/ScrollRoute';
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
// Fallback end of the line (below the last card) until the closing logo is measured.
const ROUTE_END = 360;
const LOGO_SRC = '/images/datatimes-donut.svg';

export default function AboutScrolly() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(-1);
  const [layout, setLayout] = useState({
    centers: steps.map((step) => step.y),
    nodes: steps.map((step) => step.y),
    height: 2260,
    width: 1000,
  });
  const lastCenter = layout.centers[layout.centers.length - 1];
  // The line runs into the donut logo of the closing note and touches its
  // top rim (measured).
  const [logoEndY, setLogoEndY] = useState<number | null>(null);
  const endY = logoEndY ?? lastCenter + ROUTE_END;
  const routeStops = steps.map((step, index) => ({
    y: layout.nodes[index],
    x: step.x / 1000,
    xMobile: MOBILE_X[index] / 760,
  }));

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
      const offset = logo.getBoundingClientRect().top - section.getBoundingClientRect().top;
      setLogoEndY((previous) => (previous === offset ? previous : offset));
    };
    measureEnd();
    window.addEventListener('resize', measureEnd);
    return () => window.removeEventListener('resize', measureEnd);
  }, [layout]);

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
    } as React.CSSProperties}>
      <ScrollRoute
        containerRef={sectionRef}
        width={layout.width}
        stops={routeStops}
        end={{ y: endY, x: 0.5 }}
        tail="node"
        onReach={(index) => setActive(Math.max(0, index))}
        onArrive={() => window.dispatchEvent(new Event(ROUTE_END_EVENT))}
      />

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
