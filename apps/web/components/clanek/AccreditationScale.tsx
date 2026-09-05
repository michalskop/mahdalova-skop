'use client';

/**
 * Data visualisation for the Macinka accreditation article.
 * Top: a qualitative "outlier scale" – ministries that answered on the substance
 * cluster on the left (accreditation = organisational formality), the Ministry of
 * Foreign Affairs sits alone on the far right as the only office that turned a
 * journalist away over the character of her outlet.
 * Below: a named, colour-coded breakdown of every office and how it answered.
 */

const CRIMSON = '#de1743'; // brand[6]
const GREEN = '#639e0a'; // brandForestGreen[6]
const AXIS = '#c3c2b7'; // background[8] – reads on both light and dark

type Item = { name: string; detail: string };

const answered: Item[] = [
  { name: 'Ministerstvo dopravy', detail: 'akreditace není podmínkou vstupu; kvůli její absenci běžně neodmítá (výjimečně kapacita či bezpečnost).' },
  { name: 'Ministerstvo financí', detail: 'v letech 2024–2026 neodmítlo nikoho; akreditaci popisuje jako organizační proces, ne rozhodování.' },
  { name: 'Ministerstvo práce a sociálních věcí', detail: 'od roku 2024 nezná případ neudělení; nemá formalizovaný seznam důvodů.' },
  { name: 'Ministerstvo pro místní rozvoj', detail: 'akreditaci vyžaduje před každou akcí, ale nezná případ zamítnutí; při převisu rozhoduje pořadí žádostí.' },
  { name: 'Ministerstvo spravedlnosti', detail: 'akreditaci ojediněle neudělí, ale jen z kapacitních či tematických důvodů – charakter ani názor média důvodem není.' },
  { name: 'Ministerstvo školství', detail: 'za posledních 15 let nezná případ, kdy by akreditovaného novináře nepustilo dovnitř.' },
  { name: 'Ministerstvo zdravotnictví', detail: 'účast bez akreditace řeší na místě podle organizačních, kapacitních a bezpečnostních podmínek.' },
  { name: 'Ministerstvo zemědělství', detail: 'akreditaci uděluje automaticky všem novinářům, kteří o ni požádají.' },
];

const outlier: Item = {
  name: 'Ministerstvo zahraničí',
  detail: 'odmítlo akreditovanou novinářku Deníku N Zdislavu Pokornou (31. 7. 2026) a její redakci označilo za „alternativní média a konspirační blogy“.',
};

const noAnswer: Item[] = [
  { name: 'Ministerstvo obrany', detail: 'na žádost do uzávěrky neodpovědělo.' },
  { name: 'Ministerstvo vnitra', detail: 'na žádost do uzávěrky neodpovědělo.' },
  { name: 'Ministerstvo průmyslu a obchodu', detail: 'žádost pouze zaevidovalo, věcně neodpovědělo.' },
  { name: 'Ministerstvo kultury', detail: 'uvedlo, že obecný seznam důvodů nemá, a body žádosti formálně odmítlo.' },
  { name: 'Ministerstvo životního prostředí', detail: 'prodloužilo lhůtu, odpověď zatím nedodalo.' },
  { name: 'Úřad vlády', detail: 'prodloužil lhůtu, odpověď zatím nedodal.' },
];

const cluster = [
  { cx: 95, cy: 150 }, { cx: 118, cy: 174 }, { cx: 138, cy: 148 }, { cx: 158, cy: 172 },
  { cx: 115, cy: 162 }, { cx: 143, cy: 188 }, { cx: 168, cy: 156 }, { cx: 186, cy: 176 },
];

function Group({ color, label, count, items }: { color: string; label: string; count: string; items: Item[] }) {
  return (
    <div style={{ borderLeft: `3px solid ${color}`, paddingLeft: 14, marginTop: 20 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
        <strong style={{ fontSize: 14, color: 'var(--mantine-color-text)' }}>{label}</strong>
        <span style={{ fontSize: 13, color: 'var(--mantine-color-dimmed)' }}>· {count}</span>
      </div>
      {items.map((it) => (
        <div key={it.name} style={{ fontSize: 14, lineHeight: 1.5, padding: '3px 0', color: 'var(--mantine-color-text)' }}>
          <strong>{it.name}</strong> <span style={{ color: 'var(--mantine-color-dimmed)' }}>— {it.detail}</span>
        </div>
      ))}
    </div>
  );
}

export function AccreditationScale() {
  const muted = { fill: 'var(--mantine-color-dimmed)' } as const;
  return (
    <div style={{ margin: '1.5rem 0' }}>
      <svg
        viewBox="0 0 640 240"
        width="100%"
        role="img"
        aria-labelledby="accs-title accs-desc"
        style={{ display: 'block', maxWidth: 620, height: 'auto', margin: '0 auto', fontFamily: 'var(--mantine-font-family)' }}
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
          <circle key={i} cx={d.cx} cy={d.cy} r="7" fill={GREEN} />
        ))}

        <line x1="88" y1="126" x2="192" y2="126" stroke={AXIS} strokeWidth="1" />
        <line x1="88" y1="126" x2="88" y2="132" stroke={AXIS} strokeWidth="1" />
        <line x1="192" y1="126" x2="192" y2="132" stroke={AXIS} strokeWidth="1" />
        <text x="140" y="118" textAnchor="middle" fontSize="12.5" style={muted}>
          8 úřadů · akreditace = formalita
        </text>

        <circle cx="545" cy="160" r="11" fill={CRIMSON} />
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

      <Group color={GREEN} label="Vpouští / neodmítá kvůli obsahu média" count="8 úřadů, které odpověděly věcně" items={answered} />
      <Group color={CRIMSON} label="Vybočuje" count="1 úřad" items={[outlier]} />
      <Group color={AXIS} label="Zatím bez věcné odpovědi" count="6 úřadů" items={noAnswer} />
    </div>
  );
}

export default AccreditationScale;
