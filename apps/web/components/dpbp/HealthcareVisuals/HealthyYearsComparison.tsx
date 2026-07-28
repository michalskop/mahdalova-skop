'use client';

import raw from './data/europe-health-systems.json';
import VisualFrame from './VisualFrame';
import styles from './HealthcareVisuals.module.css';

const peers = ['SE', 'NO', 'DE', 'AT', 'PL', 'HU', 'SK', 'CZ'];
const names: Record<string, string> = { CZ: 'Česko', SK: 'Slovensko', PL: 'Polsko', HU: 'Maďarsko', AT: 'Rakousko', DE: 'Německo', SE: 'Švédsko', NO: 'Norsko' };

export default function HealthyYearsComparison() {
  const data = raw.filter(row => peers.includes(row.iso)).sort((a, b) => b.life65 - a.life65);
  const width = 760;
  const left = 105;
  const plot = 600;
  const scale = (value: number) => value / 23 * plot;
  return (
    <VisualFrame
      title="Delší život neznamená stejně dlouhé zdraví"
      subtitle="Očekávané roky života po 65. narozeninách, rozdělené na roky bez závažného omezení a roky s omezením běžných aktivit."
      source={<><a href="https://ec.europa.eu/eurostat/databrowser/view/hlth_hlye/default/bar?lang=en">Eurostat, Healthy life years by sex, 2023</a></>}
    >
      <svg className={styles.stackSvg} viewBox={`0 0 ${width} ${data.length * 48 + 66}`} role="img" aria-label="Zdravé roky a roky s omezením po 65. roce">
        <g transform="translate(0 30)">
          {[0, 5, 10, 15, 20].map(tick => (
            <g key={tick}>
              <line x1={left + scale(tick)} x2={left + scale(tick)} y1="-16" y2={data.length * 48 - 10} stroke="#ded9cf" />
              <text x={left + scale(tick)} y="-20" textAnchor="middle" fontSize="12" fill="#666">{tick}</text>
            </g>
          ))}
          {data.map((row, index) => {
            const y = index * 48;
            const isCzechia = row.iso === 'CZ';
            return (
              <g key={row.iso} transform={`translate(0 ${y})`}>
                <text x={left - 12} y="19" textAnchor="end" fontSize="15" fontWeight={isCzechia ? 700 : 400} fill="#171a32">{names[row.iso]}</text>
                <rect x={left} y="4" width={scale(row.healthy65)} height="24" rx="2" fill={isCzechia ? '#d7194b' : '#315f8c'} />
                <rect x={left + scale(row.healthy65)} y="4" width={scale(row.limited65)} height="24" rx="2" fill={isCzechia ? '#efb5c4' : '#c8dbe7'} />
                <text x={left + scale(row.healthy65) - 6} y="21" textAnchor="end" fontSize="12" fontWeight="700" fill="#fff">{row.healthy65.toFixed(1).replace('.', ',')}</text>
                <text x={left + scale(row.life65) + 7} y="21" fontSize="12" fontWeight={isCzechia ? 700 : 400} fill="#333">{row.life65.toFixed(1).replace('.', ',')} celkem</text>
              </g>
            );
          })}
        </g>
      </svg>
      <div className={styles.legend}>
        <span><i className={styles.swatch} style={{ background: '#315f8c' }} />roky bez závažného omezení</span>
        <span><i className={styles.swatch} style={{ background: '#c8dbe7' }} />roky s omezením</span>
        <span><i className={styles.swatch} style={{ background: '#d7194b' }} />Česko</span>
      </div>
      <div className={styles.note}>
        Ukazatel vychází z úmrtnostních tabulek a z odpovědí na otázku o omezení běžných aktivit. Kulturní rozdíly v odpovídání mohou část rozdílu mezi zeměmi ovlivnit.
      </div>
    </VisualFrame>
  );
}
