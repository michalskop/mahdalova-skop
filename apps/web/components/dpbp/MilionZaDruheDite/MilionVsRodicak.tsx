import ChartCard from '@/components/charts/ChartCard';
import data from '@/app/specialy/data-pro-budouci-premierku/_content/01-demografie/_data_pipeline/milion_druhe_dite.json';

// Data: 01-demografie/_data_pipeline/milion_druhe_dite.py (ČSÚ, tab. 6.8 Živě narozené děti podle pořadí).
// Rodičovský příspěvek 2024: 29,2 mld. Kč (MPSV, podle Mesec.cz); hodnota není z našeho výpočtu, proto je zde jako konstanta.
const RODICAK_2024_MLD = 29.2;

const BARS = [
  { label: 'Milion za každé druhé dítě, počty z roku 2024', mld: data.cena_2024_mld, color: '#de1743', solid: true },
  { label: 'Totéž při počtech z roku 2025 (odhad)', mld: data.odhad_2025.cena_mld, color: '#de1743', solid: false },
  { label: 'Celý rodičovský příspěvek, výdaje roku 2024', mld: RODICAK_2024_MLD, color: '#101432', solid: true },
];

export default function MilionVsRodicak() {
  const max = Math.max(...BARS.map((b) => b.mld));
  return (
    <ChartCard
      title="Milion za druhé dítě by stál víc, než stát dává na celý rodičovský příspěvek"
      subtitle="Roční náklady v miliardách korun"
      source="[ČSÚ, Demografická příručka 2024, tab. 6.8](https://csu.gov.cz/produkty/demograficka-prirucka-2024), vlastní výpočet; [Mesec.cz: výdaje na rodičovský příspěvek 2024](https://www.mesec.cz/clanky/na-peci-40-miliard-na-bydleni-20-kolik-stat-vyda-na-socialni-davky-a-co-jejich-prijemce-ceka/). Počty za rok 2025 jsou odhad při stejném podílu druhých dětí jako v roce 2024."
    >
      <div role="img" aria-label={BARS.map((b) => `${b.label}: ${b.mld} miliardy korun`).join('; ')}>
        {BARS.map((b) => (
          <div key={b.label} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 14, color: '#1a1a1a', marginBottom: 4, fontWeight: 600 }}>{b.label}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  height: 26,
                  width: `${(b.mld / max) * 100}%`,
                  maxWidth: 'calc(100% - 70px)',
                  background: b.solid ? b.color : 'transparent',
                  border: `2px solid ${b.color}`,
                  borderRadius: 3,
                  boxSizing: 'border-box',
                }}
              />
              <span style={{ fontWeight: 700, fontSize: 16, color: b.color === '#101432' ? '#101432' : '#a81134', whiteSpace: 'nowrap' }}>
                {String(b.mld).replace('.', ',')} mld.
              </span>
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
