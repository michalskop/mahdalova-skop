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
      aria-label="Vývoj úhrnné plodnosti ve vybraných zemích 2000–2023"
    >
      <rect width="700" height="280" fill="#F7F6F2" />
      <line x1="70" y1="42" x2="590" y2="42" stroke="#ddd" strokeWidth="1" strokeDasharray="4,3" />
      <line x1="70" y1="93" x2="590" y2="93" stroke="#ddd" strokeWidth="1" strokeDasharray="4,3" />
      <line x1="70" y1="145" x2="590" y2="145" stroke="#ddd" strokeWidth="1" strokeDasharray="4,3" />
      <line x1="70" y1="196" x2="590" y2="196" stroke="#ddd" strokeWidth="1" strokeDasharray="4,3" />
      <line x1="70" y1="230" x2="590" y2="230" stroke="#ccc" strokeWidth="1" />
      <text x="62" y="46" textAnchor="end" fontSize="11" fill="#888">2,1</text>
      <text x="62" y="97" textAnchor="end" fontSize="11" fill="#888">1,8</text>
      <text x="62" y="149" textAnchor="end" fontSize="11" fill="#888">1,5</text>
      <text x="62" y="200" textAnchor="end" fontSize="11" fill="#888">1,2</text>
      <text x="70" y="248" textAnchor="middle" fontSize="11" fill="#888">2000</text>
      <text x="174" y="248" textAnchor="middle" fontSize="11" fill="#888">2005</text>
      <text x="278" y="248" textAnchor="middle" fontSize="11" fill="#888">2010</text>
      <text x="382" y="248" textAnchor="middle" fontSize="11" fill="#888">2015</text>
      <text x="486" y="248" textAnchor="middle" fontSize="11" fill="#888">2020</text>
      <text x="570" y="248" textAnchor="middle" fontSize="11" fill="#888">2023</text>
      <line x1="70" y1="42" x2="590" y2="42" stroke="#aaa" strokeWidth="1.5" strokeDasharray="6,4" />
      <polyline points="70,81 278,56 382,63 486,89 570,109" fill="none" stroke="#999" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="570" cy="109" r="3" fill="#999" />
      <text x="595" y="113" fontSize="11" fill="#999">Francie 1,72</text>
      <polyline points="70,138 278,64 382,85 486,117 570,153" fill="none" stroke="#4D2C62" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="278" cy="64" r="4" fill="#4D2C62" />
      <text x="282" y="56" fontSize="10" fill="#4D2C62">1,97</text>
      <circle cx="570" cy="153" r="3" fill="#4D2C62" />
      <text x="595" y="157" fontSize="11" fill="#4D2C62">Švédsko 1,45</text>
      <polyline points="278,187 382,153 486,129 570,127" fill="none" stroke="#d97706" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="570" cy="127" r="3" fill="#d97706" />
      <text x="595" y="131" fontSize="11" fill="#d97706">Maďarsko 1,60</text>
      <polyline points="70,206 174,182 278,147 382,133 486,109 570,155" fill="none" stroke="#D81B60" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="486" cy="109" r="4" fill="#D81B60" />
      <text x="490" y="101" fontSize="10" fill="#D81B60">1,71</text>
      <circle cx="570" cy="155" r="3" fill="#D81B60" />
      <text x="595" y="159" fontSize="11" fill="#D81B60">Česko 1,44</text>
      <text x="72" y="38" fontSize="10" fill="#aaa">2,10 – reprodukční hranice</text>
      <text x="70" y="270" fontSize="10" fill="#aaa">Zdroj: Eurostat demo_find; Statistics Sweden SCB; KSH; ČSÚ. Hodnoty za rok 2023.</text>
    </svg>
  );
}
