'use client';

import { useState } from 'react';
import VisualFrame from './VisualFrame';
import styles from './HealthcareVisuals.module.css';

export default function LongTermCareFlow() {
  const [year, setYear] = useState<2024 | 2050>(2024);
  const seniorShare = year === 2024 ? '20,7 %' : '29 %';
  const people = year === 2024 ? 10 : 14;
  return (
    <VisualFrame
      title="Po propuštění z nemocnice se tok péče rozpadá"
      subtitle="Schéma ukazuje, kdo přebírá každodenní práci. Šířka spojnic není objemem peněz; stát srovnatelný tok hodin péče dosud nezveřejňuje."
      source={<><a href="https://www.oecd.org/content/dam/oecd/en/publications/reports/2025/12/country-health-profile-2025-country-notes_7e72146d/czechia_e16c6d2d/7d087e31-en.pdf">OECD, Country Health Profile Czechia 2025</a>; <a href="https://csu.gov.cz/pocet-struktura-a-projekce-obyvatel">ČSÚ, projekce obyvatelstva</a></>}
    >
      <div className={styles.controls}>
        <button type="button" aria-pressed={year === 2024} onClick={() => setYear(2024)}>Dnes</button>
        <button type="button" aria-pressed={year === 2050} onClick={() => setYear(2050)}>Rok 2050</button>
      </div>
      <svg className={styles.flowSvg} viewBox="0 0 920 470" role="img" aria-label="Tok dlouhodobé péče">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#8b8e93" />
          </marker>
        </defs>
        <text x="40" y="42" fontSize="17" fontWeight="700" fill="#171a32">Lidé 65+: {seniorShare} populace</text>
        {Array.from({ length: people }, (_, index) => (
          <circle key={index} cx={48 + index * 24} cy="78" r="8" fill={index < 7 ? '#315f8c' : '#9db8ca'} />
        ))}
        <rect x="55" y="150" width="170" height="78" rx="8" fill="#315f8c" />
        <text x="140" y="181" textAnchor="middle" fontSize="17" fontWeight="700" fill="#fff">nemocnice</text>
        <text x="140" y="204" textAnchor="middle" fontSize="13" fill="#fff">akutní léčba končí</text>
        <path d="M225 189 C300 189 285 105 370 105" fill="none" stroke="#8b8e93" strokeWidth="6" markerEnd="url(#arrow)" />
        <path d="M225 189 C300 189 285 220 370 220" fill="none" stroke="#8b8e93" strokeWidth="6" markerEnd="url(#arrow)" />
        <path d="M225 189 C300 189 285 340 370 340" fill="none" stroke="#8b8e93" strokeWidth="6" markerEnd="url(#arrow)" />
        <rect x="380" y="62" width="225" height="86" rx="8" fill="#d7194b" />
        <text x="492" y="94" textAnchor="middle" fontSize="18" fontWeight="700" fill="#fff">rodina a blízcí</text>
        <text x="492" y="119" textAnchor="middle" fontSize="13" fill="#fff">péče, dohled, doprava, administrativa</text>
        <rect x="380" y="177" width="225" height="86" rx="8" fill="#b08000" />
        <text x="492" y="209" textAnchor="middle" fontSize="18" fontWeight="700" fill="#fff">terénní služby</text>
        <text x="492" y="234" textAnchor="middle" fontSize="13" fill="#fff">domácí sestra, pečovatelka, odlehčení</text>
        <rect x="380" y="297" width="225" height="86" rx="8" fill="#72777f" />
        <text x="492" y="329" textAnchor="middle" fontSize="18" fontWeight="700" fill="#fff">pobytová péče</text>
        <text x="492" y="354" textAnchor="middle" fontSize="13" fill="#fff">následná péče, domov, zařízení</text>
        <path d="M605 105 C685 105 690 188 760 188" fill="none" stroke="#d7194b" strokeWidth={year === 2050 ? 18 : 13} opacity=".65" />
        <path d="M605 220 C685 220 690 210 760 210" fill="none" stroke="#b08000" strokeWidth="8" opacity=".7" />
        <path d="M605 340 C685 340 690 232 760 232" fill="none" stroke="#72777f" strokeWidth="10" opacity=".7" />
        <rect x="760" y="153" width="125" height="112" rx="56" fill="#fff" stroke="#171a32" strokeWidth="3" />
        <text x="822" y="191" textAnchor="middle" fontSize="16" fontWeight="700" fill="#171a32">každodenní</text>
        <text x="822" y="214" textAnchor="middle" fontSize="16" fontWeight="700" fill="#171a32">potřeba péče</text>
        <text x="822" y="241" textAnchor="middle" fontSize="13" fill="#555">pokračuje</text>
        <text x="55" y="430" fontSize="16" fontWeight="700" fill="#d7194b">Česko: 13 % zdravotních výdajů na dlouhodobou péči</text>
        <text x="540" y="430" fontSize="16" fontWeight="700" fill="#315f8c">EU: 18 %</text>
      </svg>
      <div className={styles.note}>
        Přepínač mění demografický tlak, nikoli přesnou projekci toku služeb. ČSÚ očekává růst podílu lidí 65+ přibližně z 21 na 29 procent populace; rozdělení hodin mezi rodiny a formální služby stát v jednotné časové řadě nemá.
      </div>
    </VisualFrame>
  );
}
