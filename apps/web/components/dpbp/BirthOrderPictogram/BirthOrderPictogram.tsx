import { IconWoman } from '@tabler/icons-react';
import ChartCard from '@/components/charts/ChartCard';
import data from '@/app/specialy/data-pro-budouci-premierku/_content/01-demografie/_data_pipeline/cas_rodicovstvi.json';

// Data: 01-demografie/_data_pipeline/cas_rodicovstvi.py (ČSÚ, tab. 6.12).
// Úhrnná plodnost 1. a 2. pořadí × 100 = kolik ze 100 žen by mělo první a druhé dítě,
// kdyby po celý život rodily jako ženy v daném roce.
const COLORS = { dve: '#de1743', jedno: '#ffb3c0', zadne: '#d4d4c8' };

type Year = '1990' | '2024';
const na100 = data.na100zen as Record<Year, { prvni: number; druhe: number }>;

function Row({ year }: { year: Year }) {
  const { prvni, druhe } = na100[year];
  const icons = Array.from({ length: 100 }, (_, i) =>
    i < druhe ? COLORS.dve : i < prvni ? COLORS.jedno : COLORS.zadne,
  );
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: '#101432', marginBottom: 6 }}>
        {year}: {druhe} se dvěma a více dětmi, {prvni - druhe} s jedním, {100 - prvni} bez dětí
      </div>
      <div
        role="img"
        aria-label={`Rok ${year}: ze 100 žen ${druhe} se dvěma a více dětmi, ${prvni - druhe} s jedním dítětem, ${100 - prvni} bezdětných`}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(20, 1fr)', gap: 1, maxWidth: 520 }}
      >
        {icons.map((c, i) => (
          <IconWoman key={i} size="100%" stroke={2} color={c} style={{ display: 'block' }} />
        ))}
      </div>
    </div>
  );
}

export default function BirthOrderPictogram() {
  return (
    <ChartCard
      title="Ze 100 žen by dnes mělo druhé dítě 53, v roce 1990 to bylo 71"
      subtitle="Kolik ze 100 žen by mělo první a druhé dítě, kdyby celý život rodily jako ženy v daném roce"
      source="[ČSÚ, Demografická příručka 2024, tab. 6.12 Úhrnná plodnost podle pořadí](https://csu.gov.cz/produkty/demograficka-prirucka-2024); vlastní přepočet na 100 žen"
    >
      <Row year="1990" />
      <Row year="2024" />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 13, color: '#333' }}>
        {[
          ['dvě a více dětí', COLORS.dve],
          ['jedno dítě', COLORS.jedno],
          ['bez dětí', COLORS.zadne],
        ].map(([label, c]) => (
          <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <IconWoman size={16} stroke={2} color={c} /> {label}
          </span>
        ))}
      </div>
    </ChartCard>
  );
}
