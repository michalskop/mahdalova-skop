'use client';

import RouteTimeline, { RouteTimelineItem } from '@/components/common/RouteTimeline/RouteTimeline';
import styles from './HistoryScrolly.module.css';

type Milestone = {
  year: number;
  eyebrow: string;
  title: string;
  text: string;
  side: 'left' | 'right';
  image?: {
    src: string;
    alt: string;
    caption: string;
    sourceUrl: string;
    portrait?: boolean;
    position?: string;
  };
};

const milestones: Milestone[] = [
  {
    year: 1946,
    eyebrow: '1. ročník',
    title: 'Festival začíná ve dvou lázeňských městech',
    text: 'První ročník jednoho z nejstarších filmových festivalů na světě se odehrál hlavně v Mariánských Lázních. Část projekcí hostily také Karlovy Vary. Festival ještě neměl soutěžní část ani dnešní pevné centrum.',
    side: 'right',
  },
  {
    year: 1948,
    eyebrow: 'vzniká soutěž',
    title: 'Poprvé se uděluje Křišťálový glóbus',
    text: 'Třetí ročník přinesl soutěž a poprvé také hlavní cenu, z níž se stal nejznámější symbol festivalu. Křišťálový glóbus od té doby spojuje jednotlivé, velmi rozdílné etapy jeho historie.',
    side: 'left',
  },
  {
    year: 1950,
    eyebrow: 'Karlovy Vary',
    title: 'Festival se stěhuje do jediného města',
    text: 'Po čtyřech letech společného lázeňského dějiště se přehlídka přesunula výhradně do Karlových Varů. Město se tím stalo nejen místem projekcí, ale postupně i obrazem a značkou celého festivalu.',
    side: 'right',
  },
  {
    year: 1956,
    eyebrow: 'festival kategorie A',
    title: 'Vary vstupují do nejvyšší festivalové kategorie',
    text: 'Mezinárodní federace asociací filmových producentů FIAPF zařadila Karlovy Vary do kategorie A: mezi nespecializované festivaly se soutěží celovečerních hraných filmů. Festival tak získal formální mezinárodní postavení, které si drží dodnes.',
    side: 'left',
  },
  {
    year: 1959,
    eyebrow: 'střídání s Moskvou',
    title: 'Politické rozhodnutí přerušuje každoroční rytmus',
    text: 'Po roce 1959 se Karlovy Vary musely střídat s festivalem v Moskvě. Vary připadaly na sudé roky, Moskva na liché. Nešlo tedy o jednu dlouhou pauzu: z kalendáře postupně zmizelo osmnáct možných karlovarských ročníků.',
    side: 'right',
  },
  {
    year: 1994,
    eyebrow: 'začátek moderní éry',
    title: 'Bartoška a Zaoralová přebírají festival na hraně zániku',
    text: 'Festival po změně režimu hledal nové místo i smysl a počátkem devadesátých let bojoval o přežití. Tým Jiřího Bartošky a Evy Zaoralové jej od roku 1994 začal měnit v každoroční mezinárodní fórum pro filmaře, profesionály i široké publikum.',
    side: 'left',
    image: {
      src: '/images/specials/kviff/timeline/1994-poster.jpg',
      alt: 'Oficiální plakát 29. ročníku Mezinárodního filmového festivalu Karlovy Vary',
      caption: 'Plakát 29. ročníku, který otevřel moderní éru festivalu',
      sourceUrl: 'https://www.kviff.com/en/about-us/festival-archive/1994',
      portrait: true,
    },
  },
  {
    year: 2011,
    eyebrow: 'generační předání',
    title: 'Umělecké vedení přebírá Karel Och',
    text: 'Eva Zaoralová předala pozici umělecké ředitelky Karlu Ochovi, dál však působila jako umělecká poradkyně. Moderní festival tím poprvé prošel řízenou generační výměnou, aniž by přerušil programovou kontinuitu.',
    side: 'right',
  },
  {
    year: 2020,
    eyebrow: 'pandemická mezera',
    title: 'Covid zastavuje festival po 26 každoročních ročnících',
    text: 'Od obnovení v roce 1994 se festival konal každý rok až do pandemie. Ročník 2020 se jako jediný v moderní éře neuskutečnil. Následující festival se do Varů vrátil v roce 2021.',
    side: 'left',
    image: {
      src: '/images/specials/kviff/timeline/2020-cancellation.png',
      alt: 'Jiří Bartoška s rouškou stojí v prázdném kinosále',
      caption: 'Prázdný sál se stal obrazem festivalového roku bez festivalu',
      sourceUrl:
        'https://www.kviff.com/en/news/3290-the-55th-karlovy-vary-international-film-festival-will-take-place-in-2021',
      position: 'center 43%',
    },
  },
  {
    year: 2025,
    eyebrow: 'konec prezidentské éry',
    title: 'Festival se loučí s Jiřím Bartoškou',
    text: 'Jiří Bartoška zemřel po více než třiceti letech v čele festivalu. Funkce prezidenta už nebyla znovu obsazena a jeho jméno zůstává s KVIFF spojeno jako „Festival President In Memoriam“. Vedení převzal dlouholetý výkonný ředitel Kryštof Mucha.',
    side: 'right',
    image: {
      src: '/images/specials/kviff/timeline/2025-jiri-bartoska.jpg',
      alt: 'Černobílý portrét Jiřího Bartošky v hotelu Pupp',
      caption: 'Jiří Bartoška, prezident moderního KVIFF v letech 1994–2025',
      sourceUrl: 'https://www.kviff.com/en/news/5228-tribute-to-jiri-bartoska-at-the-59th-kviff',
      position: 'center 68%',
    },
  },
  {
    year: 2026,
    eyebrow: '60 ročníků · 80 let',
    title: 'Šedesátý ročník přichází po osmdesáti letech',
    text: 'Festival slaví osmdesát let od prvních projekcí, ale teprve šedesátý ročník. Rozdíl vytvořily neuskutečněné roky 1953 a 1955, osmnáct ročníků odňatých střídáním s Moskvou a covidová pauza v roce 2020.',
    side: 'left',
    image: {
      src: '/images/specials/kviff/timeline/2026-opening.jpg',
      alt: 'Dustin Hoffman drží Křišťálový glóbus na 60. ročníku KVIFF',
      caption: 'Dustin Hoffman s Křišťálovým glóbem při zahájení 60. ročníku',
      sourceUrl:
        'https://www.kviff.com/en/news/5746-anniversary-edition-of-kviff-officially-opens-with-honours-for-dustin-hoffman-and-maggie-gyllenhaal',
      position: 'center 38%',
    },
  },
];


// Cards are narrower than on /o-nas, so the stops sit closer to the middle.
const STOP_X = { left: 0.62, right: 0.38 };

function MilestoneContent({ milestone }: { milestone: Milestone }) {
  return (
    <>
      <div className={styles.bubbleMeta}>
        <span className={styles.bubbleYear}>{milestone.year}</span>
        <span className={styles.bubbleEyebrow}>{milestone.eyebrow}</span>
      </div>
      {milestone.image ? (
        <figure
          className={`${styles.bubbleMedia} ${
            milestone.image.portrait ? styles.bubbleMediaPortrait : ''
          }`}
        >
          <img
            src={milestone.image.src}
            alt={milestone.image.alt}
            loading="lazy"
            style={
              {
                '--image-position': milestone.image.position ?? 'center',
              } as React.CSSProperties
            }
          />
          <figcaption>
            {milestone.image.caption}.{' '}
            <a href={milestone.image.sourceUrl} target="_blank" rel="noreferrer">
              Zdroj: KVIFF
            </a>
          </figcaption>
        </figure>
      ) : null}
      <h3>{milestone.title}</h3>
      <p>{milestone.text}</p>
    </>
  );
}

const items: RouteTimelineItem[] = milestones.map((milestone) => ({
  id: String(milestone.year),
  side: milestone.side,
  x: STOP_X[milestone.side],
  content: <MilestoneContent milestone={milestone} />,
}));

/** History of KVIFF as the shared wavy RouteTimeline, in the festival's purple. */
export default function HistoryScrolly() {
  return <RouteTimeline items={items} className={styles.timeline} gap={40} />;
}
