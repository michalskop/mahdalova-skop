// app/specialy/data-pro-budouci-premierku/spoluprace/page.tsx
// Partners and impact of the DPBP special: outputs published with other
// media, so readers (and the NFNZ grant committee) find them in one place.
import { Container, Box, SimpleGrid } from '@mantine/core';
import type { Metadata } from 'next';
import SupportBanner from '@/components/common/SupportBanner';
import { DPBP_HOME, chapterAccent } from '@/components/dpbp/chapterNavigation';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.mahdalova-skop.cz';
const COVER = `${BASE_URL}/images/specials/og/data-pro-budouci-premierku.jpg`;
const PATH = `${DPBP_HOME}/spoluprace`;
const TITLE = 'S kým spolupracujeme | Data pro budoucí premiérku';
const DESCRIPTION =
  'S kým jsme na speciálu Data pro budoucí premiérku spojili síly: Český rozhlas, PastVina, Volební kalkulačka, Moravec.cz a Univerzita Karlova.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PATH,
    type: 'website',
    images: [{ url: COVER, width: 1200, height: 630, alt: 'Data pro budoucí premiérku' }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, images: [COVER] },
};

type Item = { label: string; href?: string; note?: string; date?: string };
type Partner = {
  name: string;
  kind: string;
  chapter: string; // chapter slug, drives the accent colour
  intro: string;
  items: Item[];
  related?: Item[];
  status?: string;
};

const DEMO = '01-demografie';
const GOV = '15-efektivni-vladnuti';
const ch = (slug: string, article = '') => `${DPBP_HOME}/${slug}${article ? `/${article}` : ''}`;

const PARTNERS: Partner[] = [
  {
    name: 'Moravec.cz',
    kind: 'Datový videopořad Populace',
    chapter: GOV,
    intro:
      'V datovém pořadu Populace na Moravec.cz jsme s Václavem Moravcem rozebírali, jak funguje Sněmovna, kdo z poslanců chodí do práce a jak polistopadoví prezidenti udělovali milosti, vetovali zákony a rozdávali vyznamenání.',
    items: [
      { label: 'Poslanci „za sněmovnou“: docházka a absence poslanců', date: '25. 6. 2026', href: 'https://moravec.cz/videos/46zKXS8HPN4qd5JV3kaW' },
      { label: 'Sněmovní detektivové: vyšetřovací komise a účast na výborech', date: '1. 7. 2026', href: 'https://moravec.cz/videos/x4ib3ZTAlbhB9brMzCDz' },
      { label: 'Útoky na demokracii: důvěra v demokratické instituce', date: '9. 7. 2026', href: 'https://moravec.cz/videos/Oe18KKfpX0VT7Cd6tMc3' },
      { label: 'Prezidentský speciál: milosti, veta a vyznamenání', date: '23. 7. 2026', href: 'https://moravec.cz/videos/JsrRPoYVAdHPenYN21nq' },
    ],
    related: [
      { label: 'Docházka poslanců', href: ch(GOV, '02-dochazka') },
      { label: 'Prezidentské milosti', href: ch(GOV, '09-milosti') },
      { label: 'Cesty prezidentů', href: ch(GOV, '08-prezidentske-cesty') },
    ],
    status: 'Série bude pravděpodobně pokračovat. Videa jsou součástí placeného obsahu Moravec.cz.',
  },
  {
    name: 'PastVina',
    kind: 'Video-investigativní projekt Hlídače státu',
    chapter: DEMO,
    intro:
      'Investigativní tým PastViny stavěl na naší demografické kapitole, mimo jiné při ověřování slibu Andreje Babiše výrazně zvýšit porodnost. Takový nárůst plodnosti se zatím nepodařil žádné bohaté zemi.',
    items: [
      {
        label: 'Andrej Babiš si posvítí na porodnost, podle expertů to ale moc platné nebude',
        date: '3. 5. 2026',
        href: 'https://www.past-vina.cz/2026/05/03/andrej-babis-si-posviti-na-porodnost-podle-expertu-muze-ale-klidne-svitit-i-halogenem-a-moc-platne-to-nebude-proc/',
      },
    ],
    related: [
      { label: 'Kapitola Demografie', href: ch(DEMO) },
      { label: 'Politické sliby a porodnost', href: ch(DEMO, '08-politicke-sliby') },
    ],
    status: 'PastVina má teď pauzu a vrátí se v jiné podobě.',
  },
  {
    name: 'Český rozhlas',
    kind: 'iRozhlas.cz',
    chapter: GOV,
    intro:
      'Pro zpravodajský web Českého rozhlasu jsme analyzovali sněmovní obstrukce: kdo mluví nejvíc, kolik projevů padá mimo projednávané body a jak přibývá nočních jednání.',
    items: [
      {
        label: 'Sněmovní obstrukce: přibývá projevů mimo body i nočních jednání. Nejvíc mluví Babiš s Okamurou',
        date: '4. 4. 2025',
        href: 'https://www.irozhlas.cz/zpravy-domov/snemovna-obstrukce-opozice-babis-okamura_2504040500_jab',
      },
    ],
    related: [{ label: 'Po volbách 2025 se Sněmovna nezpomalila', href: ch(GOV, '07-obstrukce-2026') }],
    status: 'O další výstupy projektu má Český rozhlas zájem.',
  },
  {
    name: 'Volební kalkulačka',
    kind: 'KohoVolit.eu',
    chapter: GOV,
    intro:
      'Volební kalkulačka vychází mimo jiné z našich dat o hlasování ve Sněmovně a o programech stran. Projekt s ní částečně souvisí a jejím prostřednictvím se data dostala k desítkám tisíc voličů.',
    items: [
      { label: 'Sněmovní volby 2025', href: 'https://www.volebnikalkulacka.cz/volby/snemovni-2025' },
      { label: 'Komunální volby 2026', href: 'https://www.volebnikalkulacka.cz/volby/komunalni-2026' },
      { label: 'Senátní volby 2026', href: 'https://www.volebnikalkulacka.cz/volby/senatni-2026' },
    ],
    related: [
      { label: 'Volební kalkulačka slaví 20 let', href: '/clanek/volby-cr-2026-10-10-volebni-kalkulacka-73-mest-a-senat' },
      { label: 'Volební kalkulačka 2026: Senát a inventura hlasování', href: '/clanek/volby-cr-2026-10-04-volebni-kalkulacka-2026' },
    ],
  },
];

PARTNERS.push({
  name: 'Univerzita Karlova',
  kind: 'Přírodovědecká fakulta, katedra sociální geografie a regionálního rozvoje',
  chapter: GOV,
  intro:
    'S politickými geografy z Přírodovědecké fakulty Univerzity Karlovy jsme poprvé společně připravili Volební kalkulačku pro komunální volby ve více než 70 městech. Navazujeme společným projektem k tématu vládnutí, jehož výstupy teprve přijdou.',
  items: [{ label: 'Komunální volby 2026: kalkulačka pro více než 70 měst', href: 'https://www.volebnikalkulacka.cz/volby/komunalni-2026' }],
  related: [{ label: 'Kapitola Efektivní vládnutí', href: ch(GOV) }],
});

// Partners are shown in the order the collaborations started.
const PARTNER_ORDER = ['Český rozhlas', 'PastVina', 'Volební kalkulačka', 'Moravec.cz', 'Univerzita Karlova'];
const PARTNERS_SORTED = [...PARTNERS].sort(
  (a, b) => PARTNER_ORDER.indexOf(a.name) - PARTNER_ORDER.indexOf(b.name),
);

const STATS = [
  { n: '15', label: 'kapitol' },
  { n: '157', label: 'článků' },
  { n: '45', label: 'vlastních grafů' },
  { n: '36 000', label: 'odběratelů newsletteru' },
];

const DARK = '#101432';
const CARD = '#171c42';
const TEXT = '#f8f6f0';
const MUTED = 'rgba(248,246,240,0.72)';
const LINK = '#ffcf02';

function PartnerCard({ p }: { p: Partner }) {
  const accent = chapterAccent(p.chapter);
  return (
    <section className="sp-card" style={{ borderTop: `3px solid ${accent}` }}>
      <div className="sp-kind">{p.kind}</div>
      <h2 className="sp-name">{p.name}</h2>
      <p className="sp-intro">{p.intro}</p>
      <ul className="sp-list">
        {p.items.map((it) => (
          <li key={it.label}>
            {it.href ? (
              <a href={it.href} target="_blank" rel="noopener noreferrer">{it.label}</a>
            ) : (
              it.label
            )}
            {it.date && <span className="sp-date"> · {it.date}</span>}
          </li>
        ))}
      </ul>
      {p.related && (
        <p className="sp-related">
          <span>U nás na webu:</span>{' '}
          {p.related.map((r, i) => (
            <span key={r.label}>
              {i > 0 && ' · '}
              <a href={r.href}>{r.label}</a>
            </span>
          ))}
        </p>
      )}
      {p.status && <p className="sp-status">{p.status}</p>}
    </section>
  );
}

export default function DpbpPartnersPage() {
  return (
    <Container size="lg" maw="1200px" w="100%" p={0} m="0 auto">
      <style dangerouslySetInnerHTML={{ __html: `
        .sp-hero {
          background: linear-gradient(90deg, #101432 0%, #de1743 100%);
          padding: clamp(28px, 5vw, 52px) clamp(20px, 4vw, 40px);
        }
        .sp-tag {
          font-size: 0.85rem; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase;
          color: ${TEXT}; opacity: 0.7; margin: 0 0 6px 0;
          font-family: var(--font-roboto-condensed), 'Roboto', system-ui, sans-serif;
        }
        .sp-tag a { color: inherit; text-decoration: none; border-bottom: 1px solid rgba(248,246,240,0.4); }
        .sp-title {
          font-family: var(--font-roboto-slab), Georgia, serif; font-weight: 700;
          font-size: clamp(1.4rem, 3.2vw, 2.3rem); color: ${TEXT}; line-height: 1.1;
          letter-spacing: -0.02em; margin: 0;
        }
        .sp-lead {
          font-size: clamp(14px, 1.6vw, 17.5px); color: ${TEXT}; opacity: 0.88; line-height: 1.45;
          max-width: 720px; font-family: 'Roboto', system-ui, sans-serif; margin: 12px 0 0 0;
        }
        .sp-stats { display: flex; flex-wrap: wrap; gap: 12px 28px; margin: 0 0 36px; }
        .sp-stat-n {
          font-family: var(--font-roboto-slab), Georgia, serif; font-weight: 800; font-style: italic;
          font-size: clamp(28px, 4vw, 40px); color: #de1743; line-height: 1;
        }
        .sp-stat-l { font-family: 'Roboto', system-ui, sans-serif; font-size: 13px; color: ${MUTED}; margin-top: 4px; }
        .sp-card {
          background: ${CARD}; border-radius: 12px; padding: 20px 22px 18px; height: 100%;
          border: 1px solid rgba(255,255,255,0.10); color: ${TEXT};
          font-family: 'Roboto', system-ui, sans-serif;
        }
        .sp-kind { font-size: 12px; letter-spacing: 1px; text-transform: uppercase; color: ${MUTED}; }
        .sp-name {
          font-family: var(--font-roboto-slab), Georgia, serif; font-size: 22px; font-weight: 700;
          margin: 4px 0 10px; color: ${TEXT};
        }
        .sp-intro { font-size: 14.5px; line-height: 1.55; margin: 0 0 12px; color: ${TEXT}; opacity: 0.9; }
        .sp-list { margin: 0 0 12px; padding-left: 18px; font-size: 14px; line-height: 1.55; }
        .sp-list li { margin-bottom: 6px; }
        .sp-card a, .sp-box a { color: ${LINK}; text-decoration: none; border-bottom: 1px solid rgba(255,207,2,0.4); }
        .sp-card a:hover, .sp-box a:hover { color: #fff; border-bottom-color: #fff; }
        .sp-date { color: ${MUTED}; white-space: nowrap; }
        .sp-related { font-size: 13.5px; margin: 0 0 8px; color: ${MUTED}; }
        .sp-related > span:first-child { color: ${TEXT}; font-weight: 600; }
        .sp-status { font-size: 13px; font-style: italic; color: ${MUTED}; margin: 0; }
        .sp-box {
          background: #8b0e2b; border-radius: 8px; padding: 20px 28px; color: #fff;
          font-size: 14.5px; line-height: 1.65; margin: 32px 0 0;
          font-family: 'Roboto', system-ui, sans-serif;
        }
        .sp-box strong { color: ${LINK}; font-family: 'Roboto Slab', serif; }
        .sp-h { font-family: var(--font-roboto-slab), Georgia, serif; color: ${TEXT}; font-size: 20px; margin: 40px 0 12px; }
        .sp-p { color: ${TEXT}; opacity: 0.9; font-family: 'Roboto', system-ui, sans-serif; font-size: 15px; line-height: 1.6; max-width: 820px; }
        .sp-p a { color: ${LINK}; text-decoration: none; border-bottom: 1px solid rgba(255,207,2,0.4); }
      `}} />
      <Box style={{ background: DARK, minHeight: '100vh' }}>
        <div className="sp-hero">
          <div className="sp-tag">
            <a href={DPBP_HOME}>Speciál Data pro budoucí premiérku</a>
          </div>
          <h1 className="sp-title">S kým spolupracujeme</h1>
          <p className="sp-lead">
            Spojování sil si v novinářském řemesle velmi ceníme. Proto jsme otevření spolupráci s kolegy a kolegyněmi
            z dalších redakcí i z akademické sféry. Data ze speciálu tak nežijí jen u nás: rozebírali jsme je ve
            videopořadech, v investigativních reportážích, ve veřejnoprávním rozhlase i ve Volební kalkulačce.
          </p>
        </div>

        <Container size="lg" py={40} px="md">
          <div className="sp-stats">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="sp-stat-n">{s.n}</div>
                <div className="sp-stat-l">{s.label}</div>
              </div>
            ))}
          </div>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {PARTNERS_SORTED.map((p) => (
              <PartnerCard key={p.name} p={p} />
            ))}
          </SimpleGrid>

          <h2 className="sp-h">Ohlasy</h2>
          <p className="sp-p">
            Naše analýzy sdílí odborná veřejnost i čtenáři. Velký ohlas měl například text o tom, že{' '}
            <a href="/clanek/analyza-2026-09-23-ceske-matky-predskolaku-vstupuji-na-pracovni-trh-nejmene-v-eu">
              Česko pouští matky předškoláků do zaměstnání nejméně v EU
            </a>
            , který navazuje na kapitolu{' '}
            <a href={ch(DEMO)}>Demografie</a>, a rozbor{' '}
            <a href={ch(GOV, '02-dochazka')}>docházky a aktivity poslanců</a>.
          </p>

          <h2 className="sp-h">Připravujeme</h2>
          <p className="sp-p">
            S magazínem Voxpot připravujeme verzi vybraných kapitol upravenou přímo pro jeho čtenáře. Do konce roku 2026
            vyjde speciál také jako naše první kniha. Speciál zůstává otevřený i pro další média: pokud byste chtěli
            data nebo kapitoly převzít, ozvěte se nám.
          </p>

          <div className="sp-box">
            <strong>O projektu:</strong> Speciál Data pro budoucí premiérku vzniká s grantovou podporou{' '}
            <a href="https://www.nfnz.cz" target="_blank" rel="noopener noreferrer">Nadačního fondu nezávislé žurnalistiky</a>.
            {' '}Všech <a href={DPBP_HOME}>15 kapitol najdete na titulní stránce speciálu</a>.
          </div>
        </Container>

        <SupportBanner />
      </Box>
    </Container>
  );
}
