import { IconBabyCarriage, IconHome } from '@tabler/icons-react';
import ChartCard from '@/components/charts/ChartCard';
import data from '@/app/specialy/data-pro-budouci-premierku/_content/01-demografie/_data_pipeline/milion_druhe_dite.json';

// Data: 01-demografie/_data_pipeline/milion_druhe_dite.py. „z_100_navic“ = z každých 100 vyplacených milionů
// kolik míří k dítěti, které by se bez odměny nenarodilo.
const COLORS = { navic: '#de1743', jinak: '#c9c9bd' };
// ikona = jedna rodina, která by milion dostala: červená = odměna ji přiměla k druhému dítěti, šedá = rozhodla se už dřív
const ROWS = [5, 10, 20].map((p) => data.scenare.find((s) => s.navic_pct === p)!);

function Row({ navicPct, navic, cena }: { navicPct: number; navic: number; cena: number }) {
  const icons = Array.from({ length: 100 }, (_, i) => i < navic);
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: '#101432', marginBottom: 6 }}>
        Kdyby odměna přivedla na svět o {navicPct} % víc druhých dětí: z každých 100 rodin, které milion dostanou, by o druhém dítěti
        rozhodla odměna jen u {navic}. Ostatních {100 - navic} se rozhodlo už dřív. Jedno takto získané dítě vychází na{' '}
        {String(cena).replace('.', ',')} milionů korun.
      </div>
      <div
        role="img"
        aria-label={`Ze 100 rodin, které by milion dostaly, by druhé dítě kvůli odměně mělo ${navic}, ostatních ${100 - navic} se rozhodlo už dřív`}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(20, 1fr)', gap: 2, maxWidth: 520 }}
      >
        {icons.map((extra, i) =>
          extra ? (
            <IconBabyCarriage key={i} size="100%" stroke={2} color={COLORS.navic} style={{ display: 'block' }} />
          ) : (
            <IconHome key={i} size="100%" stroke={1.6} color={COLORS.jinak} style={{ display: 'block' }} />
          ),
        )}
      </div>
    </div>
  );
}

export default function MilionKamJdou() {
  return (
    <ChartCard
      title="Odměna motivuje jen rodiny, které se o druhém dítěti ještě rozhodují"
      subtitle="Z každých 100 rodin, které by milion dostaly: u kolika by odměna skutečně rozhodla o druhém dítěti"
      source="[ČSÚ, Demografická příručka 2024, tab. 6.8](https://csu.gov.cz/produkty/demograficka-prirucka-2024), vlastní výpočet; plošná výplata milionu za každé druhé dítě, počty z roku 2024"
    >
      {ROWS.map((r) => (
        <Row key={r.navic_pct} navicPct={r.navic_pct} navic={r.z_100_navic} cena={r.cena_na_dite_navic_mil} />
      ))}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 13, color: '#333' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <IconBabyCarriage size={18} stroke={2} color={COLORS.navic} /> rodina, kterou odměna přiměla k druhému dítěti
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <IconHome size={18} stroke={1.6} color={COLORS.jinak} /> rodina, která se rozhodla už dřív
        </span>
      </div>
    </ChartCard>
  );
}
