// app/special/data-pro-budouci-premierku/page.tsx
import { Container, Title, Text, Box, SimpleGrid, Paper } from '@mantine/core';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data pro budoucí premiérku',
  description: 'Dvanáct datových kapitol o klíčových výzvách, které čekají na nové vedení České republiky.',
  alternates: { canonical: '/special/data-pro-budouci-premierku' },
  openGraph: {
    title: 'Data pro budoucí premiérku',
    description: 'Dvanáct datových kapitol o klíčových výzvách, které čekají na nové vedení České republiky.',
    url: '/special/data-pro-budouci-premierku',
    type: 'website',
  },
};

const CHAPTERS = [
  {
    n: '01',
    title: 'Demografie',
    subtitle: 'Opravdu vymíráme? Co se doopravdy děje s českou populací',
    href: '/special/data-pro-budouci-premierku-01-demografie',
    available: true,
    color: '#34628a',
  },
  {
    n: '02',
    title: 'Vzdělávání',
    subtitle: 'Česká škola v datech: od předškolní výchovy po vysoké školy',
    href: '#',
    available: false,
    color: '#4a51ab',
  },
  {
    n: '03',
    title: 'Zdravotnictví',
    subtitle: 'Jak si stojí česká zdravotní péče ve srovnání s Evropou',
    href: '#',
    available: false,
    color: '#0e839e',
  },
  {
    n: '04',
    title: 'Trh práce',
    subtitle: 'Zaměstnanost, mzdy a budoucnost práce v Česku',
    href: '#',
    available: false,
    color: '#344e7a',
  },
  {
    n: '05',
    title: 'Bydlení',
    subtitle: 'Bytová krize v číslech: dostupnost, ceny a výstavba',
    href: '#',
    available: false,
    color: '#a03250',
  },
  {
    n: '06',
    title: 'Ekonomika',
    subtitle: 'HDP, příjmy domácností a nerovnosti v ekonomice',
    href: '#',
    available: false,
    color: '#639e0a',
  },
  {
    n: '07',
    title: 'Životní prostředí',
    subtitle: 'Klima, emise a česká cesta k udržitelnosti',
    href: '#',
    available: false,
    color: '#0b6b4e',
  },
  {
    n: '08',
    title: 'Bezpečnost',
    subtitle: 'Kriminalita, bezpečnostní hrozby a výdaje na obranu',
    href: '#',
    available: false,
    color: '#272a59',
  },
  {
    n: '09',
    title: 'Sociální systém',
    subtitle: 'Sociální dávky, chudoba a nerovnosti v Česku',
    href: '#',
    available: false,
    color: '#6267a3',
  },
  {
    n: '10',
    title: 'Digitalizace',
    subtitle: 'Stát v 21. století: e-government a digitální infrastruktura',
    href: '#',
    available: false,
    color: '#06677d',
  },
  {
    n: '11',
    title: 'Doprava a infrastruktura',
    subtitle: 'Silnice, železnice a dostupnost v regionech',
    href: '#',
    available: false,
    color: '#523361',
  },
  {
    n: '12',
    title: 'Věda a inovace',
    subtitle: 'Investice do výzkumu a česká inovační kapacita',
    href: '#',
    available: false,
    color: '#343b67',
  },
];

function ChapterTile({ chapter }: { chapter: typeof CHAPTERS[0] }) {
  const inner = (
    <Paper
      radius={10}
      style={{
        background: chapter.color,
        padding: '24px 20px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        opacity: chapter.available ? 1 : 0.6,
        transition: 'transform 0.18s ease, opacity 0.18s ease',
        cursor: chapter.available ? 'pointer' : 'default',
      }}
    >
      <Text
        style={{ fontFamily: "'Roboto Slab', serif", fontWeight: 700, fontSize: 13, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em' }}
      >
        {chapter.n}
      </Text>
      <Title
        order={3}
        style={{ fontFamily: "'Roboto Slab', serif", fontWeight: 700, fontSize: 20, color: '#ffffff', lineHeight: 1.2 }}
      >
        {chapter.title}
      </Title>
      <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, flex: 1 }}>
        {chapter.subtitle}
      </Text>
      {chapter.available ? (
        <Text style={{ fontSize: 12, fontWeight: 600, color: '#ffffff', marginTop: 8 }}>Číst →</Text>
      ) : (
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 8 }}>Připravujeme</Text>
      )}
    </Paper>
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
    <Box style={{ background: '#044d5e', minHeight: '100vh' }}>
      {/* Hero */}
      <Box
        style={{
          background: 'linear-gradient(135deg, #ff3f30 0%, #c93020 60%, #7d1810 100%)',
          padding: '64px 24px 48px',
          textAlign: 'center',
        }}
      >
        <Container size="md">
          {/* Logo SVG */}
          <Box style={{ width: 160, height: 160, margin: '0 auto 24px' }}>
            <svg viewBox="-8 -8 716 716" xmlns="http://www.w3.org/2000/svg" overflow="visible" style={{ width: '100%', height: '100%' }}>
              <defs>
                <clipPath id="sil-clip-landing">
                  <path transform="translate(-117.098299,796.836783) scale(0.100000,-0.100000)"
                    d="M4505 7963 c-130 -6 -403 -34 -524 -53 -875 -143 -1458 -484 -1863
-1090 -346 -518 -477 -1123 -368 -1705 43 -227 39 -248 -73 -460 -80 -152
-188 -320 -354 -551 -209 -292 -206 -335 33 -435 232 -98 281 -180 198 -336
-79 -149 -63 -208 69 -257 80 -30 86 -62 22 -137 -73 -85 -67 -119 34 -223 97
-99 125 -156 153 -308 35 -198 89 -290 200 -339 72 -32 227 -32 338 0 487 140
868 94 1071 -127 132 -144 194 -445 149 -727 -30 -196 -25 -214 37 -117 392
610 481 1639 233 2680 -56 232 -151 553 -257 860 -212 618 -252 809 -240 1147
28 809 505 1251 1512 1400 322 47 693 35 950 -31 455 -117 664 -411 601 -843
-23 -155 -12 -163 42 -31 99 245 86 520 -34 708 -290 453 -1118 597 -2214 386
-102 -19 -277 -55 -390 -79 -274 -57 -296 -60 -326 -40 -95 62 112 247 407
364 466 185 1039 256 1523 190 135 -18 160 -18 140 0 -28 27 -336 105 -494
125 -129 16 -422 37 -475 34 -16 -1 -61 -3 -100 -5z" />
                </clipPath>
              </defs>
              <g><g clipPath="url(#sil-clip-landing)"><rect x="0" y="0" width="700" height="700" fill="#351040" /></g></g>
              <circle cx="358.4" cy="156.6" r="40.6" fill="#3391b5" />
              <circle cx="412.8" cy="347.0" r="35.3" fill="#34638b" />
              <circle cx="340.9" cy="512.7" r="24.7" fill="#351343" />
              <circle cx="280.6" cy="220.0" r="24.7" fill="#34628a" />
              <circle cx="379.8" cy="253.5" r="21.2" fill="#34789e" />
              <circle cx="311.7" cy="364.6" r="17.6" fill="#343b67" />
              <circle cx="537.3" cy="304.7" r="17.6" fill="#339cbf" />
              <circle cx="313.7" cy="292.3" r="17.6" fill="#34547e" />
              <circle cx="449.8" cy="213.0" r="17.6" fill="#339dc0" />
              <circle cx="358.4" cy="435.1" r="15.9" fill="#353360" />
              <circle cx="471.2" cy="424.6" r="12.3" fill="#345d86" />
              <circle cx="525.6" cy="361.1" r="12.3" fill="#3485aa" />
              <circle cx="469.2" cy="280.0" r="12.3" fill="#348db1" />
              <circle cx="457.6" cy="138.9" r="12.3" fill="#33b9d9" />
              <circle cx="412.8" cy="488.0" r="8.8" fill="#353460" />
              <circle cx="539.2" cy="234.1" r="8.8" fill="#33b4d5" />
            </svg>
          </Box>

          <Title
            order={1}
            style={{ fontFamily: "'Roboto Slab', serif", fontWeight: 700, fontSize: 'clamp(28px, 5vw, 48px)', color: '#ffffff', lineHeight: 1.2, marginBottom: 16 }}
          >
            Data pro budoucí premiérku
          </Title>
          <Text style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
            Dvanáct datových kapitol o klíčových výzvách, které čekají na nové vedení České republiky.
            Co říkají čísla? A co s nimi může politika udělat?
          </Text>
        </Container>
      </Box>

      {/* Kapitoly */}
      <Container size="lg" py={48} px="md">
        <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, lg: 4 }} spacing="md">
          {CHAPTERS.map(ch => (
            <ChapterTile key={ch.n} chapter={ch} />
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}
