'use client';

import raw from './data/europe-health-systems.json';
import VisualFrame from './VisualFrame';
import styles from './HealthcareVisuals.module.css';

type Row = (typeof raw)[number];
const peers = ['CZ', 'SK', 'PL', 'HU', 'AT', 'DE', 'SE', 'NO'];
const names: Record<string, string> = { CZ: 'Česko', SK: 'Slovensko', PL: 'Polsko', HU: 'Maďarsko', AT: 'Rakousko', DE: 'Německo', SE: 'Švédsko', NO: 'Norsko' };

const metrics = [
  { key: 'healthy65', title: 'Roky ve zdraví po 65. roce', unit: 'roky', digits: 1 },
  { key: 'limited65', title: 'Roky s omezením po 65. roce', unit: 'roky', digits: 1 },
  { key: 'physician55', title: 'Lékaři ve věku 55+', unit: '%', digits: 1 },
  { key: 'beds100k', title: 'Nemocniční lůžka', unit: 'na 100 tisíc', digits: 0 },
] as const;

function RankPanel({ metric }: { metric: (typeof metrics)[number] }) {
  const data = (raw as Row[]).filter(row => peers.includes(row.iso) && typeof row[metric.key] === 'number')
    .sort((a, b) => Number(a[metric.key]) - Number(b[metric.key]));
  const max = Math.max(...data.map(row => Number(row[metric.key]))) * 1.08;
  const width = 390;
  const left = 78;
  const right = 12;
  const rowHeight = 28;
  return (
    <div className={styles.panel}>
      <h3>{metric.title}</h3>
      <small>{metric.unit}, rok 2023</small>
      <svg className={styles.rankSvg} viewBox={`0 0 ${width} ${data.length * rowHeight + 16}`} role="img" aria-label={metric.title}>
        {data.map((row, index) => {
          const value = Number(row[metric.key]);
          const x = left + value / max * (width - left - right);
          const isCzechia = row.iso === 'CZ';
          return (
            <g key={row.iso} transform={`translate(0 ${index * rowHeight + 17})`}>
              <text x={left - 8} y="4" textAnchor="end" fontSize="13" fontWeight={isCzechia ? 700 : 400} fill="#171a32">{names[row.iso]}</text>
              <line x1={left} x2={x} y1="0" y2="0" stroke={isCzechia ? '#d7194b' : '#c4c6c3'} strokeWidth={isCzechia ? 4 : 2} />
              <circle cx={x} cy="0" r={isCzechia ? 5.5 : 4} fill={isCzechia ? '#d7194b' : '#315f8c'} />
              <text x={x + 7} y="4" fontSize="12" fontWeight={isCzechia ? 700 : 400} fill="#333">{value.toFixed(metric.digits).replace('.', ',')}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function EuropeHealthSystems() {
  return (
    <VisualFrame
      title="Stejný věk, jiné uspořádání zdravotnictví"
      subtitle="Osm zemí ve čtyřech ukazatelích. Počet lůžek ani lékařů sám nevysvětluje, kolik zdravých let lidé získají."
      source={<><a href="https://ec.europa.eu/eurostat/databrowser/view/hlth_hlye/default/bar?lang=en">Eurostat hlth_hlye</a>, <a href="https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20250116-2">hlth_rs_phys</a> a hlth_rs_bds1; srovnání používá rok 2023</>}
    >
      <div className={styles.panelGrid}>
        {metrics.map(metric => <RankPanel key={metric.key} metric={metric} />)}
      </div>
      <div className={styles.note}>
        Mezinárodní srovnání neprokazuje příčinu. Eurostat navíc upozorňuje na rozdíly v definici „praktikujícího lékaře“ a na subjektivní složku ukazatele zdravých let. Graf ukazuje konfiguraci systému, nikoli jednoduchý žebříček kvality.
      </div>
    </VisualFrame>
  );
}
