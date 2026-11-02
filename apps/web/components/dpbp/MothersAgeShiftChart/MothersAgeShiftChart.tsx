import ChartCard from '@/components/charts/ChartCard';

export default function MothersAgeShiftChart() {
  return (
    <ChartCard
      title="Druhé dítě dnes přichází těsně před věkem, kdy plodnost žen začíná klesat"
      subtitle="Průměrný věk matky při narození prvního a druhého dítěte, Česko 1990 a 2024"
      source="[ČSÚ, Demografická příručka 2024, tab. 6.13 Průměrný věk žen při narození dítěte](https://csu.gov.cz/produkty/demograficka-prirucka-2024) · hranice 32 a 37 let: [ACOG a ASRM, Female age-related fertility decline, 2014](https://doi.org/10.1016/j.fertnstert.2013.12.032)"
    >
      <svg
        viewBox="0 0 660 200"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: '100%',
          fontFamily: "var(--font-roboto-condensed), Arial, sans-serif",
          maxWidth: '100%',
          height: 'auto',
          display: 'block',
        }}
        role="img"
        aria-label="Posun průměrného věku matky při prvním porodu v ČR z 22,5 roku (1990) na 29 let (2024)"
      >
        <rect x="420" y="30" width="125" height="140" fill="#ffb3c0" opacity="0.25" />
        <rect x="545" y="30" width="75" height="140" fill="#de1743" opacity="0.18" />
        <text x="426" y="42" fontSize="10.5" fill="#a81134">od 32 let plodnost klesá</text>
        <text x="551" y="42" fontSize="10.5" fill="#a81134">od 37 rychleji</text>
        <line x1="120" y1="170" x2="620" y2="170" stroke="#bcbcb0" strokeWidth="1" />
        <text x="120" y="185" textAnchor="middle" fontSize="11" fill="#777777">20</text>
        <text x="245" y="185" textAnchor="middle" fontSize="11" fill="#777777">25</text>
        <text x="370" y="185" textAnchor="middle" fontSize="11" fill="#777777">30</text>
        <text x="495" y="185" textAnchor="middle" fontSize="11" fill="#777777">35</text>
        <text x="620" y="185" textAnchor="middle" fontSize="11" fill="#777777">40</text>
        <text x="370" y="196" textAnchor="middle" fontSize="10" fill="#777777">věk matky</text>
        <text x="8" y="75" fontSize="12" fill="#333333" fontWeight="600">1990</text>
        <text x="8" y="90" fontSize="10" fill="#555555">průměr ČR</text>
        <rect x="156.7" y="55" width="50" height="28" rx="3" fill="#de1743" opacity="0.85" />
        <text x="181.7" y="73" textAnchor="middle" fontSize="11" fill="white" fontWeight="700">1.</text>
        <rect x="235.5" y="55" width="50" height="28" rx="3" fill="#4a51ab" opacity="0.75" />
        <text x="260.5" y="73" textAnchor="middle" fontSize="11" fill="white" fontWeight="700">2.</text>
        <line x1="181.7" y1="83" x2="181.7" y2="170" stroke="#de1743" strokeWidth="1" strokeDasharray="3,3" />
        <text x="181.7" y="105" textAnchor="middle" fontSize="12" fill="#de1743" fontWeight="700">22,5 roku</text>
        <text x="8" y="135" fontSize="12" fill="#333333" fontWeight="600">2024</text>
        <text x="8" y="150" fontSize="10" fill="#555555">průměr ČR</text>
        <rect x="320.0" y="115" width="50" height="28" rx="3" fill="#de1743" opacity="0.85" />
        <text x="345.0" y="133" textAnchor="middle" fontSize="11" fill="white" fontWeight="700">1.</text>
        <rect x="381.0" y="115" width="50" height="28" rx="3" fill="#4a51ab" opacity="0.75" />
        <text x="406.0" y="133" textAnchor="middle" fontSize="11" fill="white" fontWeight="700">2.</text>
        <line x1="345.0" y1="143" x2="345.0" y2="170" stroke="#de1743" strokeWidth="1" strokeDasharray="3,3" />
        <text x="345.0" y="165" textAnchor="middle" fontSize="12" fill="#de1743" fontWeight="700">29 let</text>
        <line x1="181.7" y1="58" x2="320.0" y2="58" stroke="#333333" strokeWidth="1.5" markerEnd="url(#arr)" />
        <text x="260.5" y="50" textAnchor="middle" fontSize="11" fill="#333333" fontStyle="italic">+6,5 roku za 34 let</text>
        <defs>
          <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#333333" />
          </marker>
        </defs>
      </svg>
    </ChartCard>
  );
}
