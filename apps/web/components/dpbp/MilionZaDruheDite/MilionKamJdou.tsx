import { IconBabyCarriage, IconCash } from '@tabler/icons-react';
import ChartCard from '@/components/charts/ChartCard';
import data from '@/app/specialy/data-pro-budouci-premierku/_content/01-demografie/_data_pipeline/milion_druhe_dite.json';

// Data: 01-demografie/_data_pipeline/milion_druhe_dite.py. „z_100_navic“ = z každých 100 vyplacených milionů
// kolik míří k dítěti, které by se bez odměny nenarodilo.
const COLORS = { navic: '#de1743', jinak: '#c9c9bd' };
const ROWS = [5, 10, 20].map((p) => data.scenare.find((s) => s.navic_pct === p)!);

function Row({ navicPct, navic, cena }: { navicPct: number; navic: number; cena: number }) {
  const icons = Array.from({ length: 100 }, (_, i) => i < navic);
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: '#101432', marginBottom: 6 }}>
        Kdyby se narodilo o {navicPct} % víc druhých dětí: z 100 milionů zaplatí {navic} dítě navíc, jedno takové dítě vyjde na{' '}
        {String(cena).replace('.', ',')} milionů korun
      </div>
      <div
        role="img"
        aria-label={`Při ${navicPct} % druhých dětí navíc míří ze 100 vyplacených milionů ${navic} k dětem, které by se jinak nenarodily, a ${100 - navic} k rodinám, které by druhé dítě měly i bez odměny`}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(20, 1fr)', gap: 2, maxWidth: 520 }}
      >
        {icons.map((extra, i) =>
          extra ? (
            <IconBabyCarriage key={i} size="100%" stroke={2} color={COLORS.navic} style={{ display: 'block' }} />
          ) : (
            <IconCash key={i} size="100%" stroke={1.6} color={COLORS.jinak} style={{ display: 'block' }} />
          ),
        )}
      </div>
    </div>
  );
}

export default function MilionKamJdou() {
  return (
    <ChartCard
      title="I kdyby odměna fungovala, většina milionů by šla rodinám, které by druhé dítě měly tak jako tak"
      subtitle="Ze 100 vyplacených milionů: kolik platí dítě navíc a kolik rodiče, kteří by druhé dítě měli i bez odměny"
      source="[ČSÚ, Demografická příručka 2024, tab. 6.8](https://csu.gov.cz/produkty/demograficka-prirucka-2024), vlastní výpočet; plošná výplata milionu za každé druhé dítě, počty z roku 2024"
    >
      {ROWS.map((r) => (
        <Row key={r.navic_pct} navicPct={r.navic_pct} navic={r.z_100_navic} cena={r.cena_na_dite_navic_mil} />
      ))}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 13, color: '#333' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <IconBabyCarriage size={18} stroke={2} color={COLORS.navic} /> dítě, které by se bez odměny nenarodilo
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <IconCash size={18} stroke={1.6} color={COLORS.jinak} /> rodina, která by druhé dítě měla i bez odměny
        </span>
      </div>
    </ChartCard>
  );
}
