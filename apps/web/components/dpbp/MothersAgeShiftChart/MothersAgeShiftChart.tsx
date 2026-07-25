import ChartCard from '@/components/dpbp/ChartCard';

export default function MothersAgeShiftChart() {
  return (
    <ChartCard
      title="Průměrný věk matky při prvním porodu se v Česku posunul z 22 na 30,5 let"
      subtitle="1990–2023"
      source="[ČSÚ – Průměrný věk při prvním porodu](https://csu.gov.cz/produkty/oby_cr) · [OECD Family Database](https://www.oecd.org/en/data/datasets/oecd-family-database.html)"
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
        aria-label="Posun průměrného věku matky při prvním porodu v ČR z 22 let (1990) na 30,5 let (2023)"
      >
        <line x1="120" y1="170" x2="620" y2="170" stroke="#bcbcb0" strokeWidth="1" />
        <text x="120" y="185" textAnchor="middle" fontSize="11" fill="#777777">20</text>
        <text x="245" y="185" textAnchor="middle" fontSize="11" fill="#777777">25</text>
        <text x="370" y="185" textAnchor="middle" fontSize="11" fill="#777777">30</text>
        <text x="495" y="185" textAnchor="middle" fontSize="11" fill="#777777">35</text>
        <text x="620" y="185" textAnchor="middle" fontSize="11" fill="#777777">40</text>
        <text x="370" y="196" textAnchor="middle" fontSize="10" fill="#777777">věk matky</text>
        <text x="8" y="75" fontSize="12" fill="#333333" fontWeight="600">1990</text>
        <text x="8" y="90" fontSize="10" fill="#555555">průměr ČR</text>
        <rect x="120" y="55" width="50" height="28" rx="3" fill="#de1743" opacity="0.85" />
        <text x="145" y="73" textAnchor="middle" fontSize="11" fill="white" fontWeight="700">1.</text>
        <rect x="220" y="55" width="50" height="28" rx="3" fill="#4a51ab" opacity="0.75" />
        <text x="245" y="73" textAnchor="middle" fontSize="11" fill="white" fontWeight="700">2.</text>
        <line x1="145" y1="83" x2="145" y2="170" stroke="#de1743" strokeWidth="1" strokeDasharray="3,3" />
        <text x="145" y="105" textAnchor="middle" fontSize="12" fill="#de1743" fontWeight="700">22 let</text>
        <text x="8" y="135" fontSize="12" fill="#333333" fontWeight="600">2023</text>
        <text x="8" y="150" fontSize="10" fill="#555555">průměr ČR</text>
        <rect x="345" y="115" width="50" height="28" rx="3" fill="#de1743" opacity="0.85" />
        <text x="370" y="133" textAnchor="middle" fontSize="11" fill="white" fontWeight="700">1.</text>
        <rect x="445" y="115" width="50" height="28" rx="3" fill="#4a51ab" opacity="0.75" />
        <text x="470" y="133" textAnchor="middle" fontSize="11" fill="white" fontWeight="700">2.</text>
        <line x1="370" y1="143" x2="370" y2="170" stroke="#de1743" strokeWidth="1" strokeDasharray="3,3" />
        <text x="370" y="165" textAnchor="middle" fontSize="12" fill="#de1743" fontWeight="700">30,5 let</text>
        <line x1="145" y1="58" x2="345" y2="58" stroke="#333333" strokeWidth="1.5" markerEnd="url(#arr)" />
        <text x="245" y="50" textAnchor="middle" fontSize="11" fill="#333333" fontStyle="italic">+8 let za 33 let</text>
        <defs>
          <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#333333" />
          </marker>
        </defs>
      </svg>
    </ChartCard>
  );
}
