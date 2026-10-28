import { IconBabyCarriage, IconCash, IconHome, IconHorseToy, IconMicroscope } from '@tabler/icons-react';
import ChartCard from '@/components/charts/ChartCard';

// Zjištění podle systematického přehledu Bergsvik, Fauske a Hart (2021),
// Population and Development Review 47(4): 913–964, doi 10.1111/padr.12431.
// Síla dokladů: 3 = konzistentní doklady o vyšším počtu dětí za život,
// 2 = novější doklady o účinku, 1 = účinek dočasný nebo zatím jen slibný, 0 = přehled žádnou studii nezahrnul.
const ITEMS = [
  {
    Icon: IconHorseToy,
    title: 'Jesle a školky',
    sila: 3,
    text: 'Když přibude míst v péči o malé děti, rodí ženy víc dětí i za celý život, nejen dřív.',
  },
  {
    Icon: IconBabyCarriage,
    title: 'Rodičovská dovolená',
    sila: 2,
    text: 'Novější studie, hlavně ze střední Evropy, ukazují větší účinek, než se čekalo. Víc z ní mají páry s vyššími příjmy.',
  },
  {
    Icon: IconMicroscope,
    title: 'Hrazení umělého oplodnění',
    sila: 1,
    text: 'Slibné hlavně pro ženy nad 35 let, tedy pro ty, které se do mateřství pustily později.',
  },
  {
    Icon: IconCash,
    title: 'Vyšší peněžní dávky',
    sila: 1,
    text: 'Účinek bývá jen dočasný: lidé mají děti dřív, ale ne víc.',
  },
  {
    Icon: IconHome,
    title: 'Dostupné bydlení',
    sila: 0,
    text: 'Do přehledu se nedostala žádná studie, která by účinek na porodnost spolehlivě změřila. Důkazy chybí, neznamená to, že bydlení nehraje roli.',
  },
] as const;

const LABEL = ['důkazy chybí', 'účinek dočasný nebo zatím slibný', 'novější doklady o účinku', 'silné doklady'];

function Dots({ n }: { n: number }) {
  return (
    <span aria-label={LABEL[n]} title={LABEL[n]} style={{ display: 'inline-flex', gap: 3 }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: i < n ? '#de1743' : 'transparent',
            border: '1.5px solid #de1743',
          }}
        />
      ))}
    </span>
  );
}

export default function PolicyEvidenceCards() {
  return (
    <ChartCard
      title="Co může stát udělat: nejsilnější doklady mají jesle a školky"
      subtitle="Co o pěti typech opatření říká přehled 35 studií z Evropy, USA, Kanady a Austrálie"
      source="[Bergsvik, Fauske, Hart: Can Policies Stall the Fertility Fall?, Population and Development Review, 2021](https://onlinelibrary.wiley.com/doi/10.1111/padr.12431)"
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        {ITEMS.map(({ Icon, title, sila, text }) => (
          <div key={title} style={{ background: '#ffffff', borderRadius: 8, padding: '14px 14px 12px', border: '1px solid #e8e3d2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Icon size={30} stroke={1.6} color="#101432" />
              <strong style={{ fontSize: 15, color: '#101432', lineHeight: 1.25 }}>{title}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 12, color: '#a81134' }}>
              <Dots n={sila} /> {LABEL[sila]}
            </div>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.45, color: '#2b2a27' }}>{text}</p>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
