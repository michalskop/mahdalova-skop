'use client';

import { useState } from 'react';
import VisualFrame from './VisualFrame';
import styles from './HealthcareVisuals.module.css';

const years = [2017, 2022, 2025, 2026] as const;
type Year = (typeof years)[number];

const descriptions: Record<Year, { title: string; text: string }> = {
  2017: { title: 'Síť buduje Boris Šťastný', text: 'Alzheimer Home je spojena s jejím zakladatelem a podnikatelským modelem péče o lidi s demencí.' },
  2022: { title: 'Prodej skupině Penta je dokončen', text: 'Vlastnická hrana se mění. Šťastný však podle veřejných dokumentů dál působí ve správních radách organizací sítě.' },
  2025: { title: 'Po volbách končí ve správních radách', text: 'V říjnu 2025 z funkcí odchází. Medical Investments zůstává samostatnou doloženou vazbou; rodinní příslušníci přebírají místa ve správní radě.' },
  2026: { title: 'Ve vládě rozhoduje o prevenci a zdraví', text: 'Minulá podnikatelská vazba není důkazem zvýhodnění. Novinářský test musí spojit konkrétní jednání, změnu pravidla a konkrétní prospěch.' },
};

export default function OwnershipNetwork() {
  const [year, setYear] = useState<Year>(2026);
  const afterSale = year >= 2022;
  const inGovernment = year >= 2026;
  const inBoards = year >= 2022 && year < 2025;
  return (
    <VisualFrame
      title="Vlastnictví, funkce a rozhodovací pravomoc nejsou totéž"
      subtitle="Časový přepínač odděluje vlastnické vztahy, působení v orgánech firem a politickou funkci. Hrany zobrazují jen doložené vztahy."
      source={<><a href="https://demagog.cz/vyrok/24450">Demagog.cz – časová osa Alzheimer Home</a>; <a href="https://www.irozhlas.cz/zpravy-domov/boris-stastny-motoriste-stret-zajmu-reseni_2511051207_kno">iROZHLAS – Medical Investments a správní rady</a>; <a href="https://www.psp.cz/eknih/2025ps/stenprot/014schuz/s014179.htm">PSP – SynBiol/Hartenberg</a>; <a href="https://uohs.gov.cz/download/sbirky_rozhodnuti/dokumenty/2014_S1114.pdf">ÚOHS – FutureLife/Hartenberg</a></>}
    >
      <div className={styles.controls}>
        {years.map(item => <button key={item} type="button" aria-pressed={year === item} onClick={() => setYear(item)}>{item}</button>)}
      </div>
      <svg className={styles.networkSvg} viewBox="0 0 920 500" role="img" aria-label={`Vlastnická síť v roce ${year}`}>
        <defs>
          <marker id="netArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#737781" />
          </marker>
        </defs>
        <line x1="180" y1="110" x2="440" y2="110" stroke={afterSale ? '#b5b2aa' : '#d7194b'} strokeWidth={afterSale ? 3 : 7} strokeDasharray={afterSale ? '8 7' : undefined} markerEnd="url(#netArrow)" />
        <text x="310" y="94" textAnchor="middle" fontSize="13" fill="#555">{afterSale ? 'bývalý vlastnický vztah' : 'zakladatel / vlastnický vztah'}</text>
        {afterSale && <line x1="720" y1="110" x2="540" y2="110" stroke="#315f8c" strokeWidth="7" markerEnd="url(#netArrow)" />}
        {afterSale && <text x="630" y="94" textAnchor="middle" fontSize="13" fill="#555">vlastnická kontrola</text>}
        {inBoards && <line x1="180" y1="145" x2="440" y2="145" stroke="#b08000" strokeWidth="5" markerEnd="url(#netArrow)" />}
        {inBoards && <text x="310" y="168" textAnchor="middle" fontSize="13" fill="#745b0b">funkce ve správních radách</text>}
        {inGovernment && <line x1="180" y1="260" x2="180" y2="375" stroke="#d7194b" strokeWidth="6" markerEnd="url(#netArrow)" />}
        {inGovernment && <text x="196" y="326" fontSize="13" fill="#555">člen vlády</text>}
        <g><circle cx="135" cy="110" r="66" fill="#d7194b" /><text x="135" y="103" textAnchor="middle" fontSize="18" fontWeight="700" fill="#fff">Boris</text><text x="135" y="127" textAnchor="middle" fontSize="18" fontWeight="700" fill="#fff">Šťastný</text></g>
        <g><rect x="410" y="55" width="170" height="110" rx="10" fill="#fff" stroke="#171a32" strokeWidth="3" /><text x="495" y="104" textAnchor="middle" fontSize="19" fontWeight="700" fill="#171a32">Alzheimer</text><text x="495" y="129" textAnchor="middle" fontSize="19" fontWeight="700" fill="#171a32">Home</text></g>
        {afterSale && <g><rect x="700" y="65" width="165" height="90" rx="10" fill="#315f8c" /><text x="782" y="118" textAnchor="middle" fontSize="21" fontWeight="700" fill="#fff">Penta</text></g>}
        {inGovernment && <g><rect x="55" y="385" width="250" height="76" rx="10" fill="#171a32" /><text x="180" y="416" textAnchor="middle" fontSize="16" fontWeight="700" fill="#fff">ministr pro sport,</text><text x="180" y="440" textAnchor="middle" fontSize="16" fontWeight="700" fill="#fff">prevenci a zdraví</text></g>}
        <line x1="480" y1="300" x2="690" y2="300" stroke="#315f8c" strokeWidth="7" markerEnd="url(#netArrow)" />
        <line x1="785" y1="340" x2="785" y2="412" stroke="#315f8c" strokeWidth="7" markerEnd="url(#netArrow)" />
        <g><rect x="315" y="255" width="175" height="90" rx="10" fill="#72777f" /><text x="402" y="309" textAnchor="middle" fontSize="19" fontWeight="700" fill="#fff">SynBiol</text></g>
        <g><rect x="680" y="255" width="210" height="90" rx="10" fill="#315f8c" /><text x="785" y="309" textAnchor="middle" fontSize="19" fontWeight="700" fill="#fff">Hartenberg</text></g>
        <g><rect x="680" y="412" width="210" height="70" rx="10" fill="#fff" stroke="#171a32" strokeWidth="3" /><text x="785" y="455" textAnchor="middle" fontSize="18" fontWeight="700" fill="#171a32">FutureLife</text></g>
        <text x="585" y="284" textAnchor="middle" fontSize="13" fill="#555">87,75 % podle citovaného</text>
        <text x="585" y="302" textAnchor="middle" fontSize="13" fill="#555">sněmovního vystoupení</text>
      </svg>
      <div className={styles.networkDetail}>
        <strong>{year}: {descriptions[year].title}</strong>
        <p>{descriptions[year].text}</p>
      </div>
      <div className={styles.note}>
        Diagram není seznam střetů zájmů. Rozlišuje vlastnictví, dřívější vlastnictví, funkci v orgánech společnosti a veřejnou rozhodovací pravomoc. Tvrzení o zvýhodnění vyžaduje další důkazní hranu.
      </div>
    </VisualFrame>
  );
}
