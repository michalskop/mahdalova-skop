// app/specialy/data-pro-budouci-premierku/page.tsx
import { Container, Title, Text, Box, SimpleGrid } from '@mantine/core';
import type { Metadata } from 'next';
import SupportBanner from '@/components/common/SupportBanner';

export const metadata: Metadata = {
  title: 'Data pro budoucí premiérku',
  description: 'Dvanáct datových kapitol o klíčových výzvách, které čekají na nové vedení České republiky.',
  alternates: { canonical: '/specialy/data-pro-budouci-premierku' },
  openGraph: {
    title: 'Data pro budoucí premiérku',
    description: 'Dvanáct datových kapitol o klíčových výzvách, které čekají na nové vedení České republiky.',
    url: '/specialy/data-pro-budouci-premierku',
    type: 'website',
  },
};

const SIL_PATH = "M4505 7963 c-130 -6 -403 -34 -524 -53 -875 -143 -1458 -484 -1863 -1090 -346 -518 -477 -1123 -368 -1705 43 -227 39 -248 -73 -460 -80 -152 -188 -320 -354 -551 -209 -292 -206 -335 33 -435 232 -98 281 -180 198 -336 -79 -149 -63 -208 69 -257 80 -30 86 -62 22 -137 -73 -85 -67 -119 34 -223 97 -99 125 -156 153 -308 35 -198 89 -290 200 -339 72 -32 227 -32 338 0 487 140 868 94 1071 -127 132 -144 194 -445 149 -727 -30 -196 -25 -214 37 -117 392 610 481 1639 233 2680 -56 232 -151 553 -257 860 -212 618 -252 809 -240 1147 28 809 505 1251 1512 1400 322 47 693 35 950 -31 455 -117 664 -411 601 -843 -23 -155 -12 -163 42 -31 99 245 86 520 -34 708 -290 453 -1118 597 -2214 386 -102 -19 -277 -55 -390 -79 -274 -57 -296 -60 -326 -40 -95 62 112 247 407 364 466 185 1039 256 1523 190 135 -18 160 -18 140 0 -28 27 -336 105 -494 125 -129 16 -422 37 -475 34 -16 -1 -61 -3 -100 -5z";
const SIL_T = "translate(-117.098299,796.836783) scale(0.100000,-0.100000)";

const DOTS: [number, number, number][] = [
  [358.4, 156.6, 40.6], [412.8, 347.0, 35.3], [340.9, 512.7, 24.7], [280.6, 220.0, 24.7],
  [379.8, 253.5, 21.2], [311.7, 364.6, 17.6], [537.3, 304.7, 17.6], [313.7, 292.3, 17.6],
  [449.8, 213.0, 17.6], [358.4, 435.1, 15.9], [471.2, 424.6, 12.3], [525.6, 361.1, 12.3],
  [469.2, 280.0, 12.3], [457.6, 138.9, 12.3], [412.8, 488.0,  8.8], [539.2, 234.1,  8.8],
];

// Hero head: logo-dpbp(19).svg — crimson fill, very dark circles (red/maroon/near-black)
const HERO_HEAD = {
  fill: '#de1743',
  dc: ['#401536','#78163b','#db1743','#7b163b','#5f1539','#a9163f','#341535','#8b163c','#321435','#b3163f','#80163b','#501537','#451536','#101432','#b3163f','#161432'],
};

// Card head colors — non-repeating in 4-col grid
// 01 crimson  | 02 periwinkle | 03 teal      | 04 amber
// 05 indigo   | 06 hot pink   | 07 burnt org | 08 forest
// 09 cyan     | 10 sienna     | 11 yellow    | 12 dark purple
const CHAPTERS = [
  {
    n: '01', title: 'Demografie',
    subtitle: 'Opravdu vymíráme? Co se doopravdy děje s českou populací',
    href: '/specialy/data-pro-budouci-premierku-01-demografie', available: true,
    headColor: '#de1743',
    dc: ['#e64234','#ef7422','#fecc03','#ef7621','#eb5e2a','#f7a013','#e43738','#f2851c','#e33538','#f8a90f','#f07b20','#e8502f','#e74732','#ffd53d','#f8a810','#df1c41'],
  },
  {
    n: '02', title: 'Vzdělávání',
    subtitle: 'Česká škola v datech: od předškolní výchovy po vysoké školy',
    href: '#', available: false,
    headColor: '#7c85e8',
    dc: ['#c4c8f8','#4a51ab','#9ea8f0','#5e66d5','#a4aaf4','#6870dc','#b8bcfa','#3848b8','#8890ec','#6068d8','#ccd0fa','#8088e8','#9098f0','#5060d0','#d0d4fc','#4050c0'],
  },
  {
    n: '03', title: 'Zdravotnictví',
    subtitle: 'Jak si stojí česká zdravotní péče ve srovnání s Evropou',
    href: '#', available: false,
    headColor: '#12b886',
    dc: ['#8c76b2','#618ea3','#15b787','#5f8fa2','#7483aa','#3ba295','#9671b6','#53959d','#9870b6','#33a692','#5b91a0','#817dae','#8878b1','#b262c0','#34a692','#ae64be'],
  },
  {
    n: '04', title: 'Trh práce',
    subtitle: 'Zaměstnanost, mzdy a budoucnost práce v Česku',
    href: '#', available: false,
    headColor: '#c4860a',
    dc: ['#ffd53d','#f4a520','#ffe878','#e88c10','#f7c030','#fad060','#f0a010','#fce080','#e89820','#f8b840','#fac850','#eda818','#ffd060','#f2ac28','#fce468','#eaa012'],
  },
  {
    n: '05', title: 'Bydlení',
    subtitle: 'Bytová krize v číslech: dostupnost, ceny a výstavba',
    href: '#', available: false,
    headColor: '#4a51ab',
    dc: ['#7c85e8','#9ea8f0','#5e66d5','#a4aaf4','#6870dc','#b8bcfa','#3848b8','#8890ec','#c4c8f8','#8088e8','#9098f0','#5060d0','#d0d4fc','#4050c0','#ccd0fa','#6878e0'],
  },
  {
    n: '06', title: 'Ekonomika',
    subtitle: 'HDP, příjmy domácností a nerovnosti v ekonomice',
    href: '#', available: false,
    headColor: '#e91e73',
    dc: ['#f47ba8','#ff6090','#fca0c0','#e84878','#ff80a8','#f06090','#faaac4','#e050808','#fc90b8','#e86090','#f8a0c0','#e45878','#ff88b0','#ec6898','#fabcc8','#e04870'],
  },
  {
    n: '07', title: 'Životní prostředí',
    subtitle: 'Klima, emise a česká cesta k udržitelnosti',
    href: '#', available: false,
    headColor: '#d4860a',
    dc: ['#f7a013','#ffd53d','#ef7422','#fecc03','#f8b030','#fce060','#f09010','#f7c040','#e88010','#fad050','#f4a820','#fce870','#eda010','#f8b840','#fcc050','#eea818'],
  },
  {
    n: '08', title: 'Bezpečnost',
    subtitle: 'Kriminalita, bezpečnostní hrozby a výdaje na obranu',
    href: '#', available: false,
    headColor: '#1a6e3c',
    dc: ['#2e9b5a','#52b878','#1a7840','#3daa68','#28925a','#4ab070','#1e7e44','#46bc74','#32a862','#56b87c','#208048','#4ab472','#30a460','#54bc78','#228248','#48b070'],
  },
  {
    n: '09', title: 'Sociální systém',
    subtitle: 'Sociální dávky, chudoba a nerovnosti v Česku',
    href: '#', available: false,
    headColor: '#22b4c0',
    dc: ['#33d4e0','#44c8d8','#1aa0b0','#28d8e4','#1aacc0','#3cd0dc','#28b8c8','#20c8d8','#18a8b8','#40d4e0','#30b8c8','#24ccd8','#1cb0c0','#38d0dc','#2cb4c4','#20a8b8'],
  },
  {
    n: '10', title: 'Digitalizace',
    subtitle: 'Stát v 21. století: e-government a digitální infrastruktura',
    href: '#', available: false,
    headColor: '#b05a28',
    dc: ['#d4882a','#e8a040','#c07020','#dc9030','#f0b048','#c87828','#e09838','#be6818','#d88030','#f0a840','#cc7828','#e89830','#c06820','#d88830','#ec9838','#c07020'],
  },
  {
    n: '11', title: 'Doprava a infrastruktura',
    subtitle: 'Silnice, železnice a dostupnost v regionech',
    href: '#', available: false,
    headColor: '#d4b800',
    dc: ['#ffd53d','#f4e060','#e8c800','#fce878','#f0d428','#fee880','#e8cc10','#fcf088','#f0e040','#fcea88','#ecd420','#fcf090','#f2e048','#fce880','#f0d830','#fee888'],
  },
  {
    n: '12', title: 'Věda a inovace',
    subtitle: 'Investice do výzkumu a česká inovační kapacita',
    href: '#', available: false,
    headColor: '#523361',
    dc: ['#9b5ec4','#7340a8','#c080d8','#8c66b8','#a868cc','#7c4ab0','#c888e0','#9470be','#b070d0','#7848ac','#cc90e4','#9c78c0','#b878d8','#8058b4','#d098e8','#a880c8'],
  },
];

const BOT_BG = '#a03250';
const BOT_TEXT = '#f8f6f0';
const DARK_BG = '#101432';

function HeadSvg({ fill, dc, clipId }: { fill: string; dc: string[]; clipId: string }) {
  return (
    <svg viewBox="-8 -8 716 716" xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', display: 'block' }} aria-hidden>
      <defs>
        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          <path transform={SIL_T} d={SIL_PATH} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect x="0" y="0" width="700" height="700" fill={fill} />
      </g>
      {DOTS.map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill={dc[i] ?? dc[i % dc.length]} />
      ))}
    </svg>
  );
}

function ChapterTile({ chapter }: { chapter: typeof CHAPTERS[0] }) {
  const clipId = `sil-${chapter.n}`;
  const inner = (
    <div
      className={chapter.available ? 'ch-card ch-card--active' : 'ch-card'}
      style={{
        borderRadius: 14,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 260,
        boxShadow: '0 2px 16px rgba(0,0,0,0.35)',
        cursor: chapter.available ? 'pointer' : 'default',
      }}
    >
      <div style={{ flex: '0 0 58%', position: 'relative', overflow: 'hidden' }}>
        <HeadSvg fill={chapter.headColor} dc={chapter.dc} clipId={clipId} />
        {!chapter.available && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.22)' }} />
        )}
      </div>
      <div style={{
        flex: '0 0 42%',
        background: BOT_BG,
        padding: '10px 13px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
          color: BOT_TEXT, opacity: 0.55,
          fontFamily: "'Roboto Slab', serif",
        }}>
          {chapter.n}
        </div>
        <div style={{
          fontSize: 14, fontWeight: 700, color: BOT_TEXT,
          lineHeight: 1.22, flex: 1,
          fontFamily: "'Roboto Slab', serif",
        }}>
          {chapter.title}
        </div>
        {chapter.available ? (
          <div style={{ fontSize: 11, fontWeight: 600, color: BOT_TEXT, marginTop: 4 }}>
            Číst →
          </div>
        ) : (
          <div style={{ fontSize: 10, color: BOT_TEXT, opacity: 0.4, marginTop: 4 }}>
            Připravujeme
          </div>
        )}
      </div>
    </div>
  );

  if (!chapter.available) return <div style={{ height: '100%' }}>{inner}</div>;
  return (
    <a href={chapter.href} style={{ textDecoration: 'none', height: '100%', display: 'block' }}>
      {inner}
    </a>
  );
}

export default function DpbpLandingPage() {
  return (
    <Container size="lg" maw="1200px" w="100%" p={0} m="0 auto">
      <style>{`
        .ch-card { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .ch-card--active:hover { transform: scale(1.03); box-shadow: 0 8px 32px rgba(0,0,0,0.45) !important; }
      `}</style>
      <Box style={{ background: DARK_BG, minHeight: '100vh' }}>

        {/* Hero — gradient + hlava vlevo */}
        <Box style={{
          background: 'linear-gradient(135deg, #f71b4b 0%, #8a0f38 45%, #101432 100%)',
          padding: '48px 32px 40px',
          display: 'flex',
          alignItems: 'center',
          gap: 32,
          flexWrap: 'wrap',
        }}>
          {/* Hlava vlevo */}
          <Box style={{ flexShrink: 0, width: 'clamp(160px, 22vw, 260px)', aspectRatio: '1 / 1' }}>
            <HeadSvg fill={HERO_HEAD.fill} dc={HERO_HEAD.dc} clipId="sil-hero" />
          </Box>

          {/* Text vpravo */}
          <Box style={{ flex: 1, minWidth: 240 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)',
              marginBottom: 12, fontFamily: "'Roboto Slab', serif",
            }}>
              Speciál · DataTimes.cz
            </div>
            <Title order={1} style={{
              fontFamily: "'Roboto Slab', serif", fontWeight: 700,
              fontSize: 'clamp(26px, 4vw, 48px)', color: '#ffffff',
              lineHeight: 1.15, marginBottom: 16,
            }}>
              Data pro budoucí premiérku
            </Title>
            <Text style={{
              fontSize: 'clamp(14px, 1.8vw, 18px)',
              color: 'rgba(255,255,255,0.82)',
              maxWidth: 520, lineHeight: 1.6,
            }}>
              Dvanáct datových kapitol o klíčových výzvách, které čekají na nové vedení České republiky.
              Co říkají čísla? A co s nimi může politika udělat?
            </Text>
          </Box>
        </Box>

        {/* Kapitoly grid */}
        <Container size="lg" py={40} px="md">
          <SimpleGrid cols={{ base: 2, xs: 3, sm: 4 }} spacing="md">
            {CHAPTERS.map(ch => (
              <ChapterTile key={ch.n} chapter={ch} />
            ))}
          </SimpleGrid>
        </Container>

        {/* Infobox o projektu */}
        <Box style={{
          background: '#fff3e8',
          borderLeft: '4px solid #f76800',
          borderRadius: 6,
          padding: '18px 22px',
          margin: '0 24px 32px',
          fontSize: 14,
          color: '#2a2a2a',
          lineHeight: 1.6,
        }}>
          <strong>O speciálu Data pro budoucí premiérku.</strong>{' '}
          Dlouhodobý projekt dvojice datových novinářů a analytiků{' '}
          <a href="https://www.mahdalova-skop.cz" style={{ color: '#f76800' }}>Mahdalová &amp; Škop</a>,
          {' '}který před volbami 2029 mapuje stav věcí v několika tematických blocích.
          Projekt vzniká s grantovou podporou{' '}
          <a href="https://www.nfnz.cz" target="_blank" rel="noopener noreferrer" style={{ color: '#f76800' }}>Nadačního fondu nezávislé žurnalistiky</a>
          {' '}a stojí na originálních datových analýzách a vlastním zpracování velkého množství zdrojů.
        </Box>

        <SupportBanner />
      </Box>
    </Container>
  );
}
