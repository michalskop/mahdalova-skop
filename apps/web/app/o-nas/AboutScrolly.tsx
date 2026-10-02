'use client';

import RouteTimeline, { RouteTimelineItem } from '@/components/common/RouteTimeline/RouteTimeline';
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
      'Vyprávíme příběhy, které tvoříme z&nbsp;dat, hledáme kontext a&nbsp;na vlastní kůži jsme si už vyzkoušeli, že věrně popisovat skutečnost si leckdy žádá i&nbsp;kus odvahy (my jsme kvůli tomu ze dne na den přišli o&nbsp;práci a&nbsp;příjmy a&nbsp;museli začít znovu).',
      'Hodně nám záleží na tom, aby naše práce odrážela realitu co nejvěrněji. Naše výhoda je, umíme pracovat s&nbsp;daty, hledat je, číst, vizualizovat, interpretovat.',
      'Hledáme a&nbsp;poctivě zachycujeme. Nepřibarvujeme. Nepracujeme pro zájmové skupiny. A&nbsp;rozhodně se nebojíme.',
    ],
    chips: ['Data', 'Kontext', 'Odvaha', 'Srozumitelnost'],
    side: 'left',
  },
  {
    index: '02',
    eyebrow: 'Šéfredaktorka & majitelka',
    title: 'Kateřina Mahdalová',
    portrait: {
      src: '/authors/katerina-mahdalova-portret-v4.webp',
      alt: 'Portrét Kateřiny Mahdalové',
    },
    paragraphs: [
      'Novinářka, analytička, autorka tisíců vizualizací a&nbsp;analýz. V&nbsp;letech 2016–19 vedla datové projekty v&nbsp;ČTK; dlouhodobě spolupracuje s&nbsp;předními médii u&nbsp;nás i&nbsp;ve světě. Vizualizuje data, vyhledává kontext, zaměřuje se na lidská práva a&nbsp;na kontrolu mocných.',
      'Dvojnásobná vítězka Novinářské ceny a&nbsp;držitelka osmi finálových nominací, včetně Data Journalism Award. Absolvovala Literární akademii Josefa Škvoreckého a&nbsp;informační vědy na Masarykově univerzitě. Studovala na Kalifornské univerzitě v&nbsp;San Diegu a&nbsp;Bangor University ve Walesu. Nyní mj. učí datovou žurnalistiku na Univerzitě Jana Evangelisty Purkyně.',
    ],
    side: 'right',
  },
  {
    index: '03',
    eyebrow: 'Šéfredaktor & majitel',
    title: 'Michal Škop',
    portrait: {
      src: '/authors/michal-skop-portret.webp',
      alt: 'Portrét Michala Škopa',
    },
    paragraphs: [
      'Statistik, demograf a&nbsp;programátor, zakladatel a&nbsp;ředitel neziskových <a href="https://volebnikalkulacka.cz/" target="_blank" rel="noreferrer">Volebních kalkulaček</a>, které od roku 2006 pomáhají v&nbsp;mnoha zemích milionům voličů k&nbsp;lepšímu rozhodování ve volbách.',
      'Vítěz Novinářské ceny (2025) a&nbsp;držitel tří finálových nominací. Působil v&nbsp;Institutu Maxe Plancka v&nbsp;německém Rostocku, na Universidad de Salamanca ve Španělsku a&nbsp;na Karlově univerzitě. Specializuje se na volební analýzy a&nbsp;predikce. Nyní mj. působí na Západočeské univerzitě v&nbsp;Plzni.',
    ],
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
    side: 'right',
  },
  {
    index: '05',
    eyebrow: '',
    title: 'Jdete do toho s námi?',
    masthead: true,
    titleInk: true,
    cta: true,
    paragraphs: [
      'Vyrábět a&nbsp;šířit neověřené informace, polopravdy a&nbsp;účelová PR sdělení je stonásobně levnější než dělat kvalitní žurnalistiku. Veřejný prostor válcují dezinformace, influenceři parazitující na novinařině a&nbsp;marketingové projekty – nesené algoritmy sociálních sítí a&nbsp;partikulárními zájmy.',
    ],
    afterCta: [
      'Pokud jste dočetli až sem, stejně jako my víte, že vymyslet chytlavý nesmysl, šířit polopravdu nebo rovnou spustit účelovou kampaň je nyní snazší než kdy dřív a&nbsp;prakticky zadarmo. Důkladná, nezávislá novinařina mezitím čelí brutální přesile: algoritmy přejí zkratkám, emoce porážejí fakta a&nbsp;pozornost lidí se tříští.',
    ],
    bars: true,
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
    side: 'right',
  },
];

function StepContent({ step }: { step: Step }) {
  return (
    <>
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
        <p className={`${styles.bubbleChips} ${step.masthead ? styles.bubbleChipsCentered : ''}`}>
          {step.chips.join(' • ')}
        </p>
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
    </>
  );
}

const items: RouteTimelineItem[] = steps.map((step) => ({
  id: step.index,
  side: step.side,
  content: <StepContent step={step} />,
}));

/**
 * The /o-nas timeline – content for the shared RouteTimeline. The line runs
 * into the donut logo of the closing note ([data-route-end], RouteEndLogo).
 */
export default function AboutScrolly() {
  return (
    <RouteTimeline
      items={items}
      endSelector="[data-route-end]"
      onArrive={() => window.dispatchEvent(new Event(ROUTE_END_EVENT))}
    />
  );
}
