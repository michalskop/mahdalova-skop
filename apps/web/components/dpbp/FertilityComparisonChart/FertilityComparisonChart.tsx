import data from './data.json';

// Data: app/specialy/data-pro-budouci-premierku/_content/01-demografie/_data_pipeline/plodnost_zeme.cjs
type Row = { rok: number; tfr: number };

const X0 = 70;
const X1 = 570;
const Y_TOP = 42; // 2,1
const Y_PER_UNIT = (196 - 42) / 0.9; // 2,1 → 1,2
const YEAR0 = 2000;
const YEAR1 = 2024;

const x = (year: number) => X0 + ((year - YEAR0) / (YEAR1 - YEAR0)) * (X1 - X0);
const y = (tfr: number) => Y_TOP + (2.1 - tfr) * Y_PER_UNIT;
const fmt = (v: number) => v.toFixed(2).replace('.', ',');

const SERIES = [
  { geo: 'FR', name: 'Francie', color: '#999999', width: 2 },
  { geo: 'SE', name: 'Švédsko', color: '#4D2C62', width: 2.5 },
  { geo: 'HU', name: 'Maďarsko', color: '#f76800', width: 2 },
  { geo: 'CZ', name: 'Česko', color: '#de1743', width: 2.5 },
] as const;

const zeme = data.zeme as Record<string, Row[]>;

// Popisky na konci čar posunout tak, aby se nepřekrývaly (min. 13 px od sebe).
const endLabels = SERIES.map((s) => {
  const last = zeme[s.geo][zeme[s.geo].length - 1];
  return { ...s, last, labelY: y(last.tfr) + 4 };
}).sort((a, b) => a.labelY - b.labelY);
for (let i = 1; i < endLabels.length; i++) {
  endLabels[i].labelY = Math.max(endLabels[i].labelY, endLabels[i - 1].labelY + 13);
}

// Vrcholy, které text článku zmiňuje: Švédsko 2010, Česko 2021.
const PEAKS = [
  { geo: 'SE', rok: 2010, color: '#4D2C62' },
  { geo: 'CZ', rok: 2021, color: '#de1743' },
];

export default function FertilityComparisonChart() {
  return (
    <svg
      viewBox="0 0 700 280"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: '100%',
        fontFamily: "var(--font-roboto-condensed), Arial, sans-serif",
        maxWidth: '100%',
        height: 'auto',
        display: 'block',
        margin: '1.5em 0',
      }}
      role="img"
      aria-label={`Úhrnná plodnost 2000–2024: Francie ${fmt(zeme.FR.at(-1)!.tfr)}, Švédsko ${fmt(zeme.SE.at(-1)!.tfr)}, Maďarsko ${fmt(zeme.HU.at(-1)!.tfr)}, Česko ${fmt(zeme.CZ.at(-1)!.tfr)} v roce 2024`}
    >
      <rect width="700" height="280" fill="#F7F6F2" />
      {[1.8, 1.5, 1.2].map((v) => (
        <line key={v} x1={X0} y1={y(v)} x2={X1} y2={y(v)} stroke="#ddd" strokeWidth="1" strokeDasharray="4,3" />
      ))}
      <line x1={X0} y1="230" x2={X1} y2="230" stroke="#ccc" strokeWidth="1" />
      {[2.1, 1.8, 1.5, 1.2].map((v) => (
        <text key={v} x="62" y={y(v) + 4} textAnchor="end" fontSize="11" fill="#888">
          {v.toFixed(1).replace('.', ',')}
        </text>
      ))}
      {[2000, 2005, 2010, 2015, 2020, 2024].map((yr) => (
        <text key={yr} x={x(yr)} y="248" textAnchor="middle" fontSize="11" fill="#888">
          {yr}
        </text>
      ))}
      <line x1={X0} y1={Y_TOP} x2={X1} y2={Y_TOP} stroke="#aaa" strokeWidth="1.5" strokeDasharray="6,4" />
      <text x="72" y="38" fontSize="10" fill="#aaa">2,10 – reprodukční hranice</text>
      {SERIES.map((s) => (
        <polyline
          key={s.geo}
          points={zeme[s.geo].map((r) => `${x(r.rok).toFixed(1)},${y(r.tfr).toFixed(1)}`).join(' ')}
          fill="none"
          stroke={s.color}
          strokeWidth={s.width}
          strokeLinejoin="round"
        />
      ))}
      {PEAKS.map((p) => {
        const r = zeme[p.geo].find((d) => d.rok === p.rok)!;
        return (
          <g key={p.geo}>
            <circle cx={x(r.rok)} cy={y(r.tfr)} r="4" fill={p.color} />
            <text x={x(r.rok) + 4} y={y(r.tfr) - 8} fontSize="10" fill={p.color}>
              {fmt(r.tfr)}
            </text>
          </g>
        );
      })}
      {endLabels.map((s) => (
        <g key={s.geo}>
          <circle cx={x(s.last.rok)} cy={y(s.last.tfr)} r="3" fill={s.color} />
          <text x={X1 + 10} y={s.labelY} fontSize="11" fill={s.color}>
            {s.name} {fmt(s.last.tfr)}
          </text>
        </g>
      ))}
      <text x="70" y="270" fontSize="10" fill="#aaa">
        Zdroj: Eurostat, demo_find (úhrnná plodnost). Hodnoty za rok 2024.
      </text>
    </svg>
  );
}
