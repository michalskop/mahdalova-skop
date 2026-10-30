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
  // Closes the card with the centred "Support us" button (SupportMenuButton).
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
    eyebrow: 'datatimes.cz / datajournalism.studio',
    title: 'DataTimes',
    masthead: true,
    paragraphs: [
      'We tell stories built from data and we look for context. We have also learned first-hand that describing reality faithfully sometimes takes a measure of courage (for doing so, we lost our jobs and income overnight and had to start again).',
      'It matters a great deal to us that our work reflects reality as faithfully as possible. Our advantage is that we know how to work with data: how to find it, read it, visualise it and interpret it.',
      'We search, and we record faithfully. We do not embellish. We do not work for interest groups. And we are certainly not afraid.',
    ],
    chips: ['Data', 'Context', 'Courage', 'Clarity'],
    side: 'left',
  },
  {
    index: '02',
    eyebrow: 'Editor-in-chief & co-owner',
    title: 'Kateřina Mahdalová',
    portrait: {
      src: '/authors/katerina-mahdalova-portret-v4.webp',
      alt: 'Portrait of Kateřina Mahdalová',
    },
    paragraphs: [
      'Journalist and analyst, author of thousands of visualisations and analyses. From 2016 to 2019 she led data projects at the Czech News Agency (ČTK), and she has long worked with leading media in Czechia and abroad. She visualises data, digs out the context and focuses on human rights and on holding the powerful to account.',
      'A two-time winner of the Czech Journalism Award with eight shortlist nominations, including the Data Journalism Awards. She graduated from the Josef Škvorecký Literary Academy and in information science from Masaryk University, and also studied at the University of California, San Diego and at Bangor University in Wales. Among other things, she now teaches data journalism at Jan Evangelista Purkyně University.',
    ],
    side: 'right',
  },
  {
    index: '03',
    eyebrow: 'Editor-in-chief & co-owner',
    title: 'Michal Škop',
    portrait: {
      src: '/authors/michal-skop-portret.webp',
      alt: 'Portrait of Michal Škop',
    },
    paragraphs: [
      'Statistician, demographer and programmer; founder and director of the non-profit <a href="https://volebnikalkulacka.cz/" target="_blank" rel="noreferrer">Voting Advice Applications</a> (Volební kalkulačka), which since 2006 have helped millions of voters in many countries make better-informed choices at elections.',
      'Winner of the Czech Journalism Award (2025) with three shortlist nominations. He has worked at the Max Planck Institute for Demographic Research in Rostock, Germany, at the University of Salamanca in Spain and at Charles University. He specialises in election analysis and forecasting. Among other things, he now works at the University of West Bohemia in Pilsen.',
    ],
    side: 'left',
  },
  {
    index: '04',
    eyebrow: 'In search of the truth',
    title: 'Why we do it',
    masthead: true,
    titleInk: true,
    paragraphs: [
      'We believe that a well-informed public is a precondition of a functioning democracy. Those who stop wanting to know the truth end up losing the most precious thing of all – their freedom.',
      'As journalists, we have long focused on investigative work; what we do is, in essence, an endless search. <strong>A search for the truth.</strong> We gather information piece by piece and give it context. We put together stories that would otherwise stay buried under layers of lies, manipulation, ideology or plain stupidity.',
    ],
    side: 'right',
  },
  {
    index: '05',
    eyebrow: '',
    title: 'Are you in?',
    masthead: true,
    titleInk: true,
    cta: true,
    paragraphs: [
      'Producing and spreading unverified information, half-truths and self-serving PR messages is a hundred times cheaper than doing quality journalism. The public space is being steamrolled by disinformation, by influencers who feed off journalism and by marketing projects – all carried by social-media algorithms and vested interests.',
    ],
    afterCta: [
      'If you have read this far, you know as well as we do that dreaming up catchy nonsense, spreading a half-truth or launching an outright self-serving campaign is now easier than ever – and practically free. Meanwhile, thorough, independent journalism faces overwhelming odds: algorithms favour shortcuts, emotions beat facts and people&rsquo;s attention is fragmenting.',
    ],
    bars: true,
    side: 'left',
  },
  {
    index: '06',
    eyebrow: '',
    title: 'What you get',
    masthead: true,
    titleInk: true,
    paragraphs: [
      'Rather than make grand gestures, we prefer to name the slice of reality our work can reach – and where we can often measure whether we have actually moved it. So we will not promise to save democracy single-handedly or to rid the internet of lies. But we certainly stand up for freedom and democracy, and we have no intention of stopping.',
      '<strong>We will always be on the side of the weaker, the overlooked, the oppressed – and, quite often, the rightly angry.</strong>',
      '<a href="https://buy.stripe.com/cNicN6damdlO7rY1x93ks0a" target="_blank" rel="noopener noreferrer"><strong>Be part of it with us.</strong></a>',
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
 * The /about timeline (English port of DataTimes.cz /o-nas) – content for the shared RouteTimeline. The line runs
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
