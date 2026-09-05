'use client';

/**
 * One-off data visualisation for the Macinka accreditation article.
 * A qualitative "outlier scale": the ministries that answered on the substance
 * cluster on the left (accreditation = organisational formality); the Ministry
 * of Foreign Affairs sits alone on the far right as the only office that turned
 * a journalist away over the character of her outlet. Each dot carries a native
 * <title> tooltip with the ministry and what it said.
 */

const CRIMSON = '#de1743'; // brand[6]
const GREEN = '#639e0a'; // brandForestGreen[6]
const AXIS = '#c3c2b7'; // background[8] – reads on both light and dark

const cluster: { cx: number; cy: number; label: string }[] = [
  { cx: 95, cy: 150, label: 'Doprava – akreditace není podmínkou vstupu' },
  { cx: 118, cy: 174, label: 'Finance – v letech 2024–2026 neodmítlo nikoho' },
  { cx: 138, cy: 148, label: 'Práce a sociálních věcí – od roku 2024 žádné odmítnutí' },
  { cx: 158, cy: 172, label: 'Místní rozvoj – nezná případ zamítnutí' },
  { cx: 115, cy: 162, label: 'Spravedlnost – odmítá jen z kapacitních či tematických důvodů' },
  { cx: 143, cy: 188, label: 'Školství – 15 let bez odmítnutí akreditovaného novináře' },
  { cx: 168, cy: 156, label: 'Zdravotnictví – řeší na místě, ne podle média' },
  { cx: 186, cy: 176, label: 'Zemědělství – akreditaci uděluje automaticky všem' },
];

export function AccreditationScale() {
  const muted = { fill: 'var(--mantine-color-dimmed)' } as const;
  return (
    <svg
      viewBox="0 0 640 240"
      width="100%"
      role="img"
      aria-labelledby="accs-title accs-desc"
      style={{
        display: 'block',
        maxWidth: 620,
        height: 'auto',
        margin: '0 auto',
        fontFamily: 'var(--mantine-font-family)',
      }}
    >
      <title id="accs-title">Škála používání akreditace napříč úřady</title>
      <desc id="accs-desc">
        Osm ministerstev, která odpověděla věcně, se shlukuje vlevo, kde je akreditace jen
        organizační formalitou. Ministerstvo zahraničí leží osamoceně daleko vpravo jako jediné,
        které odmítlo akreditovanou novinářku kvůli charakteru jejího média.
      </desc>

      <line x1="50" y1="160" x2="600" y2="160" stroke={AXIS} strokeWidth="1.5" />
      <line x1="200" y1="160" x2="485" y2="160" stroke={AXIS} strokeWidth="1.5" strokeDasharray="3 5" />

      {cluster.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r="7" fill={GREEN}>
          <title>{d.label}</title>
        </circle>
      ))}

      <line x1="88" y1="126" x2="192" y2="126" stroke={AXIS} strokeWidth="1" />
      <line x1="88" y1="126" x2="88" y2="132" stroke={AXIS} strokeWidth="1" />
      <line x1="192" y1="126" x2="192" y2="132" stroke={AXIS} strokeWidth="1" />
      <text x="140" y="118" textAnchor="middle" fontSize="12.5" style={muted}>
        8 úřadů · akreditace = formalita
      </text>

      <circle cx="545" cy="160" r="11" fill={CRIMSON}>
        <title>Ministerstvo zahraničí – odmítlo akreditovanou novinářku Deníku N (31. 7. 2026)</title>
      </circle>
      <text x="545" y="126" textAnchor="middle" fontSize="13.5" fontWeight="500" fill={CRIMSON}>
        Ministerstvo zahraničí
      </text>
      <text x="545" y="188" textAnchor="middle" fontSize="12" fill={CRIMSON}>
        odmítlo akreditovanou novinářku
      </text>

      <text x="50" y="220" textAnchor="start" fontSize="11.5" style={muted}>
        akreditace jako organizační formalita
      </text>
      <text x="600" y="220" textAnchor="end" fontSize="11.5" style={muted}>
        výběr novinářů podle obsahu média
      </text>
    </svg>
  );
}

export default AccreditationScale;
